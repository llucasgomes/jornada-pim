import { db } from "@/config/database";
import { usuario } from "@/database/schemas/sqlite";
import { eq } from "drizzle-orm";
import { CreateUserDtoType } from "./user.dto";


const safeColumns = {
  id: usuario.id,
  nome: usuario.nome,
  cpf: usuario.cpf,
  imageUrl: usuario.imageUrl,
  ativo: usuario.ativo,
  created_at: usuario.createdAt,
  updated_at: usuario.updatedAt,
};

export const userRepository = {
  async create(data: typeof usuario.$inferInsert) {
    const [user] = await db.insert(usuario).values(data).returning(safeColumns);

    return user;
  },

  async findAll() {
    return db.select(safeColumns).from(usuario);
  },

  async findAllActive() {
    return db.select(safeColumns).from(usuario).where(eq(usuario.ativo, true));
  },

  async findAllInactive() {
    return db.select(safeColumns).from(usuario).where(eq(usuario.ativo, false));
  },

  async findByCpf(cpf: string) {
    const result = await db
      .select(safeColumns)
      .from(usuario)
      .where(eq(usuario.cpf, cpf))
      .limit(1);

    return result[0] ?? null;
  },

  async findByCpfWithPassword(cpf: string) {
    const result = await db
      .select()
      .from(usuario)
      .where(eq(usuario.cpf, cpf))
      .limit(1);

    return result[0] ?? null;
  },

  async findById(id: string) {
    const result = await db
      .select(safeColumns)
      .from(usuario)
      .where(eq(usuario.id, id))
      .limit(1);

    return result[0] ?? null;
  },

  async update(id: string, data: Partial<CreateUserDtoType>) {
    const result = await db
      .update(usuario)
      .set({
        ...data,
        updatedAt: new Date().toISOString(), // ✅ corrigido
      })
      .where(eq(usuario.id, id))
      .returning(safeColumns);

    return result[0] ?? null;
  },

  async delete(id: string) {
    const result = await db
      .update(usuario)
      .set({
        ativo: false,
        updatedAt: new Date().toISOString(), // ✅ corrigido
      })
      .where(eq(usuario.id, id))
      .returning(safeColumns);

    return result[0] ?? null;
  },
};
