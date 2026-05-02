import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/config/database";
import { registroPonto } from "@/database/schemas/sqlite";
import type { CreateRegistroPontoDto } from "./dtos/create-registro-ponto.dto";

const localDate = (col: unknown) => sql`DATE(datetime(${col}, '-4 hours'))`;

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
        ),
      )
      .orderBy(desc(registroPonto.timestamp));
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(registroPonto)
      .where(eq(registroPonto.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async delete(id: string) {
    const result = await db
      .delete(registroPonto)
      .where(eq(registroPonto.id, id))
      .returning();
    return result[0] ?? null;
  },
};
