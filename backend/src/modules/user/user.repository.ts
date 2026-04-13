import { eq } from 'drizzle-orm'
import { db } from '@/config/database'
import { usuario } from '@/database/schemas'
import type { CreateUserDto } from './dtos/create-user.dto'

// colunas seguras reutilizadas em todos os selects (sem senha)
const safeColumns = {
  id: usuario.id,
  nome: usuario.nome,
  matricula: usuario.matricula,
  perfil: usuario.perfil,
  cargo: usuario.cargo,
  setor: usuario.setor,
  turno: usuario.turno,
  carga_horaria_dia: usuario.carga_horaria_dia,
  horario_entrada: usuario.horario_entrada,
  horario_saida: usuario.horario_saida,
  ativo: usuario.ativo,
  created_at: usuario.created_at,
  updated_at: usuario.updated_at,
}

export const userRepository = {
  async create(data: CreateUserDto) {
    const [user] = await db.insert(usuario).values(data).returning(safeColumns)
    return user
  },

  async findAll() {
    return db.select(safeColumns).from(usuario)
  },

  async findAllActive() {
    return db.select(safeColumns).from(usuario).where(eq(usuario.ativo, true))
  },

  async findAllInactive() {
    return db.select(safeColumns).from(usuario).where(eq(usuario.ativo, false))
  },

  async findByMatricula(matricula: string) {
    const result = await db
      .select(safeColumns)
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
      .set({ ...data, updated_at: new Date() })
      .where(eq(usuario.matricula, matricula))
      .returning(safeColumns)
    return result[0] ?? null
  },

  async delete(matricula: string) {
    const result = await db
      .update(usuario)
      .set({ ativo: false, updated_at: new Date() })
      .where(eq(usuario.matricula, matricula))
      .returning(safeColumns)
    return result[0] ?? null
  },
}
