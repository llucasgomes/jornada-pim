import z4 from "zod/v4";

export const CreateEmpresaDto = z4.object({
  nome: z4.string().min(1, "Nome é obrigatório"),
  cnpj: z4.string().min(14, "CNPJ inválido"),
  logo: z4.string().optional(),
  razaoSocial: z4.string().optional(),
  email: z4.string().email().optional(),
  telefone: z4.string().optional(),
});
export type CreateUserDtoTypes = z4.infer<typeof CreateEmpresaDto>;

export const EmpresaResponseDto = z4.object({
  id: z4.string(),
  nome: z4.string(),
  cnpj: z4.string(),
  logo: z4.string().nullable().optional(),
  razao_social: z4.string().nullable().optional(),
  email: z4.string().nullable().optional(),
  telefone: z4.string().nullable().optional(),
  ativo: z4.boolean(),
  created_at: z4.string(),
  updated_at: z4.string(),
});
