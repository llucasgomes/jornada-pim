import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/config/database";
import {
  resumoDiario,
  usuario,
  usuarioEmpresa,
} from "@/database/schemas";
import { AppError } from "@/shared/errors/AppError";
import { registroPontoRepository } from "./registro-ponto.repository";
import { and, desc, eq, gte, inArray, like, lte, sql } from "drizzle-orm";
import { userEmpresaRepository } from "../user-empresa/user-empresa.repository";
import { calcularResumo } from "./registro-ponto.utils";
import {
  horasDecimalParaHHMM,
  minutosParaHHMM,
} from "@/shared/utils/time.utils";

const SEQUENCIA = [
  "entrada",
  "saida_almoco",
  "retorno_almoco",
  "saida",
] as const;

export const registroPontoService = {
  async registrarBatida(req: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (req.user as { id: string }).id;

    // busca o vínculo ativo do usuário
    const [vinculo] = await userEmpresaRepository.findActiveByUser(usuarioId);
    if (!vinculo) throw new AppError("Vínculo ativo não encontrado", 404);

    const hoje = new Date().toISOString().split("T")[0];
    const batidasHoje = await registroPontoRepository.findByUsuarioEDia(
      vinculo.id,
      hoje,
    );
    const tiposRegistrados = batidasHoje.map((b) => b.tipo);

    const proxima = SEQUENCIA.find((t) => !tiposRegistrados.includes(t as any));
    if (!proxima)
      throw new AppError("Todas as batidas do dia já foram registradas", 400);

    const batida = await registroPontoRepository.create({
      usuarioEmpresaId: vinculo.id,
      tipo: proxima,
      origem: "sistema",
    });

    await upsertResumoDiario(vinculo.id, hoje, {
      cargaHorariaDia: vinculo.cargaHorariaDia,
      horarioEntrada: vinculo.horarioEntrada,
    });

    return reply.status(201).send(batida);
  },

  async buscarHoje(req: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (req.user as { id: string }).id;
    const [vinculo] = await userEmpresaRepository.findActiveByUser(usuarioId);
    if (!vinculo) throw new AppError("Vínculo ativo não encontrado", 404);

    const hoje = new Date().toISOString().split("T")[0];
    const batidas = await registroPontoRepository.findByUsuarioEDia(
      vinculo.id,
      hoje,
    );
    const tiposRegistrados = batidas.map((b) => b.tipo);
    const proxima =
      SEQUENCIA.find((t) => !tiposRegistrados.includes(t as any)) ?? null;

    const [resumo] = await db
      .select()
      .from(resumoDiario)
      .where(
        and(
          eq(resumoDiario.usuarioEmpresaId, vinculo.id),
          eq(resumoDiario.data, hoje),
        ),
      )
      .limit(1);

    return reply
      .status(200)
      .send({ batidas, resumo: resumo ?? null, proxima_batida: proxima });
  },

  async buscarHistorico(req: FastifyRequest, reply: FastifyReply) {
    const { usuario_id } = req.params as { usuario_id: string };
    const { de, ate } = req.query as { de?: string; ate?: string };

    const [vinculo] = await userEmpresaRepository.findActiveByUser(usuario_id);
    if (!vinculo) throw new AppError("Vínculo não encontrado", 404);

    const hoje = new Date();
    const dataAte = ate ?? hoje.toISOString().split("T")[0];
    const dataInicio = new Date(hoje);
    dataInicio.setDate(dataInicio.getDate() - 30);
    const dataDe = de ?? dataInicio.toISOString().split("T")[0];

    const batidas = await registroPontoRepository.findByUsuarioEPeriodo(
      vinculo.id,
      dataDe,
      dataAte,
    );
    return reply.status(200).send(batidas);
  },

  async deletarBatida(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const batida = await registroPontoRepository.findById(id);
    if (!batida) throw new AppError("Batida não encontrada", 404);
    await registroPontoRepository.delete(id);
    return reply.status(200).send({ message: "Batida removida com sucesso" });
  },
  async buscarRelatorioMensal(req: FastifyRequest, reply: FastifyReply) {
    const { usuario_id } = req.params as { usuario_id: string };
    const { mes, ano } = req.query as { mes?: string; ano?: string };

    const [vinculo] = await userEmpresaRepository.findActiveByUser(usuario_id);
    if (!vinculo) throw new AppError("Vínculo não encontrado", 404);

    const hoje = new Date();
    const targetMes = mes ? Number(mes) : hoje.getMonth() + 1;
    const targetAno = ano ? Number(ano) : hoje.getFullYear();

    const inicioMes = `${targetAno}-${String(targetMes).padStart(2, "0")}-01`;
    const fimMes = `${targetAno}-${String(targetMes).padStart(2, "0")}-${new Date(targetAno, targetMes, 0).getDate()}`;

    const resumos = await db
      .select()
      .from(resumoDiario)
      .where(
        and(
          eq(resumoDiario.usuarioEmpresaId, vinculo.id),
          gte(resumoDiario.data, inicioMes),
          lte(resumoDiario.data, fimMes),
        ),
      )
      .orderBy(resumoDiario.data);

    return reply.status(200).send(resumos);
  },
  async relatorioMensal(req: FastifyRequest, reply: FastifyReply) {
    const { data, mes, empresaId } = req.query as { data?: string; mes?: string; empresaId: string };

    if (!empresaId) throw new AppError('Parâmetro "empresaId" é obrigatório', 400);

    const mesFinal =
      mes ??
      (data ? data.slice(0, 7) : null) ??
      new Date().toISOString().slice(0, 7);

    // Filter for the month and specific company
    const idsEmpresa = db.select({ id: usuarioEmpresa.id }).from(usuarioEmpresa).where(eq(usuarioEmpresa.empresaId, empresaId));
    const filtroEstatistica = and(
      like(sql`${resumoDiario.data}::text`, `${mesFinal}%`),
      inArray(resumoDiario.usuarioEmpresaId, idsEmpresa)
    );

    const [extras] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${resumoDiario.horasExtras}), 0)`,
      })
      .from(resumoDiario)
      .where(filtroEstatistica);

    const [atrasos] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${resumoDiario.atrasoMinutos}), 0)`,
      })
      .from(resumoDiario)
      .where(filtroEstatistica);

    const [faltas] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(resumoDiario)
      .where(and(filtroEstatistica, eq(resumoDiario.status, "falta")));

    const [users] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(usuarioEmpresa)
      .innerJoin(usuario, eq(usuario.id, usuarioEmpresa.usuarioId))
      .where(and(eq(usuario.ativo, true), eq(usuarioEmpresa.empresaId, empresaId)));

    const [dias] = await db
      .select({ total: sql<number>`COUNT(DISTINCT ${resumoDiario.data})` })
      .from(resumoDiario)
      .where(filtroEstatistica);

    const hoje = new Date().toISOString().slice(0, 10);

    const [presencaHoje] = await db
      .select({
        total: sql<number>`COUNT(DISTINCT ${resumoDiario.usuarioEmpresaId})`,
      })
      .from(resumoDiario)
      .where(
        and(
          eq(resumoDiario.data, hoje),
          sql`${resumoDiario.status} != 'falta'`,
          inArray(resumoDiario.usuarioEmpresaId, idsEmpresa)
        ),
      );

    // top 5 atrasos — join com usuarioEmpresa → usuario
    const topAtrasosRaw = await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        imageUrl: usuario.imageUrl,
        setor: usuarioEmpresa.setor,
        cargo: usuarioEmpresa.cargo,
        total: sql<number>`SUM(${resumoDiario.atrasoMinutos})`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .innerJoin(usuario, eq(usuario.id, usuarioEmpresa.usuarioId))
      .where(filtroEstatistica)
      .groupBy(usuario.id, usuarioEmpresa.setor, usuarioEmpresa.cargo)
      .orderBy(desc(sql`SUM(${resumoDiario.atrasoMinutos})`))
      .limit(5);

    const topFaltososRaw = await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        imageUrl: usuario.imageUrl,
        setor: usuarioEmpresa.setor,
        cargo: usuarioEmpresa.cargo,
        total: sql<number>`COUNT(*)`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .innerJoin(usuario, eq(usuario.id, usuarioEmpresa.usuarioId))
      .where(and(filtroEstatistica, eq(resumoDiario.status, "falta")))
      .groupBy(usuario.id, usuarioEmpresa.setor, usuarioEmpresa.cargo)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(5);

    const topAtrasos = topAtrasosRaw.map(t => ({ ...t, total: Number(t.total ?? 0) }));
    const topFaltosos = topFaltososRaw.map(t => ({ ...t, total: Number(t.total ?? 0) }));

    const graficoExtrasRaw = await db
      .select({
        data: resumoDiario.data,
        total: sql<number>`SUM(${resumoDiario.horasExtras})`,
      })
      .from(resumoDiario)
      .where(filtroEstatistica)
      .groupBy(resumoDiario.data)
      .orderBy(resumoDiario.data);

    const graficoExtras = graficoExtrasRaw.map(t => ({ ...t, total: Number(t.total ?? 0) }));

    const totalHorasExtras = Number(extras?.total ?? 0);
    const totalAtrasos = Number(atrasos?.total ?? 0);
    const totalFaltas = Number(faltas?.total ?? 0);
    const totalColaboradores = Number(users?.total ?? 0);
    const totalDiasProcessados = Number(dias?.total ?? 0);
    const presencaHojeNum = Number(presencaHoje?.total ?? 0);

    const payload = {
      totalHorasExtras,
      totalAtrasos,
      totalFaltas,
      totalColaboradores,
      totalDiasProcessados,
      presencaHoje: presencaHojeNum,
      mediaExtras: totalColaboradores > 0 ? totalHorasExtras / totalColaboradores : 0,
      topAtrasos,
      topFaltosos,
      graficoExtras,
    };
    console.log("PAYLOAD RELATORIO MENSAL:", JSON.stringify(payload, null, 2));

    return reply.status(200).send(payload);
  },
  async relatorioMensalPorSetor(req: FastifyRequest, reply: FastifyReply) {
    const { data, mes, setor, empresaId } = req.query as {
      data?: string;
      mes?: string;
      setor: string;
      empresaId: string;
    };

    if (!setor) throw new AppError('Parâmetro "setor" é obrigatório', 400);

    if (!empresaId)
      throw new AppError('Parâmetro "empresaId" é obrigatório', 400);

    const mesFinal =
      mes ??
      (data ? data.slice(0, 7) : null) ??
      new Date().toISOString().slice(0, 7);

    const filtroMes = like(sql`${resumoDiario.data}::text`, `${mesFinal}%`);

    // filtro base agora inclui empresaId
    const filtroMesSetor = and(
      filtroMes,
      eq(usuarioEmpresa.setor, setor),
      eq(usuarioEmpresa.empresaId, empresaId), // 👈 garante isolamento por empresa
    );

    const [extras] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${resumoDiario.horasExtras}), 0)`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .where(filtroMesSetor);

    const [atrasos] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${resumoDiario.atrasoMinutos}), 0)`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .where(filtroMesSetor);

    const [faltas] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .where(and(filtroMesSetor, eq(resumoDiario.status, "falta")));

    const [users] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(usuarioEmpresa)
      .where(
        and(
          eq(usuarioEmpresa.ativo, true),
          eq(usuarioEmpresa.setor, setor),
          eq(usuarioEmpresa.empresaId, empresaId), // 👈
        ),
      );

    const [dias] = await db
      .select({ total: sql<number>`COUNT(DISTINCT ${resumoDiario.data})` })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .where(filtroMesSetor);

    const hoje = new Date().toISOString().slice(0, 10);
    // ─── Histórico dos últimos 6 meses ───────────────────────────────────────────
    const hoje2 = new Date();
    const historicoMeses = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const ref = new Date(
          hoje2.getFullYear(),
          hoje2.getMonth() - (5 - i),
          1,
        );
        const ano = ref.getFullYear();
        const mes = ref.getMonth() + 1;
        const mesStr = `${ano}-${String(mes).padStart(2, "0")}`;
        const filtro = and(
          like(sql`${resumoDiario.data}::text`, `${mesStr}%`),
          eq(usuarioEmpresa.setor, setor),
          eq(usuarioEmpresa.empresaId, empresaId),
        );

        return Promise.all([
          db
            .select({
              total: sql<number>`COALESCE(SUM(${resumoDiario.horasExtras}), 0)`,
            })
            .from(resumoDiario)
            .innerJoin(
              usuarioEmpresa,
              eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
            )
            .where(filtro)
            .then(([r]) => Number(r?.total ?? 0)),

          db
            .select({
              total: sql<number>`COALESCE(SUM(${resumoDiario.atrasoMinutos}), 0)`,
            })
            .from(resumoDiario)
            .innerJoin(
              usuarioEmpresa,
              eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
            )
            .where(filtro)
            .then(([r]) => Number(r?.total ?? 0)),

          db
            .select({ total: sql<number>`COUNT(*)` })
            .from(resumoDiario)
            .innerJoin(
              usuarioEmpresa,
              eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
            )
            .where(and(filtro, eq(resumoDiario.status, "falta")))
            .then(([r]) => Number(r?.total ?? 0)),
        ]).then(([extras, atrasos, faltas]) => ({
          mes: mesStr,
          extras,
          atrasos,
          faltas,
        }));
      }),
    );

    const [presencaHoje] = await db
      .select({
        total: sql<number>`COUNT(DISTINCT ${resumoDiario.usuarioEmpresaId})`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .where(
        and(
          eq(resumoDiario.data, hoje),
          eq(usuarioEmpresa.setor, setor),
          eq(usuarioEmpresa.empresaId, empresaId), // 👈
          sql`${resumoDiario.status} != 'falta'`,
        ),
      );

    const topExtrasRaw = await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        imageUrl: usuario.imageUrl,
        setor: usuarioEmpresa.setor,
        cargo: usuarioEmpresa.cargo,
        total: sql<number>`SUM(${resumoDiario.horasExtras})`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .innerJoin(usuario, eq(usuario.id, usuarioEmpresa.usuarioId))
      .where(filtroMesSetor)
      .groupBy(usuario.id, usuarioEmpresa.setor, usuarioEmpresa.cargo)
      .orderBy(desc(sql`SUM(${resumoDiario.horasExtras})`))
      .limit(5);

    const topAtrasosRaw = await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        imageUrl: usuario.imageUrl,
        setor: usuarioEmpresa.setor,
        cargo: usuarioEmpresa.cargo,
        total: sql<number>`SUM(${resumoDiario.atrasoMinutos})`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .innerJoin(usuario, eq(usuario.id, usuarioEmpresa.usuarioId))
      .where(filtroMesSetor)
      .groupBy(usuario.id, usuarioEmpresa.setor, usuarioEmpresa.cargo)
      .orderBy(desc(sql`SUM(${resumoDiario.atrasoMinutos})`))
      .limit(5);

    const topFaltososRaw = await db
      .select({
        id: usuario.id,
        nome: usuario.nome,
        imageUrl: usuario.imageUrl,
        setor: usuarioEmpresa.setor,
        cargo: usuarioEmpresa.cargo,
        total: sql<number>`COUNT(*)`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .innerJoin(usuario, eq(usuario.id, usuarioEmpresa.usuarioId))
      .where(and(filtroMesSetor, eq(resumoDiario.status, "falta")))
      .groupBy(usuario.id, usuarioEmpresa.setor, usuarioEmpresa.cargo)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(5);

    const topExtras = topExtrasRaw.map(t => ({ ...t, total: Number(t.total ?? 0) }));
    const topAtrasos = topAtrasosRaw.map(t => ({ ...t, total: Number(t.total ?? 0) }));
    const topFaltosos = topFaltososRaw.map(t => ({ ...t, total: Number(t.total ?? 0) }));

    const graficoExtrasRaw = await db
      .select({
        data: resumoDiario.data,
        total: sql<number>`SUM(${resumoDiario.horasExtras})`,
      })
      .from(resumoDiario)
      .innerJoin(
        usuarioEmpresa,
        eq(usuarioEmpresa.id, resumoDiario.usuarioEmpresaId),
      )
      .where(filtroMesSetor)
      .groupBy(resumoDiario.data)
      .orderBy(resumoDiario.data);

    const graficoExtras = graficoExtrasRaw.map(g => ({
      ...g,
      total: Number(g.total ?? 0)
    }));

    return reply.status(200).send({
      setor,
      totalHorasExtras: horasDecimalParaHHMM(extras?.total ?? 0),
      topExtras: topExtras ?? [],
      totalAtrasos: minutosParaHHMM(atrasos?.total ?? 0),
      totalFaltas: Number(faltas?.total ?? 0),
      totalColaboradores: Number(users?.total ?? 0),
      totalDiasProcessados: Number(dias?.total ?? 0),
      presencaHoje: Number(presencaHoje?.total ?? 0),
      mediaExtras: Number(users?.total ?? 0) > 0 ? (Number(extras?.total ?? 0) / Number(users?.total ?? 1)) : 0,
      topAtrasos,
      topFaltosos,
      graficoExtras,
      historicoMeses,
    });
  },
};

async function upsertResumoDiario(
  usuarioEmpresaId: string,
  data: string,
  vinculo: { cargaHorariaDia: number | null; horarioEntrada: string | null },
) {
  const batidas = await registroPontoRepository.findByUsuarioEDia(
    usuarioEmpresaId,
    data,
  );

  const resumo = calcularResumo(
    batidas.map((b) => ({ tipo: b.tipo, timestamp: new Date(b.timestamp) })),
    vinculo.cargaHorariaDia ?? 8.0,
    vinculo.horarioEntrada ?? "08:00",
    new Date(data),
  );

  const [existe] = await db
    .select({ id: resumoDiario.id })
    .from(resumoDiario)
    .where(
      and(
        eq(resumoDiario.usuarioEmpresaId, usuarioEmpresaId),
        eq(resumoDiario.data, data),
      ),
    )
    .limit(1);

  if (existe) {
    await db
      .update(resumoDiario)
      .set(resumo)
      .where(eq(resumoDiario.id, existe.id));
  } else {
    await db.insert(resumoDiario).values({ usuarioEmpresaId, data, ...resumo });
  }
}
