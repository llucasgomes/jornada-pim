import z4 from "zod/v4";
import { perfilEnumSchema, turnoEnumSchema } from "@/shared/schemas/enums";

export const createUsuarioEmpresaDto = z4.object({
  cpf: z4.string(),
  nome: z4.string().optional(),

  empresaId: z4.string(),

  cargo: z4.string().nullable().optional(),
  setor: z4.string().nullable().optional(),

  perfil: perfilEnumSchema.default("colaborador"),

  turno: turnoEnumSchema.nullable().optional(),

  cargaHorariaDia: z4.number().nullable().optional(),
  horarioEntrada: z4.string().nullable().optional(),
  horarioSaida: z4.string().nullable().optional(),
});

export type CreateUsuarioEmpresaDto = z4.infer<typeof createUsuarioEmpresaDto>;

export const usuarioEmpresaResponseDto = z4.object({
  id: z4.uuid(),
  usuarioId: z4.string(),
  empresaId: z4.string(),
  matricula: z4.string(),

  cargo: z4.string().nullable().optional(),
  setor: z4.string().nullable().optional(),
  perfil: perfilEnumSchema,

  turno: turnoEnumSchema.nullable().optional(),

  cargaHorariaDia: z4.number().nullable().optional(),
  horarioEntrada: z4.string().nullable().optional(),
  horarioSaida: z4.string().nullable().optional(),

  ativo: z4.coerce.boolean(),
  createdAt: z4.string(),
  updatedAt: z4.string().nullable().optional(),
});

export type UsuarioEmpresaResponseDto = z4.infer<
  typeof usuarioEmpresaResponseDto
>;
