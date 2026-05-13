import { faker } from '@faker-js/faker/locale/pt_BR'
import bcrypt from 'bcryptjs'

import {
  empresa,
  registroPonto,
  resumoDiario,
  usuario,
  usuarioEmpresa,
} from '../../database/schemas'
import { db } from '../../config/database'
import { calcularResumo } from '../../modules/registro-ponto/registro-ponto.utils'

faker.seed(42)

const SETORES = ['Produção', 'Montagem', 'Logística', 'Qualidade', 'Manutenção']

const CARGOS = [
  'Operador de produção',
  'Auxiliar de montagem',
  'Técnico de manutenção',
  'Analista de qualidade',
  'Auxiliar de logística',
  'Supervisor de linha',
  'Inspetor de qualidade',
]

const TURNOS = [
  { turno: 'manha' as const, entrada: '07:00', saida: '16:00', carga: 8.0 },
  { turno: 'tarde' as const, entrada: '15:00', saida: '23:00', carga: 8.0 },
  { turno: 'noite' as const, entrada: '23:00', saida: '07:00', carga: 8.0 },
  { turno: 'administrativo' as const, entrada: '08:00', saida: '17:00', carga: 8.0 },
]

function matricula(index: number) {
  return `PIM-${String(index).padStart(4, '0')}`
}

function gerarCPF(): string {
  const n = () => Math.floor(Math.random() * 10)
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000)
}

function setTime(base: Date, timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

function diasUteisDoMes(ano: number, mes: number): Date[] {
  const dias: Date[] = []
  const total = new Date(ano, mes, 0).getDate()
  for (let d = 1; d <= total; d++) {
    const dia = new Date(ano, mes - 1, d)
    if (dia.getDay() !== 0 && dia.getDay() !== 6) dias.push(dia)
  }
  return dias
}



async function seed() {
  const SENHA_HASH = await bcrypt.hash('123456789', 10)

  console.log('Limpando tabelas...')
  await db.delete(resumoDiario)
  await db.delete(registroPonto)
  await db.delete(usuarioEmpresa)
  await db.delete(usuario)
  await db.delete(empresa)

  // ── 0. Empresa ─────────────────────────────────────────────────────────────
  console.log('Criando empresa...')
  const [empresaCriada] = await db
    .insert(empresa)
    .values({
      nome: 'Grupo Comercial CII',
      cnpj: '12.345.678/0001-99',
      razaoSocial: 'CII Indústria e Comércio Ltda',
      email: 'contato@grupocii.com.br',
      telefone: '(92) 3000-0000',
      sequencialMatricula: 23,
    })
    .returning({ id: empresa.id })

  const empresaId = empresaCriada.id

  // ── 1. Gestores e RH ──────────────────────────────────────────────────────
  console.log('Criando gestores e RH...')

  const adminUsers = [
    { nome: 'Juliana Rocha Tavares', cpf: '123.456.789-01', perfil: 'gestor' as const, mat: matricula(901), setor: 'Produção', cargo: 'Gerente de Operações' },
    { nome: 'Marcelo Andrade Pinto', cpf: '123.456.789-02', perfil: 'gestor' as const, mat: matricula(902), setor: 'Montagem', cargo: 'Gerente de Operações' },
    { nome: 'Ana Paula Meireles', cpf: '123.456.789-03', perfil: 'rh' as const, mat: matricula(903), setor: 'RH', cargo: 'Analista de RH' },
    { nome: 'Carlos Silva', cpf: '123.456.789-04', perfil: 'colaborador' as const, mat: matricula(904), setor: 'Administrativo', cargo: 'Auxiliar Administrativo' },
  ]

  for (const u of adminUsers) {
    const [created] = await db
      .insert(usuario)
      .values({ nome: u.nome, cpf: u.cpf, senha: SENHA_HASH })
      .returning({ id: usuario.id })

    await db.insert(usuarioEmpresa).values({
      usuarioId: created.id,
      empresaId,
      matricula: u.mat,
      perfil: u.perfil,
      cargo: u.cargo,
      setor: u.setor,
      turno: 'administrativo',
      cargaHorariaDia: 8.0,
      horarioEntrada: '08:00',
      horarioSaida: '17:00',
    })
  }

  // ── 2. Colaboradores ──────────────────────────────────────────────────────
  console.log('Criando 20 colaboradores...')

  const colaboradoresCriados: Array<{
    vinculoId: string
    turnoConfig: (typeof TURNOS)[number]
  }> = []

  for (let i = 0; i < 20; i++) {
    const turnoConfig = faker.helpers.arrayElement(TURNOS)

    const [novoUsuario] = await db
      .insert(usuario)
      .values({
        nome: faker.person.fullName(),
        cpf: gerarCPF(),
        senha: SENHA_HASH,
      })
      .returning({ id: usuario.id })

    const [vinculo] = await db
      .insert(usuarioEmpresa)
      .values({
        usuarioId: novoUsuario.id,
        empresaId,
        matricula: matricula(i + 1),
        perfil: 'colaborador',
        cargo: faker.helpers.arrayElement(CARGOS),
        setor: faker.helpers.arrayElement(SETORES),
        turno: turnoConfig.turno,
        cargaHorariaDia: turnoConfig.carga,
        horarioEntrada: turnoConfig.entrada,
        horarioSaida: turnoConfig.saida,
      })
      .returning({ id: usuarioEmpresa.id })

    colaboradoresCriados.push({ vinculoId: vinculo.id, turnoConfig })
  }

  // ── 3. Histórico — últimos 2 meses ────────────────────────────────────────
  console.log('Gerando histórico de ponto...')

  const hoje = new Date()
  const meses = [
    { ano: hoje.getFullYear(), mes: hoje.getMonth() },
    { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 },
  ]

  for (const { vinculoId, turnoConfig } of colaboradoresCriados) {
    for (const { ano, mes } of meses) {
      const dias = diasUteisDoMes(ano, mes)

      for (const dia of dias) {
        if (dia > hoje) continue

        if (faker.datatype.boolean({ probability: 0.1 })) {
          await db.insert(resumoDiario).values({
            usuarioEmpresaId: vinculoId,
            data: dia.toISOString().split('T')[0],
            horasTrabalhadas: 0,
            horasEsperadas: turnoConfig.carga,
            horasExtras: 0,
            atrasoMinutos: 0,
            status: 'falta',
          })
          continue
        }

        const atrasoMin = faker.datatype.boolean({ probability: 0.3 })
          ? faker.number.int({ min: 5, max: 20 })
          : 0

        const entrada = addMinutes(setTime(dia, turnoConfig.entrada), atrasoMin)
        const inicioIntervalo = addMinutes(
          entrada,
          faker.number.int({ min: 230, max: 250 })
        )
        const fimIntervalo = addMinutes(
          inicioIntervalo,
          faker.number.int({ min: 55, max: 65 })
        )

        const extraMin = faker.datatype.boolean({ probability: 0.2 })
          ? faker.number.int({ min: 30, max: 90 })
          : 0

        const saida = addMinutes(fimIntervalo, turnoConfig.carga - 240 + extraMin)
        const incompleto = faker.datatype.boolean({ probability: 0.05 })

        const batidas = [
          { tipo: 'entrada', timestamp: entrada },
          { tipo: 'saida_almoco', timestamp: inicioIntervalo },
          { tipo: 'retorno_almoco', timestamp: fimIntervalo },
          ...(!incompleto ? [{ tipo: 'saida', timestamp: saida }] : []),
        ]

        await db.insert(registroPonto).values(
          batidas.map(b => ({
            usuarioEmpresaId: vinculoId,
            tipo: b.tipo as any,
            timestamp: b.timestamp.toISOString(),
            origem: 'sistema' as const,
          }))
        )

        const resumo = calcularResumo(
          batidas,
          turnoConfig.carga,
          turnoConfig.entrada,
          dia
        )

        await db.insert(resumoDiario).values({
          usuarioEmpresaId: vinculoId,
          data: dia.toISOString().split('T')[0],
          ...resumo,
        })
      }
    }
  }

  console.log('Seed concluído.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Erro no seed:', err)
  process.exit(1)
})
