import z from 'zod/v4'
import { origemBatidaEnumSchema, tipoBatidaEnumSchema } from '../enums'

export const registroPontoSchema = z.object({
  id: z.string().uuid().optional(),

  colaborador_id: z.string().uuid(),

  tipo: tipoBatidaEnumSchema,

  timestamp: z.coerce.date().optional(),

  origem: origemBatidaEnumSchema.default('sistema'),

  justificativa: z.string().optional(),

  registrado_por: z.string().uuid().optional(),
})
