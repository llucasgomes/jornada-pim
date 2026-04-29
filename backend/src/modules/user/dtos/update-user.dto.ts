import { createUserDto } from './create-user.dto'

export const updateUserDto = createUserDto.omit({ senha: true }).partial()

export type UpdateUserDto = typeof updateUserDto
