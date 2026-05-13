import type { FastifyInstance } from 'fastify'
import uploadController from './upload.controller'

export default function uploadRoutes(_server: FastifyInstance) {
  _server.register(uploadController, { prefix: '/upload' })
}
