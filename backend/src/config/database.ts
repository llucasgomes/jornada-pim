import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from './env'

export const pg = postgres(env.POSTGRES_URL)
export const db = drizzle(pg, {
  schema: {
    usuario: 'usuario',
    colaborador: 'colaborador',
    registro_ponto: 'registro_ponto',
    resumo_diario: 'resumo_diario',
  },
})
