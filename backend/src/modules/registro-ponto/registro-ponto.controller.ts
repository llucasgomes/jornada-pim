import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";
import { tipoBatidaEnumSchema } from "@/shared/schemas/enums";
import { registroPontoService } from "./registro-ponto.service";
import { internalServerErrorSchema } from "@/shared/errors/errorSchemas";
import { permission } from "@/shared/middlewares/permission";

export async function registroPontoController(server: FastifyInstance) {
  // POST /ponto — registra próxima batida (colaborador autenticado)
  server.post(
    "/",
    {
      preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Registra a próxima batida do colaborador autenticado",
        tags: ["Ponto"],
        response: {
          201: z4.object({
            id: z4.uuid(),
            usuarioEmpresaId: z4.uuid(), // corrigido: era usuarioId
            tipo: tipoBatidaEnumSchema,
            timestamp: z4.string(),
            origem: z4.string(),
          }),
          400: z4.object({ statusCode: z4.literal(400), message: z4.string() }),
          403: z4.object({ statusCode: z4.literal(403), message: z4.string() }),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.registrarBatida,
  );

  // GET /ponto/hoje
  server.get(
    "/hoje",
    {
      preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna batidas e resumo do dia do colaborador autenticado",
        tags: ["Ponto"],
        response: {
          200: z4.object({
            batidas: z4.array(z4.any()),
            resumo: z4.any().nullable(),
            proxima_batida: tipoBatidaEnumSchema.nullable(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.buscarHoje,
  );

  // GET /ponto/:usuario_id/historico?de=&ate=
  server.get(
    "/:usuario_id/historico",
    {
      preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna histórico de ponto por período",
        tags: ["Ponto"],
        params: z4.object({
          usuario_id: z4.string().uuid(),
        }),
        querystring: z4.object({
          de: z4
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
          ate: z4
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
        }),
        response: {
          200: z4.array(z4.any()),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.buscarHistorico,
  );

  // GET /ponto/:usuario_id/relatorio-mensal?mes=&ano=
  server.get(
    "/:usuario_id/relatorio-mensal",
    {
      preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna relatório mensal consolidado",
        tags: ["Ponto"],
        params: z4.object({
          usuario_id: z4.string().uuid(),
        }),
        querystring: z4.object({
          // corrigido: era params
          mes: z4.string().optional(),
          ano: z4.string().optional(),
        }),
        response: {
          200: z4.array(z4.any()),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.buscarRelatorioMensal,
  );

  // DELETE /ponto/:id
  server.delete(
    "/:id",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Remove uma batida de ponto",
        tags: ["Ponto"],
        params: z4.object({
          id: z4.uuid(),
        }),
        response: {
          200: z4.object({ message: z4.string() }),
          404: z4.object({ statusCode: z4.literal(404), message: z4.string() }),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.deletarBatida,
  );

  // GET /ponto/resumo-mensal?mes=&data=
  server.get(
    "/resumo-mensal",
    {
      preHandler: permission(["gestor", "rh", "administrador"]),
      schema: {
        summary: "Dashboard completo mensal",
        tags: ["Dashboard"],
        querystring: z4.object({
          // corrigido: era params
          data: z4.string().optional(),
          mes: z4.string().optional(),
        }),
        response: {
          200: z4.object({
            totalHorasExtras: z4.number(),
            totalAtrasos: z4.number(),
            totalFaltas: z4.number(),
            totalColaboradores: z4.number(),
            totalDiasProcessados: z4.number(),
            presencaHoje: z4.number(),
            mediaExtras: z4.number(),
            topAtrasos: z4.array(
              z4.object({
                id: z4.string(),
                nome: z4.string(),
                imageUrl: z4.string().nullable().optional(),
                setor: z4.string().nullable().optional(),
                cargo: z4.string().nullable().optional(),
                total: z4.number(),
              }),
            ),
            topFaltosos: z4.array(
              z4.object({
                id: z4.string(),
                nome: z4.string(),
                imageUrl: z4.string().nullable().optional(),
                setor: z4.string().nullable().optional(),
                cargo: z4.string().nullable().optional(),
                total: z4.number(),
              }),
            ),
            graficoExtras: z4.array(
              z4.object({
                data: z4.string(),
                total: z4.number(),
              }),
            ),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.relatorioMensal,
  );
}
