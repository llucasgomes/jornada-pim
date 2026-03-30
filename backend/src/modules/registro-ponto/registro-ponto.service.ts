import type { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '@/config/database'
import { resumo_diario } from '@/database/schemas'
import { AppError } from '@/shared/errors/AppError'


import { registroPontoRepository } from './registro-ponto.repository'

import { and, eq } from 'drizzle-orm'
import { userRepository } from '../user/user.repository'
import { calcularResumo } from './registro-ponto.utils'

// sequência obrigatória de batidas
const SEQUENCIA = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida'] as const

export const registroPontoService = {

  // POST /ponto — registra próxima batida do usuário autenticado
  async registrarBatida(req: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (req.user as { id: string }).id

    const usuario = await userRepository.findByUuid(usuarioId)
    if (!usuario) throw new AppError('Usuário não encontrado', 404)
    if (!usuario.ativo) throw new AppError('Usuário inativo', 403)
    if (usuario.perfil !== 'colaborador') throw new AppError('Apenas colaboradores podem registrar ponto', 403)

    const hoje = new Date().toISOString().split('T')[0]
    const batidasHoje = await registroPontoRepository.findByUsuarioEDia(usuarioId, hoje)
    const tiposRegistrados = batidasHoje.map(b => b.tipo)

    const proxima = SEQUENCIA.find(t => !tiposRegistrados.includes(t))
    if (!proxima) throw new AppError('Todas as batidas do dia já foram registradas', 400)

    const batida = await registroPontoRepository.create({
      usuario_id: usuarioId,
      tipo:       proxima,
      origem:     'sistema',
    })

    // recalcular e fazer upsert do resumo_diario
    await upsertResumoDiario(usuarioId, hoje, usuario)

    return reply.status(201).send(batida)
  },

  // GET /ponto/hoje — batidas e resumo do dia do usuário autenticado
  async buscarHoje(req: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (req.user as { id: string }).id
    const hoje = new Date().toISOString().split('T')[0]

    const batidas = await registroPontoRepository.findByUsuarioEDia(usuarioId, hoje)
    const tiposRegistrados = batidas.map(b => b.tipo)
    const proxima = SEQUENCIA.find(t => !tiposRegistrados.includes(t)) ?? null

    const [resumo] = await db
      .select()
      .from(resumo_diario)
      .where(
        and(
          eq(resumo_diario.usuario_id, usuarioId),
          eq(resumo_diario.data, hoje)
        )
      )
      .limit(1)

    return reply.status(200).send({ batidas, resumo: resumo ?? null, proxima_batida: proxima })
  },

  // GET /ponto/:usuario_id/historico?de=&ate=
  async buscarHistorico(req: FastifyRequest, reply: FastifyReply) {
    const { usuario_id } = req.params as { usuario_id: string }
    const { de, ate } = req.query as { de?: string; ate?: string }

    const hoje = new Date()
    const dataAte = ate ?? hoje.toISOString().split('T')[0]
    const dataInicio = new Date(hoje)
    dataInicio.setDate(dataInicio.getDate() - 30)
    const dataDe = de ?? dataInicio.toISOString().split('T')[0]

    const batidas = await registroPontoRepository.findByUsuarioEPeriodo(usuario_id, dataDe, dataAte)

    return reply.status(200).send(batidas)
  },

  // DELETE /ponto/:id — remove uma batida (apenas gestor/rh)
  async deletarBatida(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }

    const batida = await registroPontoRepository.findById(id)
    if (!batida) throw new AppError('Batida não encontrada', 404)

    await registroPontoRepository.delete(id)

    return reply.status(200).send({ message: 'Batida removida com sucesso' })
  },
}

// ─── helper interno ──────────────────────────────────────────────────────────

async function upsertResumoDiario(
  usuario_id: string,
  data: string,
  usuario: { carga_horaria_dia: number | null; horario_entrada: string | null }
) {
  const batidas = await registroPontoRepository.findByUsuarioEDia(usuario_id, data)

  const resumo = calcularResumo(
    batidas.map(b => ({ tipo: b.tipo, timestamp: new Date(b.timestamp) })),
    usuario.carga_horaria_dia ?? 480,
    usuario.horario_entrada ?? '08:00',
    new Date(data),
  )

  const [existe] = await db
    .select({ id: resumo_diario.id })
    .from(resumo_diario)
    .where(
      and(
        eq(resumo_diario.usuario_id, usuario_id),
        eq(resumo_diario.data, data)
      )
    )
    .limit(1)

  if (existe) {
    await db
      .update(resumo_diario)
      .set(resumo)
      .where(eq(resumo_diario.id, existe.id))
  } else {
    await db.insert(resumo_diario).values({ usuario_id, data, ...resumo })
  }
}