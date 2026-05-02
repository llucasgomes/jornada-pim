import { FastifyReply, FastifyRequest } from "fastify";
import { userRepository } from "../user/user.repository";
import { db } from "@/config/database";
import {
  registroPonto,
  resumoDiario,
  usuarioEmpresa,
} from "@/database/schemas/sqlite";
import { and, asc, eq, like } from "drizzle-orm";
import {
  gerarHtmlRelatorio,
  gerarPdf,
  gerarPdfMultiplos,
} from "@/shared/utils/gerarRelatorioPDF";
import { cartaoDePontoPdfRepository } from "./cartao-de-ponto-pdf.repository";

type BatidasDia = {
  entrada?: string;
  saida_almoco?: string;
  retorno_almoco?: string;
  saida?: string;
};

export const cartaoDePontoPdfService = {
  async pdf(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    const { mes, data } = req.query as { mes?: string; data?: string };

    const mesResolvido =
      mes ?? data?.substring(0, 7) ?? new Date().toISOString().substring(0, 7);

    if (!mesResolvido || !/^\d{4}-\d{2}$/.test(mesResolvido)) {
      return reply.status(400).send({
        statusCode: 400,
        message:
          'Parâmetro "mes" é obrigatório no formato AAAA-MM (ex: 2026-04)',
      });
    }

    const user = await userRepository.findById(userId);
    if (!user)
      return reply.status(404).send({ error: "Usuário não encontrado" });

    // busca o vínculo ativo do usuário
    const [vinculo] = await db
      .select()
      .from(usuarioEmpresa)
      .where(
        and(
          eq(usuarioEmpresa.usuarioId, userId),
          eq(usuarioEmpresa.ativo, true),
        ),
      )
      .limit(1);

    if (!vinculo)
      return reply.status(404).send({ error: "Vínculo ativo não encontrado" });

    const resumos = await db
      .select()
      .from(resumoDiario)
      .where(
        and(
          eq(resumoDiario.usuarioEmpresaId, vinculo.id),
          like(resumoDiario.data, `${mesResolvido}%`),
        ),
      )
      .orderBy(asc(resumoDiario.data));

    const batidas = await db
      .select()
      .from(registroPonto)
      .where(
        and(
          eq(registroPonto.usuarioEmpresaId, vinculo.id),
          like(registroPonto.timestamp, `${mesResolvido}%`),
        ),
      )
      .orderBy(asc(registroPonto.timestamp));

    const batidasPorDia = batidas.reduce<Record<string, BatidasDia>>(
      (acc, b) => {
        const dataLocal = new Date(
          new Date(b.timestamp).getTime() - 4 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0];

        if (!acc[dataLocal]) acc[dataLocal] = {};

        acc[dataLocal][b.tipo as keyof BatidasDia] = new Date(
          b.timestamp,
        ).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Manaus",
        });
        return acc;
      },
      {},
    );

    const registros = resumos.map((r) => {
      const b = batidasPorDia[r.data] ?? {};
      const periodos: { entrada: string; saida: string }[] = [];

      if (b.entrada || b.saida_almoco) {
        periodos.push({
          entrada: b.entrada ?? "",
          saida: b.saida_almoco ?? "",
        });
      }
      if (b.retorno_almoco || b.saida) {
        periodos.push({
          entrada: b.retorno_almoco ?? "",
          saida: b.saida ?? "",
        });
      }

      return {
        id: r.id,
        data: r.data,
        horasTrabalhadas: r.horasTrabalhadas,
        horasEsperadas: r.horasEsperadas,
        horasExtras: r.horasExtras,
        atrasoMinutos: r.atrasoMinutos,
        status: r.status as "completo" | "incompleto" | "falta" | "afastamento",
        periodos,
      };
    });

    const [ano, monthStr] = mesResolvido.split("-");
    const periodoInicio = `${mesResolvido}-01`;
    const ultimoDia = new Date(Number(ano), Number(monthStr), 0).getDate();
    const periodoFim = `${mesResolvido}-${ultimoDia.toString().padStart(2, "0")}`;

    const html = gerarHtmlRelatorio({
      user: { ...user, ...vinculo },
      registros,
      periodoInicio,
      periodoFim,
    });
    const pdf = await gerarPdf(html);

    return reply
      .header("Content-Type", "application/pdf")
      .header(
        "Content-Disposition",
        `attachment; filename=cartao-ponto-${vinculo.matricula}.pdf`,
      )
      .send(pdf);
  },

  async pdfTodos(req: FastifyRequest, reply: FastifyReply) {
    const { mes, data, setor } = req.body as {
      mes?: string;
      data?: string;
      setor?: string;
    };

    const mesResolvido =
      mes ?? data?.substring(0, 7) ?? new Date().toISOString().substring(0, 7);

    const [ano, monthStr] = mesResolvido.split("-");
    const periodoInicio = `${mesResolvido}-01`;
    const ultimoDia = new Date(Number(ano), Number(monthStr), 0).getDate();
    const periodoFim = `${mesResolvido}-${ultimoDia.toString().padStart(2, "0")}`;

    const usuarios = setor
      ? await cartaoDePontoPdfRepository.findActiveBySetor(setor)
      : await userRepository.findAllActive(); // ← esse precisa retornar vinculoId também, veja nota abaixo

    if (usuarios.length === 0) {
      return reply.status(404).send({
        error: setor
          ? `Nenhum colaborador encontrado no setor "${setor}"`
          : "Nenhum colaborador encontrado",
      });
    }

    const htmls: string[] = [];

    for (const user of usuarios) {
      try {
        // busca o vínculo se não veio junto
        // busca vínculo ativo
        const [vinculo] = await db
          .select()
          .from(usuarioEmpresa)
          .where(
            and(
              eq(usuarioEmpresa.usuarioId, user.id),
              eq(usuarioEmpresa.ativo, true),
            ),
          )
          .limit(1);

        if (!vinculo) continue;

        // merge user + vinculo para ter todos os campos
        const userCompleto = {
          ...user,
          matricula: vinculo.matricula,
          cargo: vinculo.cargo,
          setor: vinculo.setor,
          horarioEntrada: vinculo.horarioEntrada,
          horarioSaida: vinculo.horarioSaida,
          cargaHorariaDia: vinculo.cargaHorariaDia,
        };

        const resumos = await db
          .select()
          .from(resumoDiario)
          .where(
            and(
              eq(resumoDiario.usuarioEmpresaId, vinculo.id),
              like(resumoDiario.data, `${mesResolvido}%`),
            ),
          )
          .orderBy(asc(resumoDiario.data));

        if (resumos.length === 0) continue;

        const batidas = await db
          .select()
          .from(registroPonto)
          .where(
            and(
              eq(registroPonto.usuarioEmpresaId, vinculo.id),
              like(registroPonto.timestamp, `${mesResolvido}%`),
            ),
          )
          .orderBy(asc(registroPonto.timestamp));

        const batidasPorDia = batidas.reduce<Record<string, BatidasDia>>(
          (acc, b) => {
            const dataLocal = new Date(
              new Date(b.timestamp).getTime() - 4 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0];

            if (!acc[dataLocal]) acc[dataLocal] = {};

            acc[dataLocal][b.tipo as keyof BatidasDia] = new Date(
              b.timestamp,
            ).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Manaus",
            });
            return acc;
          },
          {},
        );

        const registros = resumos.map((r) => {
          const b = batidasPorDia[r.data] ?? {};
          const periodos: { entrada: string; saida: string }[] = [];

          if (b.entrada || b.saida_almoco) {
            periodos.push({
              entrada: b.entrada ?? "",
              saida: b.saida_almoco ?? "",
            });
          }
          if (b.retorno_almoco || b.saida) {
            periodos.push({
              entrada: b.retorno_almoco ?? "",
              saida: b.saida ?? "",
            });
          }

          return {
            id: r.id,
            data: r.data,
            horasTrabalhadas: r.horasTrabalhadas,
            horasEsperadas: r.horasEsperadas,
            horasExtras: r.horasExtras,
            atrasoMinutos: r.atrasoMinutos,
            status: r.status as
              | "completo"
              | "incompleto"
              | "falta"
              | "afastamento",
            periodos,
          };
        });

        const html = gerarHtmlRelatorio({
          user: userCompleto,
          registros,
          periodoInicio,
          periodoFim,
        });
        htmls.push(html);
      } catch (err) {
        console.error(`✗ Erro ao processar usuário ${user.id}:`, err);
      }
    }

    if (htmls.length === 0)
      return reply.status(404).send({ error: "Nenhum PDF gerado" });

    const pdf = await gerarPdfMultiplos(htmls);
    const nomeArquivo = setor
      ? `cartoes-ponto-${setor}-${mesResolvido}.pdf`
      : `cartoes-ponto-${mesResolvido}.pdf`;

    return reply
      .header("Content-Type", "application/pdf")
      .header("Content-Disposition", `attachment; filename=${nomeArquivo}`)
      .send(pdf);
  },
};
