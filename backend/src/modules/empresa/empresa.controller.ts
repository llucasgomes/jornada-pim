import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";
import {
  internalServerErrorSchema,
  notFoundErrorSchema,
} from "@/shared/errors/errorSchemas";
import { permission } from "@/shared/middlewares/permission";


import { empresaService } from "./empresa.service";
import { CreateEmpresaDto, EmpresaResponseDto } from "./empresa.dto";



export default function empresaController(_server: FastifyInstance) {
  // ✅ CREATE
  _server.post(
    "/",
    {
      preHandler: permission(["administrador", "rh"]),
      schema: {
        summary: "Rota para registrar uma nova empresa",
        tags: ["Empresa"],
        body: CreateEmpresaDto,
        response: {
          201: EmpresaResponseDto,
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.create,
  );

  // ✅ GET ALL
  _server.get(
    "/all",
    {
      schema: {
        summary: "Rota para obter todas as empresas",
        tags: ["Empresa"],
        response: {
          200: z4.array(EmpresaResponseDto),
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.findAll,
  );

  // ✅ GET ATIVAS
  _server.get(
    "/findAllActive",
    {
      schema: {
        summary: "Rota para obter empresas ativas",
        tags: ["Empresa"],
        response: {
          200: z4.array(EmpresaResponseDto),
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.findAllActive,
  );

  // ✅ GET INATIVAS
  _server.get(
    "/findAllInactive",
    {
      schema: {
        summary: "Rota para obter empresas inativas",
        tags: ["Empresa"],
        response: {
          200: z4.array(EmpresaResponseDto),
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.findAllInactive,
  );

  // ✅ GET BY ID
  _server.get(
    "/:id",
    {
      schema: {
        summary: "Rota para obter empresa por ID",
        tags: ["Empresa"],
        params: z4.object({
          id: z4.string().min(1, "ID é obrigatório"),
        }),
        response: {
          200: EmpresaResponseDto,
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.findById,
  );

  // ✅ GET BY CNPJ
  _server.get(
    "/cnpj/:cnpj",
    {
      schema: {
        summary: "Rota para obter empresa por CNPJ",
        tags: ["Empresa"],
        params: z4.object({
          cnpj: z4.string().min(14, "CNPJ inválido"),
        }),
        response: {
          200: EmpresaResponseDto,
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.findByCnpj,
  );

  // ✅ UPDATE
  _server.put(
    "/:id",
    {
      preHandler: permission(["administrador", "rh"]),
      schema: {
        summary: "Rota para atualizar empresa",
        tags: ["Empresa"],
        params: z4.object({
          id: z4.string().min(1, "ID é obrigatório"),
        }),
        body: CreateEmpresaDto.partial(),
        response: {
          200: EmpresaResponseDto,
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.update,
  );

  // ✅ DELETE (soft delete)
  _server.put(
    "/disable/:id",
    {
      preHandler: permission(["administrador"]),
      schema: {
        summary: "Rota para desativar empresa",
        tags: ["Empresa"],
        params: z4.object({
          id: z4.string().min(1, "ID é obrigatório"),
        }),
        response: {
          200: z4.object({
            message: z4.string(),
          }),
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.delete,
  );

  // ✅ RESTORE
  _server.patch(
    "/restore/:id",
    {
      preHandler: permission(["administrador"]),
      schema: {
        summary: "Rota para reativar empresa",
        tags: ["Empresa"],
        params: z4.object({
          id: z4.string().min(1, "ID é obrigatório"),
        }),
        response: {
          200: EmpresaResponseDto,
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    empresaService.restore,
  );
}
