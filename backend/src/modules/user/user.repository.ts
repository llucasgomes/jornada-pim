import { db } from '@/config/database'
import { usuario } from '@/database/schemas/sqlite'
import { and, desc, eq } from 'drizzle-orm'
import type { CreateUserDto } from './dtos/create-user.dto'

// colunas seguras reutilizadas em todos os selects (sem senha)
const safeColumns = {
  id: usuario.id,
  nome: usuario.nome,
  imageUrl: usuario.imageUrl,
  matricula: usuario.matricula,
  perfil: usuario.perfil,
  cargo: usuario.cargo,
  setor: usuario.setor,
  turno: usuario.turno,
  carga_horaria_dia: usuario.cargaHorariaDia,
  horario_entrada: usuario.horarioEntrada,
  horario_saida: usuario.horarioSaida,
  ativo: usuario.ativo,
  created_at: usuario.createdAt,
  updated_at: usuario.updatedAt,
}

export const userRepository = {
  async create(data: any) {
    const [user] = await db.insert(usuario).values(data).returning(safeColumns)
    return user
  },

  async findAll() {
    return db.select(safeColumns).from(usuario)
  },

  async findAllActive() {
    return db.select(safeColumns).from(usuario).where(eq(usuario.ativo, true))
  },
  async findActiveBySetor(setor: string) {
    return db
      .select(safeColumns)
      .from(usuario)
      .where(and(eq(usuario.ativo, true), eq(usuario.setor, setor)))
  },

  async findAllInactive() {
    return db.select(safeColumns).from(usuario).where(eq(usuario.ativo, false))
  },
  async lastUser() {
    const ultimo = await db
      .select({ matricula: usuario.matricula })
      .from(usuario)
      .orderBy(desc(usuario.matricula))
      .limit(1)
    return ultimo[0]?.matricula ?? null
  },

  async findByMatricula(matricula: string) {
    const result = await db
      .select(safeColumns)
      .from(usuario)
      .where(eq(usuario.matricula, matricula))
      .limit(1)
    return result[0] ?? null
  },

  async findByMatriculaWithPassword(matricula: string) {
    const result = await db
      .select()
      .from(usuario)
      .where(eq(usuario.matricula, matricula))
      .limit(1)
    return result[0] ?? null
  },

  async findByUuid(id: string) {
    const result = await db
      .select(safeColumns)
      .from(usuario)
      .where(eq(usuario.id, id))
      .limit(1)
    return result[0] ?? null
  },

  async update(matricula: string, data: Partial<CreateUserDto>) {
    const result = await db
      .update(usuario)
      .set({ ...data, updatedAt: new Date().toDateString() })
      .where(eq(usuario.matricula, matricula))
      .returning(safeColumns)
    return result[0] ?? null
  },

  async delete(matricula: string) {
    const result = await db
      .update(usuario)
      .set({ ativo: false, updatedAt: new Date().toDateString() })
      .where(eq(usuario.matricula, matricula))
      .returning(safeColumns)
    return result[0] ?? null
  },
}
