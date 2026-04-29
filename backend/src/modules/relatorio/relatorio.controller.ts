import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";


import { permission } from "@/shared/middlewares/permission";
import { internalServerErrorSchema } from "@/shared/errors/errorSchemas";
import { relatorioService } from "./relatorio.service";

export default function relatorioController(server: FastifyInstance) {
  // 🔹 RELATÓRIO INDIVIDUAL
  server.get(
    "/:userId",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Baixar relatório de ponto por usuário",
        tags: ["Relatório"],
        params: z4.object({
          userId: z4.string(),
        }),
        response: {
          200: z4.any(), // PDF (não valida binário)
          400: z4.object({
            statusCode: z4.literal(400),
            message: z4.string(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    relatorioService.pdf,
  );

  // 🔹 RELATÓRIO DE TODOS 
  server.post(
    "/allActives",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Baixar relatório de todos os colaboradores",
        tags: ["Relatório"],
        body: z4.object({
          mes: z4
            .string()
            .regex(
              /^\d{4}-\d{2}$/,
              "Formato inválido. Use AAAA-MM (ex: 2026-04)",
            )
            .describe(
              "Mês de referência no formato AAAA-MM (ex: 2026-04). Se não informado, usa o mês atual.",
            )
            .optional(),
          setor: z4
            .string()
            .describe(
              "Filtrar por setor específico (ex: Produção). Se não informado, retorna todos os colaboradores.",
            )
            .optional(),
        }),
        response: {
          200: z4.any(),
          400: z4.object({
            statusCode: z4.literal(400),
            message: z4.string(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    relatorioService.pdfTodos,
  );
}
