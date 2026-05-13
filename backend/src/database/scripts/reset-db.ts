import { db } from '@/config/database'
import { sql } from 'drizzle-orm'

async function reset() {
  try {
    await db.execute(sql`DROP SCHEMA public CASCADE`)
    await db.execute(sql`CREATE SCHEMA public`)
    console.log('Banco resetado com sucesso.')
    process.exit(0)
  } catch (err) {
    console.error('Erro ao resetar o banco:', err)
    process.exit(1)
  }
}

reset()
