import z from 'zod/v4'

export const loginDTO = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  senha: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
})
