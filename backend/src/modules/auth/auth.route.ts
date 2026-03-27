import type { FastifyInstance } from 'fastify'
import authController from './auth.controller'

export default async function authRoutes(server: FastifyInstance) {
  server.register(authController, { prefix: '/login' })
}
