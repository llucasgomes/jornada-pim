import z4 from 'zod/v4'
import { perfilEnumSchema } from '@/shared/schemas/enums'

export const createUserDto = z4.object({
  nome: z4.string().min(1, 'O nome é obrigatório'),
  matricula: z4.string().min(1, 'A matrícula é obrigatória'),
  senha: z4.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  perfil: perfilEnumSchema
    .default('colaborador')
    .refine(val => ['colaborador', 'gestor', 'rh'].includes(val), {
      message:
        'Perfil inválido. Valores permitidos: colaborador, gestor, rh',
    }),
  setor: z4.string().min(1, 'O setor é obrigatório'),
})

export type CreateUserDto = z4.infer<typeof createUserDto>
