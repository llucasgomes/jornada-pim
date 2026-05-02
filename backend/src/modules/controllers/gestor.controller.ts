import { internalServerErrorSchema } from "@/shared/errors/errorSchemas";
import { permission } from "@/shared/middlewares/permission";
import { FastifyInstance } from "fastify";
import z4 from "zod/v4";
import { registroPontoService } from "../registro-ponto/registro-ponto.service";
import { userEmpresaService } from "../user-empresa/user-empresa.service";

export default function gestorController(_server: FastifyInstance) {
  // Rota para obter histórico de ponto por período
  _server.get(
    "/:usuario_id/historico",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna histórico de ponto por período",
        tags: ["Gestor"],
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

  // Rota para listar colaboradores por setor
  _server.get(
    "/:empresaId/setor/:setor/colaboradores",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna colaboradores por setor",
        tags: ["Gestor"],
        params: z4.object({
          empresaId: z4.string().uuid(),
          setor: z4.string().max(100),
        }),
        response: {
          200: z4.array(z4.any()),
          500: internalServerErrorSchema,
        },
      },
    },
    userEmpresaService.listarPorEmpresaporSetor,
  );

  // GET /ponto/:usuario_id/relatorio-mensal?mes=&ano=
  _server.get(
    "/:usuario_id/relatorio-mensal",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna relatório mensal consolidado",
        tags: ["Gestor"],
        params: z4.object({
          usuario_id: z4.string().uuid(),
        }),
        querystring: z4.object({
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

  // GET /ponto/resumo-mensal?mes=&data=
  _server.get(
    "/resumo-mensal",
    {
      // preHandler: permission(["gestor", "rh", "administrador"]),
      schema: {
        summary: "Retorna resumo mensal para Painel de Dashboard",
        tags: ["Gestor"],
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

  // GET /ponto/resumo-mensal?mes=&data=
  _server.get(
    "/resumo-mensal-setor",
    {
      // preHandler: permission(["gestor", "rh", "administrador"]),
      schema: {
        summary: "Retorna resumo mensal para Painel de Dashboard por setor",
        tags: ["Gestor"],
        querystring: z4.object({
          setor: z4.string(),
          empresaId: z4.string().uuid(),
          mes: z4.string().optional(),
        }),
        response: {
          200: z4.object({
            totalHorasExtras: z4.string(),
            totalAtrasos: z4.string(),
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
            topExtras: z4.array(
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
            historicoMeses: z4.array(
              z4.object({
                mes: z4.string(),
                extras: z4.number(),
                atrasos: z4.number(),
                faltas: z4.number(),
              })
            ),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.relatorioMensalPorSetor,
  );
}
