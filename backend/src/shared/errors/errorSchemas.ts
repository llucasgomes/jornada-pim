import { z } from 'zod'

// 🔴 Erro genérico
export const errorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
})

// 🔴 Erro de validação (Zod)
export const validationErrorSchema = z.object({
  statusCode: z.literal(400),
  errors: z.array(z.string()),
})

// 🔴 Não autorizado
export const unauthorizedErrorSchema = z.object({
  statusCode: z.literal(401),
  error: z.literal('Unauthorized'),
  message: z.string().optional(),
})

// 🔴 Proibido
export const forbiddenErrorSchema = z.object({
  statusCode: z.literal(403),
  error: z.literal('Forbidden'),
  message: z.string().optional(),
})

// 🔴 Não encontrado
export const notFoundErrorSchema = z.object({
  statusCode: z.literal(404),
  error: z.literal('Not Found'),
  message: z.string(),
})

// 🔴 Conflito (ex: duplicado)
export const conflictErrorSchema = z.object({
  statusCode: z.literal(409),
  error: z.literal('Conflict'),
  message: z.string(),
})

// 🔴 Erro interno
export const internalServerErrorSchema = z.object({
  statusCode: z.literal(500),
  error: z.literal('Internal Server Error'),
  message: z.string().optional(),
})
