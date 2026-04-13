import z4 from 'zod/v4'
import { tipoBatidaEnumSchema, origemBatidaEnumSchema } from '@/shared/schemas/enums'

export const registroPontoResponseDto = z4.object({
  id:             z4.uuid(),
  usuario_id:     z4.uuid(),
  tipo:           tipoBatidaEnumSchema,
  timestamp:      z4.coerce.date(),
  origem:         origemBatidaEnumSchema,
  justificativa:  z4.string().nullable().optional(),
  registrado_por: z4.uuid().nullable().optional(),
})

export type RegistroPontoResponseDto = z4.infer<typeof registroPontoResponseDto>