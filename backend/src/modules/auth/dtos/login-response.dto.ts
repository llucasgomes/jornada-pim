import z from 'zod/v4'

export const loginResponseDTO = z.object({
  message: z.string().min(1),
  token: z.string().min(1),
})
