import z4 from 'zod/v4'
import { perfilEnumSchema, turnoEnumSchema } from '@/shared/schemas/enums'

export const userResponseDto = z4.object({
  id: z4.uuid(),
  nome: z4.string(),
  matricula: z4.string(),
  perfil: perfilEnumSchema,
  cargo: z4.string().nullable().optional(),
  setor: z4.string().nullable().optional(),
  turno: turnoEnumSchema.nullable().optional(),
  carga_horaria_dia: z4.number().nullable().optional(),
  horario_entrada: z4.string().nullable().optional(),
  horario_saida: z4.string().nullable().optional(),
  ativo: z4.boolean(),
  created_at: z4.coerce.date(),
  updated_at: z4.coerce.date(),
})

export type UserResponseDto = z4.infer<typeof userResponseDto>
