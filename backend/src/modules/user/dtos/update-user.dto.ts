import { createUserDto } from './create-user.dto'

export const updateUserDto = createUserDto
  .omit({ senha: true })   // senha tem rota própria se quiser no futuro
  .partial()

export type UpdateUserDto = typeof updateUserDto