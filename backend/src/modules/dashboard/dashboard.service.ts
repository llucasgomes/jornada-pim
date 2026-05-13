import { count, eq, sql, and, gte, lte } from "drizzle-orm";
import { db } from "@/config/database";
import {
  usuario,
  resumoDiario,
  registroPonto,
} from "@/database/schemas";

export const dashboardService = {
  async getStats() {
    const [totalUsers] = await db.select({ value: count() }).from(usuario);

    const [activeUsers] = await db
      .select({ value: count() })
      .from(usuario)
      .where(eq(usuario.ativo, true));

    const hojeStr = new Date().toISOString().split("T")[0];

    const [presentToday] = await db
      .select({ value: count(sql`DISTINCT ${registroPonto.usuarioEmpresaId}`) })
      .from(registroPonto)
      .where(sql`DATE(${registroPonto.timestamp}) = ${hojeStr}`);

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const fimMes = new Date(
      inicioMes.getFullYear(),
      inicioMes.getMonth() + 1,
      0,
    );
    fimMes.setHours(23, 59, 59, 999);

    const [monthStats] = await db
      .select({
        totalExtras: sql<string>`sum(${resumoDiario.horasExtras})`,
        totalAtrasos: sql<string>`sum(${resumoDiario.atrasoMinutos})`,
      })
      .from(resumoDiario)
      .where(
        and(
          gte(resumoDiario.data, inicioMes.toISOString().split("T")[0]),
          lte(resumoDiario.data, fimMes.toISOString().split("T")[0]),
        ),
      );

    return {
      totalColaboradores: totalUsers.value,
      ativos: activeUsers.value,
      presentesHoje: presentToday.value,
      horasExtrasMes: Number(monthStats?.totalExtras || 0).toFixed(1),
      atrasosMesMinutos: Number(monthStats?.totalAtrasos || 0),
    };
  },
};
