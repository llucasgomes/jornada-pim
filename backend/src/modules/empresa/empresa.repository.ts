import { db } from "@/config/database";
import { empresa } from "@/database/schemas/sqlite";
import { desc, eq } from "drizzle-orm";

// colunas seguras (padrão do projeto)
const safeColumns = {
  id: empresa.id,
  nome: empresa.nome,
  cnpj: empresa.cnpj,
  logo: empresa.logo,
  razao_social: empresa.razaoSocial,
  email: empresa.email,
  telefone: empresa.telefone,
  ativo: empresa.ativo,
  created_at: empresa.createdAt,
  updated_at: empresa.updatedAt,
};

export const empresaRepository = {
  // ✅ CREATE
  async create(data: typeof empresa.$inferInsert) {
    const [result] = await db
      .insert(empresa)
      .values(data)
      .returning(safeColumns);

    return result;
  },

  // ✅ READ - todas
  async findAll() {
    return db.select(safeColumns).from(empresa);
  },

  // ✅ READ - ativas
  async findAllActive() {
    return db.select(safeColumns).from(empresa).where(eq(empresa.ativo, true));
  },

  // ✅ READ - inativas
  async findAllInactive() {
    return db.select(safeColumns).from(empresa).where(eq(empresa.ativo, false));
  },

  // ✅ READ - por ID
  async findById(id: string) {
    const result = await db
      .select(safeColumns)
      .from(empresa)
      .where(eq(empresa.id, id))
      .limit(1);

    return result[0] ?? null;
  },

  // ✅ READ - por CNPJ
  async findByCnpj(cnpj: string) {
    const result = await db
      .select(safeColumns)
      .from(empresa)
      .where(eq(empresa.cnpj, cnpj))
      .limit(1);

    return result[0] ?? null;
  },

  // ✅ READ - última empresa (opcional, útil pra debug/log)
  async lastEmpresa() {
    const result = await db
      .select(safeColumns)
      .from(empresa)
      .orderBy(desc(empresa.createdAt))
      .limit(1);

    return result[0] ?? null;
  },

  // ✅ UPDATE
  async update(id: string, data: Partial<typeof empresa.$inferInsert>) {
    const result = await db
      .update(empresa)
      .set({
        ...data,
        updatedAt: new Date().toISOString(), // melhor que toDateString()
      })
      .where(eq(empresa.id, id))
      .returning(safeColumns);

    return result[0] ?? null;
  },

  // ✅ DELETE lógico (soft delete)
  async delete(id: string) {
    const result = await db
      .update(empresa)
      .set({
        ativo: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(empresa.id, id))
      .returning(safeColumns);

    return result[0] ?? null;
  },

  // ✅ RESTORE (reativar empresa)
  async restore(id: string) {
    const result = await db
      .update(empresa)
      .set({
        ativo: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(empresa.id, id))
      .returning(safeColumns);

    return result[0] ?? null;
  },
};
