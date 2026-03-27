import type { FastifyInstance } from 'fastify'
import userController from './user.controller'

export default function userRoutes(_server: FastifyInstance) {
  _server.register(userController, { prefix: '/user' })
}
