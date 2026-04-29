import { FastifyReply, FastifyRequest } from 'fastify'
import { userRepository } from '../user/user.repository'
import { db } from '@/config/database'
import { registroPonto, resumoDiario } from '@/database/schemas/sqlite'
import { and, asc, eq, like } from 'drizzle-orm'
import {
  gerarHtmlRelatorio,
  gerarPdf,
  gerarPdfMultiplos,
} from '@/shared/utils/gerarRelatorioPDF'

type BatidasDia = {
  entrada?: string
  saida_almoco?: string
  retorno_almoco?: string
  saida?: string
}

export const relatorioService = {
  async pdf(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string }
    const { mes, data } = req.query as { mes?: string; data?: string }

    // Resolve qual mês usar
    const mesResolvido =
      mes ?? data?.substring(0, 7) ?? new Date().toISOString().substring(0, 7)
    // const mesResolvido = mes ?? data?.substring(0, 7); // aceita "2026-04" ou "2026-04-15"

    if (!mesResolvido || !/^\d{4}-\d{2}$/.test(mesResolvido)) {
      return reply.status(400).send({
        statusCode: 400,
        message:
          'Parâmetro "mes" é obrigatório no formato AAAA-MM (ex: 2026-04)',
      })
    }

    const user = await userRepository.findByUuid(userId)
    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' })
    }

    // 1. Busca resumos diários do mês (1 linha por dia)
    const resumos = await db
      .select()
      .from(resumoDiario)
      .where(
        and(
          eq(resumoDiario.usuarioId, userId),
          like(resumoDiario.data, `${mesResolvido}%`)
        )
      )
      .orderBy(asc(resumoDiario.data))

    // 2. Busca todas as batidas do período para montar os períodos
    const batidas = await db
      .select()
      .from(registroPonto)
      .where(
        and(
          eq(registroPonto.usuarioId, userId),
          like(registroPonto.timestamp, `${mesResolvido}%`)
        )
      )
      .orderBy(asc(registroPonto.timestamp))

    const batidasPorDia = batidas.reduce<Record<string, BatidasDia>>(
      (acc, b) => {
        // 🔹 converte para data local (Manaus UTC-4)
        const dataLocal = new Date(
          new Date(b.timestamp).getTime() - 4 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0]

        if (!acc[dataLocal]) {
          acc[dataLocal] = {}
        }

        acc[dataLocal][b.tipo as keyof BatidasDia] = new Date(
          b.timestamp
        ).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Manaus',
        })

        return acc
      },
      {}
    )

    // 4. Monta registros com períodos agrupados
    const registros = resumos.map(r => {
      const b = batidasPorDia[r.data] ?? {}
      const periodos: { entrada: string; saida: string }[] = []

      // 1º período: entrada → saida_almoco
      if (b.entrada || b.saida_almoco) {
        periodos.push({
          entrada: b.entrada ?? '',
          saida: b.saida_almoco ?? '',
        })
      }
      // 2º período: retorno_almoco → saida
      if (b.retorno_almoco || b.saida) {
        periodos.push({
          entrada: b.retorno_almoco ?? '',
          saida: b.saida ?? '',
        })
      }

      return {
        id: r.id,
        data: r.data,
        horasTrabalhadas: r.horasTrabalhadas,
        horasEsperadas: r.horasEsperadas,
        horasExtras: r.horasExtras,
        atrasoMinutos: r.atrasoMinutos,
        status: r.status as 'completo' | 'incompleto' | 'falta' | 'afastamento',
        periodos,
      }
    })

    const [ano, monthStr] = mesResolvido.split('-')
    const periodoInicio = `${mesResolvido}-01`
    const ultimoDia = new Date(Number(ano), Number(monthStr), 0).getDate()
    const periodoFim = `${mesResolvido}-${ultimoDia.toString().padStart(2, '0')}`

    const html = gerarHtmlRelatorio({
      user,
      registros,
      periodoInicio,
      periodoFim,
    })

    const pdf = await gerarPdf(html)

    return reply
      .header('Content-Type', 'application/pdf')
      .header(
        'Content-Disposition',
        `attachment; filename=cartao-ponto-${user.matricula}.pdf`
      )
      .send(pdf)
  },

  // async pdfTodos(req: FastifyRequest, reply: FastifyReply) {
  //   const { mes, data } = req.query as { mes?: string; data?: string };

  //   const mesResolvido =
  //     mes ?? data?.substring(0, 7) ?? new Date().toISOString().substring(0, 7);

  //   const [ano, monthStr] = mesResolvido.split("-");
  //   const periodoInicio = `${mesResolvido}-01`;
  //   const ultimoDia = new Date(Number(ano), Number(monthStr), 0).getDate();
  //   const periodoFim = `${mesResolvido}-${ultimoDia.toString().padStart(2, "0")}`;

  //   const usuarios = await userRepository.findAllActive();

  //   if (usuarios.length === 0) {
  //     return reply.status(404).send({ error: "Nenhum colaborador encontrado" });
  //   }

  //   const zip = new JSZip();

  //   // 1 browser, 1 página — processa usuários em sequência
  //   const browser = await puppeteer.launch({
  //     args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //   });
  //   const page = await browser.newPage();

  //   try {
  //     for (const user of usuarios) {
  //       try {
  //         const resumos = await db
  //           .select()
  //           .from(resumoDiario)
  //           .where(
  //             and(
  //               eq(resumoDiario.usuarioId, user.id),
  //               like(resumoDiario.data, `${mesResolvido}%`),
  //             ),
  //           )
  //           .orderBy(asc(resumoDiario.data));

  //         if (resumos.length === 0) continue;

  //         const batidas = await db
  //           .select()
  //           .from(registroPonto)
  //           .where(
  //             and(
  //               eq(registroPonto.usuarioId, user.id),
  //               like(registroPonto.timestamp, `${mesResolvido}%`),
  //             ),
  //           )
  //           .orderBy(asc(registroPonto.timestamp));

  //         const batidasPorDia = batidas.reduce<Record<string, BatidasDia>>(
  //           (acc, b) => {
  //             // 🔹 converte para data local (Manaus UTC-4)
  //             const dataLocal = new Date(
  //               new Date(b.timestamp).getTime() - 4 * 60 * 60 * 1000,
  //             )
  //               .toISOString()
  //               .split("T")[0];

  //             if (!acc[dataLocal]) {
  //               acc[dataLocal] = {};
  //             }

  //             acc[dataLocal][b.tipo as keyof BatidasDia] = new Date(
  //               b.timestamp,
  //             ).toLocaleTimeString("pt-BR", {
  //               hour: "2-digit",
  //               minute: "2-digit",
  //               timeZone: "America/Manaus",
  //             });

  //             return acc;
  //           },
  //           {},
  //         );

  //         const registros = resumos.map((r) => {
  //           const b = batidasPorDia[r.data] ?? {};
  //           const periodos: { entrada: string; saida: string }[] = [];

  //           if (b.entrada || b.saida_almoco) {
  //             periodos.push({
  //               entrada: b.entrada ?? "",
  //               saida: b.saida_almoco ?? "",
  //             });
  //           }
  //           if (b.retorno_almoco || b.saida) {
  //             periodos.push({
  //               entrada: b.retorno_almoco ?? "",
  //               saida: b.saida ?? "",
  //             });
  //           }

  //           return {
  //             id: r.id,
  //             data: r.data,
  //             horasTrabalhadas: r.horasTrabalhadas,
  //             horasEsperadas: r.horasEsperadas,
  //             horasExtras: r.horasExtras,
  //             atrasoMinutos: r.atrasoMinutos,
  //             status: r.status as
  //               | "completo"
  //               | "incompleto"
  //               | "falta"
  //               | "afastamento",
  //             periodos,
  //           };
  //         });

  //         const html = gerarHtmlRelatorio({
  //           user,
  //           registros,
  //           periodoInicio,
  //           periodoFim,
  //         });
  //         const pdf = await gerarPdfComPagina(html, page);

  //         zip.file(`cartao-ponto-${user.matricula}-${mesResolvido}.pdf`, pdf);
  //         console.log(`✓ PDF gerado: ${user.matricula}`);
  //       } catch (err) {
  //         console.error(`✗ Erro ao gerar PDF para ${user.matricula}:`, err);
  //       }
  //     }
  //   } finally {
  //     await browser.close(); // garante fechamento mesmo com erro
  //   }

  //   const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  //   return reply
  //     .header("Content-Type", "application/zip")
  //     .header(
  //       "Content-Disposition",
  //       `attachment; filename=cartoes-ponto-${mesResolvido}.zip`,
  //     )
  //     .send(zipBuffer);
  // },
  async pdfTodos(req: FastifyRequest, reply: FastifyReply) {
    const { mes, data, setor } = req.body as {
      mes?: string
      data?: string
      setor?: string // opcional — filtra por setor
    }

    const mesResolvido =
      mes ?? data?.substring(0, 7) ?? new Date().toISOString().substring(0, 7)

    const [ano, monthStr] = mesResolvido.split('-')
    const periodoInicio = `${mesResolvido}-01`
    const ultimoDia = new Date(Number(ano), Number(monthStr), 0).getDate()
    const periodoFim = `${mesResolvido}-${ultimoDia.toString().padStart(2, '0')}`

    // Busca usuários ativos — filtra por setor se informado
    const usuarios = setor
      ? await userRepository.findActiveBySetor(setor)
      : await userRepository.findAllActive()

    if (usuarios.length === 0) {
      return reply.status(404).send({
        error: setor
          ? `Nenhum colaborador encontrado no setor "${setor}"`
          : 'Nenhum colaborador encontrado',
      })
    }

    const htmls: string[] = []

    for (const user of usuarios) {
      try {
        const resumos = await db
          .select()
          .from(resumoDiario)
          .where(
            and(
              eq(resumoDiario.usuarioId, user.id),
              like(resumoDiario.data, `${mesResolvido}%`)
            )
          )
          .orderBy(asc(resumoDiario.data))

        if (resumos.length === 0) {
          console.log(`⚠ Sem registros para ${user.matricula}, pulando...`)
          continue
        }

        const batidas = await db
          .select()
          .from(registroPonto)
          .where(
            and(
              eq(registroPonto.usuarioId, user.id),
              like(registroPonto.timestamp, `${mesResolvido}%`)
            )
          )
          .orderBy(asc(registroPonto.timestamp))

        const batidasPorDia = batidas.reduce<Record<string, BatidasDia>>(
          (acc, b) => {
            const dataLocal = new Date(
              new Date(b.timestamp).getTime() - 4 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0]

            if (!acc[dataLocal]) acc[dataLocal] = {}

            acc[dataLocal][b.tipo as keyof BatidasDia] = new Date(
              b.timestamp
            ).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/Manaus',
            })

            return acc
          },
          {}
        )

        const registros = resumos.map(r => {
          const b = batidasPorDia[r.data] ?? {}
          const periodos: { entrada: string; saida: string }[] = []

          if (b.entrada || b.saida_almoco) {
            periodos.push({
              entrada: b.entrada ?? '',
              saida: b.saida_almoco ?? '',
            })
          }
          if (b.retorno_almoco || b.saida) {
            periodos.push({
              entrada: b.retorno_almoco ?? '',
              saida: b.saida ?? '',
            })
          }

          return {
            id: r.id,
            data: r.data,
            horasTrabalhadas: r.horasTrabalhadas,
            horasEsperadas: r.horasEsperadas,
            horasExtras: r.horasExtras,
            atrasoMinutos: r.atrasoMinutos,
            status: r.status as
              | 'completo'
              | 'incompleto'
              | 'falta'
              | 'afastamento',
            periodos,
          }
        })

        const html = gerarHtmlRelatorio({
          user,
          registros,
          periodoInicio,
          periodoFim,
        })
        htmls.push(html)
        console.log(`✓ HTML preparado: ${user.matricula}`)
      } catch (err) {
        console.error(`✗ Erro ao processar ${user.matricula}:`, err)
      }
    }

    if (htmls.length === 0) {
      return reply.status(404).send({ error: 'Nenhum PDF gerado' })
    }

    const pdf = await gerarPdfMultiplos(htmls)

    const nomeArquivo = setor
      ? `cartoes-ponto-${setor}-${mesResolvido}.pdf`
      : `cartoes-ponto-${mesResolvido}.pdf`

    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename=${nomeArquivo}`)
      .send(pdf)
  },
}
