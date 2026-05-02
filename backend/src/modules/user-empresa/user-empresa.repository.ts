import { db } from "@/config/database";
import { usuarioEmpresa } from "@/database/schemas/sqlite";
import { eq, and } from "drizzle-orm";

export const userEmpresaRepository = {
  async create(data: typeof usuarioEmpresa.$inferInsert) {
    const [result] = await db.insert(usuarioEmpresa).values(data).returning();
    return result;
  },
  async findActiveByUser(usuarioId: string) {
    return db
      .select()
      .from(usuarioEmpresa)
      .where(
        and(
          eq(usuarioEmpresa.usuarioId, usuarioId),
          eq(usuarioEmpresa.ativo, true),
        ),
      );
  },
  async findByEmpresa(empresaId: string) {
    return db
      .select()
      .from(usuarioEmpresa)
      .where(eq(usuarioEmpresa.empresaId, empresaId));
  },
  async findByUserAndEmpresa(usuarioId: string, empresaId: string) {
    const [result] = await db
      .select()
      .from(usuarioEmpresa)
      .where(
        and(
          eq(usuarioEmpresa.usuarioId, usuarioId),
          eq(usuarioEmpresa.empresaId, empresaId),
        ),
      )
      .limit(1);
    return result ?? null;
  },

  async deactivate(id: string) {
    const [result] = await db
      .update(usuarioEmpresa)
      .set({ ativo: false, updatedAt: new Date().toISOString() })
      .where(eq(usuarioEmpresa.id, id))
      .returning();
    return result;
  },

  async findUsersByEmpresaAndSetor(empresaId: string, setor: string) {
    return db
      .select()
      .from(usuarioEmpresa)
      .where(
        and(
          eq(usuarioEmpresa.empresaId, empresaId),
          eq(usuarioEmpresa.setor, setor),
          eq(usuarioEmpresa.ativo, true),
        ),
      );
  },

  async findUsersByEmpresa(empresaId: string) {
    return db
      .select()
      .from(usuarioEmpresa)
      .where(
        and(
          eq(usuarioEmpresa.empresaId, empresaId),
          eq(usuarioEmpresa.ativo, true),
        ),
      );
  },
};
