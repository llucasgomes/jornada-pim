import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from './AppError'

export const globalErrorHandler = (
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  // 🔥 Erro de validação do Zod
  if (error instanceof ZodError) {
    const errors = error.issues.map(err => err.message)

    return reply.status(400).send({
      statusCode: 400,
      errors,
    })
  }

  // 🔥 Erro padrão do Fastify (fallback de validação)
  if ((error as any).validation) {
    const errors = (error as any).validation.map((err: any) => err.message)

    return reply.status(400).send({
      statusCode: 400,
      errors,
    })
  }

  // 🔴 erro de negócio (login, regras, etc)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: getErrorName(error.statusCode),
      message: error.message,
    })
  }
}

// helper
const getErrorName = (statusCode: number): string => {
  const map: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
  }

  return map[statusCode] || 'Error'
}
