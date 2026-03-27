import z4 from 'zod/v4'
import { perfilEnumSchema } from '@/shared/schemas/enums'

export const createUserResponseDto = z4.object({
  id: z4.uuid().optional(),

  nome: z4.string().min(1),
  matricula: z4.string().min(1),

  perfil: perfilEnumSchema,
  setor: z4.string().min(1),

  created_at: z4.coerce.date().optional(),
  updated_at: z4.coerce.date().optional(),
})

export const userResponseDto = createUserResponseDto.partial()

export type CreateUserResponseDto = z4.infer<typeof createUserResponseDto>
export type UserResponseDto = z4.infer<typeof userResponseDto>
