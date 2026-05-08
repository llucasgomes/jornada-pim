import { internalServerErrorSchema, notFoundErrorSchema } from "@/shared/errors/errorSchemas";
import { permission } from "@/shared/middlewares/permission";
import { FastifyInstance } from "fastify";
import z4 from "zod/v4";
import { registroPontoService } from "../registro-ponto/registro-ponto.service";
import { userEmpresaService } from "../user-empresa/user-empresa.service";
import { userResponseDto } from "../user/user.dto";
import { userService } from "../user/user.service";
import { historicoAgrupadoSchema } from "../user-empresa/user-empresa.dto";
import { setorService } from "../setores/setor.service";

const setorSchema = z4.object({
  id: z4.string(),
  empresaId: z4.string(), // Adicionado pois é parte do seu schema
  nome: z4.string(),
  descricao: z4.string().nullable(),
  ativo: z4.boolean(),
  createdAt: z4.string(),
  updatedAt: z4.string(),
});


export default function rhController(_server: FastifyInstance) {
  // Rota para obter histórico de ponto por período
  _server.get(
    "/:usuario_id/historico",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna histórico de ponto por período",
        tags: ["RH"],
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
  _server.post(
    "/colaboradores/sector",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna colaboradores por setor",
        tags: ["RH"],
        body: z4.object({
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

  // Rota para listar colaboradores por setor
  _server.post(
    "/colaboradores",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna todos os  colaboradores",
        tags: ["RH"],
        body: z4.object({
          empresaId: z4.string().uuid(),
        }),
        response: {
          200: z4.array(z4.any()),
          500: internalServerErrorSchema,
        },
      },
    },
    userEmpresaService.listarPorEmpresa,
  );

  // GET /ponto/:usuario_id/relatorio-mensal?mes=&ano=
  _server.get(
    "/:usuario_id/relatorio-mensal",
    {
      // preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Retorna relatório mensal consolidado",
        tags: ["RH"],
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
        tags: ["RH"],
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
        tags: ["RH"],
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
              }),
            ),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    registroPontoService.relatorioMensalPorSetor,
  );
  // Rota para obter usuario pelo usuarioId
  _server.get(
    "/colaborador/:userId",
    {
      schema: {
        summary: "Rota para obter um usuário pela ID",
        tags: ["RH"],
        params: z4.object({
          userId: z4.string().uuid(),
        }),
        response: {
          200: userResponseDto,
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    userService.findById,
  );
  // Rota para obter o histórico de batidas de um colaborador
  _server.get(
    "/colaborador/:usuarioEmpresaId/historico",
    {
      schema: {
        summary: "Retorna o histórico de batidas de um colaborador",
        tags: ["RH"],
        params: z4.object({
          usuarioEmpresaId: z4.string().uuid(),
        }),
        response: {
          200: historicoAgrupadoSchema,
        },
      },
    },
    userEmpresaService.buscarHistoricoBatidas,
  );
  //desligar colaborador da empresa (soft delete)
  _server.post(
    "/desligar-colaborador",
    {
      schema: {
        summary: "Desliga um colaborador da empresa",
        tags: ["RH"],
        body: z4.object({
          usuarioEmpresaId: z4.string().uuid(),
        }),
        response: {
          //  200: historicoAgrupadoSchema,
        },
      },
    },
    userEmpresaService.desligar,
  );

  _server.put(
    "/colaborador/:usuarioEmpresaId",
    {
      schema: {
        summary: "Atualiza campos específicos do vínculo do colaborador",
        tags: ["RH"],
        params: z4.object({
          usuarioEmpresaId: z4.string().uuid(),
        }),
        body: z4.object({
          nome: z4.string().optional(),
          imageUrl: z4.string().optional(),
          perfil: z4
            .enum(["colaborador", "gestor", "rh", "administrador"])
            .optional(),
          cargo: z4.string().optional(),
          setor: z4.string().optional(),
          turno: z4
            .enum(["1 turno", "2 turno", "3 turno", "Comercial", "Especial"])
            .optional(),
          horarioEntrada: z4.string().optional(),
          horarioSaida: z4.string().optional(),
          cargaHorariaDia: z4.union([z4.number(), z4.string()]).optional(),
        }),
        response: {
          200: z4.object({
            message: z4.string(),
            //  data: z4.any(),
          }),
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    userEmpresaService.atualizarVinculo,
  );
  _server.get(
    "/all-setor",
    {
      //  preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Listar todos os setores",
        tags: ["RH"],
        querystring: z4.object({
          empresaId: z4.string().describe("ID da empresa para filtrar setores"),
        }),
        response: {
          200: z4.array(setorSchema),
          500: internalServerErrorSchema,
        },
      },
    },
    setorService.listar,
  );

  // GET /setores/:id
  _server.get(
    "/setores/:id",
    {
      // CORREÇÃO: preHandler movido para fora do objeto schema
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Buscar setor por ID",
        tags: ["RH"],
        params: z4.object({ id: z4.string() }),
        response: {
          200: setorSchema,
          404: z4.object({ message: z4.string() }),
          500: internalServerErrorSchema,
        },
      },
    },
    setorService.buscarPorId,
  );

  // POST /setores
  _server.post(
    "/setore/register",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Criar novo setor",
        tags: ["RH"],
        body: z4.object({
          nome: z4.string().min(1, "Nome é obrigatório"),
          descricao: z4.string().optional(),
          empresaId: z4.string().min(1, "empresaId é obrigatório"), // Adicionado
        }),
        response: {
          201: setorSchema,
          409: z4.object({ message: z4.string() }),
          500: internalServerErrorSchema,
        },
      },
    },
    setorService.criar,
  );
  // PATCH /setores/:id
  _server.patch(
    "/setores/:id",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Atualizar setor",
        tags: ["RH"],
        params: z4.object({ id: z4.string() }),
        body: z4.object({
          nome: z4.string().optional(),
          descricao: z4.string().optional(),
          ativo: z4.boolean().optional(),
        }),
        response: {
          200: setorSchema,
          404: z4.object({ message: z4.string() }),
          409: z4.object({ message: z4.string() }),
          500: internalServerErrorSchema,
        },
      },
    },
    setorService.atualizar,
  );
  // DELETE /setores/:id
  _server.delete(
    "/setores/:id",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Desativar setor",
        tags: ["RH"],
        params: z4.object({ id: z4.string() }),
        response: {
          200: z4.object({ message: z4.string(), setor: setorSchema }),
          404: z4.object({ message: z4.string() }),
          500: internalServerErrorSchema,
        },
      },
    },
    setorService.deletar,
  );
}
