import { eq } from 'drizzle-orm'
import { db } from '@/config/database'
import { usuario } from '@/database/schemas'
import type { CreateUserDto } from './dtos/create-user.dto'

export const userRepository = {
  async create(data: CreateUserDto) {
    return await db.insert(usuario).values(data).returning()
  },

  async findAll() {
    return await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        matricula: usuario.matricula,
        perfil: usuario.perfil,
        setor: usuario.setor,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
      })
      .from(usuario)
  },

  async findById(matricula: string) {
    const result = await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        matricula: usuario.matricula,
        perfil: usuario.perfil,
        setor: usuario.setor,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
      })
      .from(usuario)
      .where(eq(usuario.matricula, matricula))
      .limit(1)

    return result[0] || null
  },
  //update user by matricula
  async update(matricuala: string, data: Partial<CreateUserDto>) {
    const result = await db
      .update(usuario)
      .set(data)
      .where(eq(usuario.matricula, matricuala))
      .returning()

    return result[0] || null
  },

  async delete(matricula: string) {
    const result = await db
      .delete(usuario)
      .where(eq(usuario.matricula, matricula))
      .returning()

    return result[0] || null
  },
}
