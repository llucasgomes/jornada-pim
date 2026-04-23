import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { dashboardService } from './dashboard.service'
import { permission } from '@/shared/middlewares/permission'
import { internalServerErrorSchema } from '@/shared/errors/errorSchemas'

export default async function dashboardRoutes(server: FastifyInstance) {
  server.get(
    '/stats',
    {
      preHandler: permission(['gestor', 'rh']),
      schema: {
        summary: 'Retorna estatísticas para o dashboard',
        tags: ['Dashboard'],
        response: {
          200: z.object({
            totalColaboradores: z.number(),
            ativos: z.number(),
            presentesHoje: z.number(),
            horasExtrasMes: z.string(),
            atrasosMesMinutos: z.number(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    async () => {
      return await dashboardService.getStats()
    }
  )
}
