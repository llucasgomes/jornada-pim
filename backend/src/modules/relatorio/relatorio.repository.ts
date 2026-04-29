import { db } from '@/config/database'
import { usuario } from '@/database/schemas/sqlite'
import { and, eq } from 'drizzle-orm'

export const relatorioRepository = {
  async findActiveBySetor(setor: string) {
    return db
      .select()
      .from(usuario)
      .where(and(eq(usuario.ativo, true), eq(usuario.setor, setor)))
  },
}
