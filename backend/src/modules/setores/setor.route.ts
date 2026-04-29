import type { FastifyInstance } from 'fastify'
import setorController from './setor.controller'



export default async function setorRoutes(server: FastifyInstance) {
  server.register(setorController, { prefix: '/setor' })
}
