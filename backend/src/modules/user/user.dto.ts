import z4 from "zod/v4";

export const createUserDto = z4.object({
  nome: z4.string().min(1, "O nome é obrigatório"),
  imageUrl: z4.string().optional(),
  cpf: z4
    .string()
    .min(11, "O CPF deve ter pelo menos 11 caracteres")
    .max(14, "O CPF deve ter no máximo 14 caracteres"),
  senha: z4.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});
export type CreateUserDtoType = z4.infer<typeof createUserDto>;

export const updateUserDto = createUserDto.partial();
export type UpdateUserDtoType = z4.infer<typeof updateUserDto>;

export const userResponseDto = z4.object({
  id: z4.uuid(),
  nome: z4.string(),
  cpf: z4.string(),
  imageUrl: z4.string().nullable().optional(),
  ativo: z4.coerce.boolean(),
  created_at: z4.string(),
  updated_at: z4.string(),
});

export type UserResponseDtoType = z4.infer<typeof userResponseDto>;