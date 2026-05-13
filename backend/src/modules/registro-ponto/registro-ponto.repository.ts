import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/config/database";
import { registroPonto } from "@/database/schemas";
import type { CreateRegistroPontoDto } from "./dtos/create-registro-ponto.dto";

const localDate = (col: unknown) => sql`DATE(datetime(${col}, '-4 hours'))`;

// Filtro global para ignorar registros com soft delete
const notDeleted = isNull(registroPonto.deletedAt);

export const registroPontoRepository = {
  async create(data: typeof registroPonto.$inferInsert) {
    const [result] = await db.insert(registroPonto).values(data).returning();
    return result;
  },

  async findByUsuarioEDia(usuarioEmpresaId: string, data: string) {
    return db
      .select()
      .from(registroPonto)
      .where(
        and(
          eq(registroPonto.usuarioEmpresaId, usuarioEmpresaId),
          sql`${localDate(registroPonto.timestamp)} = ${data}`,
          notDeleted,
        ),
      )
      .orderBy(registroPonto.timestamp);
  },

  async findByUsuarioEPeriodo(
    usuarioEmpresaId: string,
    de: string,
    ate: string,
  ) {
    return db
      .select()
      .from(registroPonto)
      .where(
        and(
          eq(registroPonto.usuarioEmpresaId, usuarioEmpresaId),
          sql`${localDate(registroPonto.timestamp)} >= ${de}`,
          sql`${localDate(registroPonto.timestamp)} <= ${ate}`,
          notDeleted,
        ),
      )
      .orderBy(desc(registroPonto.timestamp));
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(registroPonto)
      .where(and(eq(registroPonto.id, id), notDeleted))
      .limit(1);
    return result[0] ?? null;
  },

  /**
   * Soft delete — marca a batida com timestamp de exclusão ao invés de removê-la fisicamente.
   * Isso preserva o histórico para auditoria trabalhista.
   */
  async delete(id: string) {
    const [result] = await db
      .update(registroPonto)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(registroPonto.id, id))
      .returning();
    return result ?? null;
  },
};
