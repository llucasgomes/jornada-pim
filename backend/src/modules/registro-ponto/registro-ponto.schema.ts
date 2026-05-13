import {
  origemBatidaEnumSchema,
  tipoBatidaEnumSchema,
} from '@/shared/schemas/enums'
import z from 'zod/v4'

export const registroPontoSchema = z.object({
  id: z.string().uuid().optional(),

  colaborador_id: z.string().uuid(),

  tipo: tipoBatidaEnumSchema,

  timestamp: z.coerce.date().optional(),

  origem: origemBatidaEnumSchema.default('sistema'),

  justificativa: z.string().optional(),

  registrado_por: z.string().uuid().optional(),
})
