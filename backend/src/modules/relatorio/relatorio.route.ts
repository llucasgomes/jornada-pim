import type { FastifyInstance } from 'fastify'
import relatorioController from './relatorio.controller'

export default async function relatorioRoutes(server: FastifyInstance) {
  server.register(relatorioController, { prefix: '/relatorio' })
}
