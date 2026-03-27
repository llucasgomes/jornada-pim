import z from 'zod/v4'

export const authRequestSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  senha: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
})

export const authResponseSchema = z.object({
  message: z.string().min(1),
  token: z.string().min(1),
})
