import z4 from 'zod/v4'
import { perfilEnumSchema, turnoEnumSchema } from '@/shared/schemas/enums'

export const createUserDto = z4.object({
  nome: z4.string().min(1, 'O nome é obrigatório'),
  matricula: z4.string().min(1, 'A matrícula é obrigatória'),
  senha: z4.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  perfil: perfilEnumSchema.default('colaborador'),
  cargo: z4.string().min(1).optional(),
  setor: z4.string().min(1).optional(),
  turno: turnoEnumSchema.optional(),
  carga_horaria_dia: z4.number().int().min(240).max(720).optional(),
  horario_entrada: z4
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')
    .optional(),
  horario_saida: z4
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')
    .optional(),
  ativo: z4.boolean().default(true),
})

export type CreateUserDto = z4.infer<typeof createUserDto>
