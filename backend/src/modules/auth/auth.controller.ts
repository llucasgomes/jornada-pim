import type { FastifyInstance } from 'fastify'
import {
  internalServerErrorSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
} from '@/shared/errors/errorSchemas'
import { authRequestSchema, authResponseSchema } from './auth.schema'
import { authService } from './auth.service'
import { userResponseDto } from '../user/user.dto'

import { z } from 'zod'

export default async function authController(server: FastifyInstance) {
  server.post(
    '/',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
      schema: {
        summary: 'Rota para login',
        tags: ['Login'],
        body: authRequestSchema,
        response: {
          200: authResponseSchema,
          400: validationErrorSchema,
          401: unauthorizedErrorSchema,
          429: z.object({
            statusCode: z.number(),
            error: z.string(),
            message: z.string(),
          }).describe('Muitas tentativas. Tente novamente em 15 minutos.'),
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
