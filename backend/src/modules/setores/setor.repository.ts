
import { db } from "@/config/database";
import { setor } from "@/database/schemas";
import { eq, and } from "drizzle-orm";

export const SetorRepository = {
  async create(data: typeof setor.$inferInsert) {
    return await db.insert(setor).values(data).returning();
  },

  async findAllByEmpresa(empresaId: string) {
    return await db.select().from(setor).where(eq(setor.empresaId, empresaId));
  },

  async findById(id: string) {
    const result = await db.select().from(setor).where(eq(setor.id, id));
    return result[0] || null;
  },

  async update(id: string, data: Partial<typeof setor.$inferInsert>) {
    return await db
      .update(setor)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(setor.id, id))
      .returning();
  },

  async delete(id: string) {
    return await db.delete(setor).where(eq(setor.id, id)).returning();
  },

  async findByNameInEmpresa(nome: string, empresaId: string) {
    const result = await db
      .select()
      .from(setor)
      .where(and(eq(setor.nome, nome), eq(setor.empresaId, empresaId)));
    return result[0] || null;
  }
}
