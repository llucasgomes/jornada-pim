import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";

import { permission } from "@/shared/middlewares/permission";

import {
  createUsuarioEmpresaDto,
  usuarioEmpresaResponseDto,
} from "./user-empresa.dto";
import { usuarioEmpresaService } from "./user-empresa.service";

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
    usuarioEmpresaService.contratar,
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
    usuarioEmpresaService.desligar,
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
    usuarioEmpresaService.listarPorEmpresa
  );
}
