import { turnoEnumSchema } from '@/shared/schemas/enums'
import z from 'zod/v4'

export const colaboradorSchema = z.object({
  id: z.string().uuid().optional(),

  nome: z.string().min(1),
  matricula: z.string().min(1),
  cargo: z.string().min(1),
  setor: z.string().min(1),

  turno: turnoEnumSchema,

  carga_horaria_dia: z.coerce.number(),

  horario_entrada: z.string(), // "HH:mm:ss"
  horario_saida: z.string(),

  ativo: z.boolean().default(true),

  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})
