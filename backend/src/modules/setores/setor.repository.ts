import { db } from "@/config/database";
import { setor } from "@/database/schemas/sqlite";
import { eq } from "drizzle-orm";

export const setorRepository = {
  async findAll() {
    return db.select().from(setor).where(eq(setor.ativo, true));
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(setor)
      .where(eq(setor.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async findByNome(nome: string) {
    const result = await db
      .select()
      .from(setor)
      .where(eq(setor.nome, nome))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: { nome: string; descricao?: string }) {
    const [result] = await db.insert(setor).values(data).returning();
    return result;
  },

  async update(
    id: string,
    data: { nome?: string; descricao?: string; ativo?: boolean },
  ) {
    const result = await db
      .update(setor)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(setor.id, id))
      .returning();
    return result[0] ?? null;
  },

  async delete(id: string) {
    const result = await db
      .update(setor)
      .set({ ativo: false, updatedAt: new Date().toISOString() })
      .where(eq(setor.id, id))
      .returning();
    return result[0] ?? null;
  },
};
