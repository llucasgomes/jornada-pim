import { db } from '@/config/database'
import { usuario } from '@/database/schemas/sqlite'
import { desc } from 'drizzle-orm'

export async function gerarMatricula() {
  const ultimo = await db
    .select({ matricula: usuario.matricula })
    .from(usuario)
    .orderBy(desc(usuario.matricula))
    .limit(1)

  let numero = 1

  if (ultimo.length && ultimo[0].matricula) {
    const partes = ultimo[0].matricula.split('-')
    const parsed = Number(partes[1])

    if (!isNaN(parsed)) {
      numero = parsed + 1
    }
  }

  return `PIM-${String(numero).padStart(4, '0')}`
}
