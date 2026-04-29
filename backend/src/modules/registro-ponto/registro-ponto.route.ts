import type { FastifyInstance } from 'fastify'
import { registroPontoController } from './registro-ponto.controller'

export default function registroPontoRoutes(_server: FastifyInstance) {
  _server.register(registroPontoController, { prefix: '/ponto' })
}
