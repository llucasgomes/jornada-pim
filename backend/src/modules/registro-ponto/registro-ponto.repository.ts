import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '@/config/database'
import { registro_ponto } from '@/database/schemas'
import type { CreateRegistroPontoDto } from './dtos/create-registro-ponto.dto'

export const registroPontoRepository = {
  async create(data: CreateRegistroPontoDto) {
    const [result] = await db
      .insert(registro_ponto)
      .values(data)
      .returning()
    return result
  },

  // busca todas as batidas de um usuário em um dia específico
  async findByUsuarioEDia(usuario_id: string, data: string) {
    return db
      .select()
      .from(registro_ponto)
      .where(
        and(
          eq(registro_ponto.usuario_id, usuario_id),
          sql`DATE(${registro_ponto.timestamp} AT TIME ZONE 'America/Manaus') = ${data}`
        )
      )
      .orderBy(registro_ponto.timestamp)
  },

  // busca histórico por período
  async findByUsuarioEPeriodo(usuario_id: string, de: string, ate: string) {
    return db
      .select()
      .from(registro_ponto)
      .where(
        and(
          eq(registro_ponto.usuario_id, usuario_id),
          gte(sql`DATE(${registro_ponto.timestamp} AT TIME ZONE 'America/Manaus')`, de),
          lte(sql`DATE(${registro_ponto.timestamp} AT TIME ZONE 'America/Manaus')`, ate)
        )
      )
      .orderBy(desc(registro_ponto.timestamp))
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(registro_ponto)
      .where(eq(registro_ponto.id, id))
      .limit(1)
    return result[0] ?? null
  },

  async delete(id: string) {
    const result = await db
      .delete(registro_ponto)
      .where(eq(registro_ponto.id, id))
      .returning()
    return result[0] ?? null
  },
}