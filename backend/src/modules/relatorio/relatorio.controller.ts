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
      // preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Baixar relatório de ponto por usuário",
        tags: ["Relatório"],
        params: z4.object({
          userId: z4.string(),
        }),
        querystring: z4.object({
          mes: z4.string().optional(), // formato: 2026-04
          data: z4.string().optional(), // fallback
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

  // 🔹 RELATÓRIO DE TODOS (ZIP)
  server.get(
    "/allActives",
    {
      // preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Baixar relatório de todos os colaboradores",
        tags: ["Relatório"],
        querystring: z4.object({
          mes: z4.string().optional(),
          data: z4.string().optional(),
        }),
        response: {
          200: z4.any(), // ZIP
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
