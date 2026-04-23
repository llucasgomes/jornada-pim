import type { FastifyInstance } from 'fastify'
import {
  internalServerErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from '@/shared/errors/errorSchemas'
import { authRequestSchema, authResponseSchema } from './auth.schema'
import { authService } from './auth.service'
import { userResponseDto } from '../user/dtos/user-response'

export default async function authController(server: FastifyInstance) {
  server.post(
    '/',
    {
      schema: {
        summary: 'Rota para login',
        tags: ['Login'],
        body: authRequestSchema,
        response: {
          200: authResponseSchema,
          400: validationErrorSchema,
          401: unauthorizedErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    authService.login
  )

  server.get(
    '/me',
    {
      schema: {
        summary: 'Retorna os dados do usuário logado',
        tags: ['Login'],
        response: {
          200: userResponseDto,
          401: unauthorizedErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    authService.getMe
  )
}
