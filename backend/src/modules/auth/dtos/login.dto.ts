import z from 'zod/v4'

export const loginDTO = z.object({
  cpf: z.string().min(11, 'O CPF deve ter pelo menos 11 caracteres').max(14, 'O CPF deve ter no máximo 14 caracteres').describe('formato xxx.xxx.xxx-xx'),
  senha: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
})
