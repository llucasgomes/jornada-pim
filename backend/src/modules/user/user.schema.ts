import z from 'zod/v4'
import { perfilEnumSchema } from '@/shared/schemas/enums'

export const usuarioSchema = z.object({
  id: z.string().uuid().optional(),

  nome: z.string().min(1),
  matricula: z.string().min(1),
  senha: z.string().min(6),

  perfil: perfilEnumSchema.default('colaborador'),
  setor: z.string().min(1),

  ativo: z.boolean().default(true),

  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})

export const userRequestSchema = z.object({
  nome: z.string().min(1),
  matricula: z.string().min(1),
  senha: z.string().min(6),

  perfil: perfilEnumSchema.default('colaborador'),
  setor: z.string().min(1),
})

export const userResponseSchema = z.object({
  id: z.uuid().optional(),

  nome: z.string().min(1),
  matricula: z.string().min(1),
  senha: z.string().min(6),

  perfil: perfilEnumSchema,
  setor: z.string().min(1),

  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
})
