import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";

import { permission } from "@/shared/middlewares/permission";

import {
  createUsuarioEmpresaDto,
  usuarioEmpresaResponseDto,
} from "./user-empresa.dto";
import { userEmpresaService } from "./user-empresa.service";

export default function usuarioEmpresaController(server: FastifyInstance) {
  // ✅ CONTRATAR (CRIAR VÍNCULO)
  server.post(
    "/usuario-empresa",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Contratar colaborador",
        tags: ["Usuário Empresa"],
        body: createUsuarioEmpresaDto,
        response: {
          201: usuarioEmpresaResponseDto,
        },
      },
    },
    userEmpresaService.contratar,
  );

  // 🚪 DESLIGAR
  server.put(
    "/usuario-empresa/:id/desativar",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Desligar colaborador",
        tags: ["Usuário Empresa"],
        params: z4.object({
          id: z4.string(),
        }),
        response: {
          200: usuarioEmpresaResponseDto,
        },
      },
    },
    userEmpresaService.desligar,
  );

  // 📄 LISTAR POR EMPRESA
  server.get(
    "/usuario-empresa/empresa/:empresaId",
    {
      preHandler: permission(["gestor", "rh"]),
      schema: {
        summary: "Listar colaboradores da empresa",
        tags: ["Usuário Empresa"],
        params: z4.object({
          empresaId: z4.string(),
        }),
        response: {
          200: z4.array(usuarioEmpresaResponseDto),
        },
      },
    },
    userEmpresaService.listarPorEmpresa
  );

  // ROTAS MIGRADAS DOS CONTROLLERS ANTIGOS (GESTOR / RH)
  const prefixes = ["/gestor", "/rh"];

  for (const prefix of prefixes) {
    // Listar colaboradores por setor
    server.post(
      `${prefix}/colaboradores/sector`,
      {
        schema: {
          summary: `Retorna colaboradores por setor (${prefix})`,
          tags: ["Usuário Empresa"],
          body: z4.object({
            empresaId: z4.string().uuid(),
            setor: z4.string().max(100),
          }),
        },
      },
      userEmpresaService.listarPorEmpresaporSetor
    );

    // Listar todos os colaboradores da empresa
    server.post(
      `${prefix}/colaboradores`,
      {
        schema: {
          summary: `Retorna todos os colaboradores (${prefix})`,
          tags: ["Usuário Empresa"],
          body: z4.object({
            empresaId: z4.string().uuid(),
          }),
        },
      },
      userEmpresaService.listarPorEmpresa
    );

    // Obter dados de um colaborador específico
    server.get(
      `${prefix}/colaborador/:usuarioEmpresaId`,
      {
        schema: {
          summary: `Retorna os dados de um colaborador (${prefix})`,
          tags: ["Usuário Empresa"],
          params: z4.object({
            usuarioEmpresaId: z4.string().uuid(),
          }),
        },
      },
      userEmpresaService.buscarPorId
    );

    // Obter histórico de batidas do colaborador
    server.get(
      `${prefix}/colaborador/:usuarioEmpresaId/historico`,
      {
        schema: {
          summary: `Retorna histórico de batidas de um colaborador (${prefix})`,
          tags: ["Usuário Empresa"],
          params: z4.object({
            usuarioEmpresaId: z4.string().uuid(),
          }),
        },
      },
      userEmpresaService.buscarHistoricoBatidas
    );

    // Desligar colaborador
    server.post(
      `${prefix}/desligar-colaborador`,
      {
        schema: {
          summary: `Desliga colaborador da empresa (soft delete) (${prefix})`,
          tags: ["Usuário Empresa"],
          body: z4.object({
            usuarioEmpresaId: z4.string().uuid(),
          }),
        },
      },
      userEmpresaService.desligar
    );

    // Atualizar vínculo
    server.put(
      `${prefix}/colaborador/:usuarioEmpresaId`,
      {
        schema: {
          summary: `Atualiza vínculo do colaborador (${prefix})`,
          tags: ["Usuário Empresa"],
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
              .enum(["manha", "tarde", "noite", "administrativo"])
              .optional(),
            horarioEntrada: z4.string().optional(),
            horarioSaida: z4.string().optional(),
            cargaHorariaDia: z4.union([z4.number(), z4.string()]).optional(),
          }),
        },
      },
      userEmpresaService.atualizarVinculo
    );
  }
}
