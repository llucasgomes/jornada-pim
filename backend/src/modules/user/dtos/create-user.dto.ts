import { perfilEnumSchema, turnoEnumSchema } from '@/shared/schemas/enums'
import z4 from 'zod/v4'

export const createUserDto = z4.object({
  nome: z4.string().min(1, 'O nome é obrigatório'),
  // matricula: z4.string().min(1, 'A matrícula é obrigatória'),
  senha: z4.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  perfil: perfilEnumSchema.default('colaborador'),
  cargo: z4.string().min(1).nullable().optional(),
  setor: z4.string().min(1).nullable().optional(),
  turno: turnoEnumSchema.nullable().optional(),
  carga_horaria_dia: z4
    .number()
    .int()
    .min(240, ' carga horária deve ser entre 240 e 720 minutos')
    .max(720, 'A carga horária deve ser entre 240 e 720 minutos')
    .nullable()
    .optional(),
  horario_entrada: z4
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')
    .nullable()
    .optional(),
  horario_saida: z4
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato HH:MM')
    .nullable()
    .optional(),
  ativo: z4.boolean().default(true),
})

export type CreateUserDto = z4.infer<typeof createUserDto>
