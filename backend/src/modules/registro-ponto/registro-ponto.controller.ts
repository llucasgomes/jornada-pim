import type { FastifyInstance } from 'fastify'
import z4 from 'zod/v4'
import { tipoBatidaEnumSchema } from '@/shared/schemas/enums'

import { registroPontoService } from './registro-ponto.service'
import { internalServerErrorSchema } from '@/shared/errors/errorSchemas'


export async function registroPontoController(server: FastifyInstance) {

  // POST /ponto — registra próxima batida (colaborador autenticado)
  server.post('/', {
    schema: {
      summary: 'Registra a próxima batida do colaborador autenticado',
      tags: ['Ponto'],
      response: {
        201: z4.object({
          id:         z4.uuid(),
          usuario_id: z4.uuid(),
          tipo:       tipoBatidaEnumSchema,
          timestamp:  z4.coerce.date(),
          origem:     z4.string(),
        }),
        400: z4.object({ statusCode: z4.literal(400), message: z4.string() }),
        403: z4.object({ statusCode: z4.literal(403), message: z4.string() }),
        500: internalServerErrorSchema,
      },
    },
  }, registroPontoService.registrarBatida)

  // GET /ponto/hoje — batidas e resumo do dia
  server.get('/hoje', {
    schema: {
      summary: 'Retorna batidas e resumo do dia do colaborador autenticado',
      tags: ['Ponto'],
      response: {
        200: z4.object({
          batidas:        z4.array(z4.any()),
          resumo:         z4.any().nullable(),
          proxima_batida: tipoBatidaEnumSchema.nullable(),
        }),
        500: internalServerErrorSchema,
      },
    },
  }, registroPontoService.buscarHoje)

  // GET /ponto/:usuario_id/historico?de=&ate=
  server.get('/:usuario_id/historico', {
    schema: {
      summary: 'Retorna histórico de ponto por período',
      tags: ['Ponto'],
      params: z4.object({
        usuario_id: z4.string().uuid(),
      }),
      querystring: z4.object({
        de:  z4.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        ate: z4.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
      response: {
        200: z4.array(z4.any()),
        500: internalServerErrorSchema,
      },
    },
  }, registroPontoService.buscarHistorico)

  // GET /ponto/:usuario_id/relatorio-mensal?mes=&ano=
  server.get('/:usuario_id/relatorio-mensal', {
    schema: {
      summary: 'Retorna relatório mensal consolidado',
      tags: ['Ponto'],
      params: z4.object({
        usuario_id: z4.string().uuid(),
      }),
      querystring: z4.object({
        mes: z4.string().optional(),
        ano: z4.string().optional(),
      }),
      response: {
        200: z4.array(z4.any()),
        500: internalServerErrorSchema,
      },
    },
  }, registroPontoService.buscarRelatorioMensal)

  // DELETE /ponto/:id — remove batida (gestor/rh)
  server.delete('/:id', {
    schema: {
      summary: 'Remove uma batida de ponto',
      tags: ['Ponto'],
      params: z4.object({
        id: z4.uuid(),
      }),
      response: {
        200: z4.object({ message: z4.string() }),
        404: z4.object({ statusCode: z4.literal(404), message: z4.string() }),
        500: internalServerErrorSchema,
      },
    },
  }, registroPontoService.deletarBatida)
}