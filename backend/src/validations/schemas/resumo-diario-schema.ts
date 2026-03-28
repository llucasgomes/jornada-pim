import z from 'zod/v4'
import { statusDiaEnumSchema } from '../enums'

export const resumoDiarioSchema = z.object({
  id: z.string().uuid().optional(),

  colaborador_id: z.string().uuid(),

  data: z.coerce.date(),

  horas_trabalhadas: z.coerce.number().default(0),
  horas_esperadas: z.coerce.number(),
  horas_extras: z.coerce.number().default(0),

  atraso_minutos: z.number().int().default(0),

  status: statusDiaEnumSchema.default('incompleto'),
})
