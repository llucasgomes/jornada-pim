import z4 from 'zod/v4'
import { tipoBatidaEnumSchema, origemBatidaEnumSchema } from '@/shared/schemas/enums'

export const createRegistroPontoDto = z4.object({
  usuario_id:     z4.uuid('ID inválido'),
  tipo:           tipoBatidaEnumSchema,
  origem:         origemBatidaEnumSchema.default('sistema'),
  justificativa:  z4.string().min(1).optional(),
  registrado_por: z4.string().uuid().optional(),
})
.refine(data => {
  if (data.origem === 'ajuste' && !data.justificativa) return false
  return true
}, {
  message: 'Justificativa é obrigatória quando origem é ajuste',
})

export type CreateRegistroPontoDto = z4.infer<typeof createRegistroPontoDto>