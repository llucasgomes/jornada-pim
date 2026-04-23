import { count, eq, sql, and, gte, lte } from 'drizzle-orm'
import { db } from '@/config/database'
import { usuario, resumo_diario, registro_ponto } from '@/database/schemas'

export const dashboardService = {
  async getStats() {
    // 1. Total de colaboradores ativos e inativos
    const [totalUsers] = await db.select({ value: count() }).from(usuario)
    const [activeUsers] = await db.select({ value: count() }).from(usuario).where(eq(usuario.ativo, true))

    // 2. Colaboradores que bateram ponto hoje (presentes)
    const hojeStr = new Date().toISOString().split('T')[0]
    const [presentToday] = await db
      .select({ value: count(sql`DISTINCT ${registro_ponto.usuario_id}`) })
      .from(registro_ponto)
      .where(sql`DATE(${registro_ponto.timestamp}) = ${hojeStr}`)

    // 3. Totais do mês atual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    
    const fimMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0)
    fimMes.setHours(23, 59, 59, 999)

    const [monthStats] = await db
      .select({
        totalExtras: sql<string>`sum(${resumo_diario.horas_extras})`,
        totalAtrasos: sql<string>`sum(${resumo_diario.atraso_minutos})`,
      })
      .from(resumo_diario)
      .where(
        and(
          gte(resumo_diario.data, inicioMes.toISOString().split('T')[0]),
          lte(resumo_diario.data, fimMes.toISOString().split('T')[0])
        )
      )

    return {
      totalColaboradores: totalUsers.value,
      ativos: activeUsers.value,
      presentesHoje: presentToday.value,
      horasExtrasMes: Number(monthStats.totalExtras || 0).toFixed(1),
      atrasosMesMinutos: Number(monthStats.totalAtrasos || 0),
    }
  },
}
