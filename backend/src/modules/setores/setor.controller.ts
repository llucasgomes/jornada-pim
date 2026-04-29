import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";
import { setorService } from "./setor.service";
import { internalServerErrorSchema } from "@/shared/errors/errorSchemas";

const setorSchema = z4.object({
  id: z4.string(),
  nome: z4.string(),
  descricao: z4.string().nullable(),
  ativo: z4.boolean(),
  createdAt: z4.string(),
  updatedAt: z4.string(),
});

export default function setorController(server: FastifyInstance) {
  // GET /setores
  server.get(
    "/",
    {
      schema: {
        summary: "Listar todos os setores ativos",
        tags: ["Setor"],
        response: {
          200: z4.array(setorSchema),
          500: internalServerErrorSchema,
        },
      },
    },
    setorService.listar,
  );

  // GET /setores/:id
  server.get(
    "/:id",
    {
      schema: {
        summary: "Buscar setor por ID",
        tags: ["Setor"],
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
  server.post(
    "/",
    {
      schema: {
        summary: "Criar novo setor",
        tags: ["Setor"],
        body: z4.object({
          nome: z4.string().min(1, "Nome é obrigatório"),
          descricao: z4.string().optional(),
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
  server.patch(
    "/:id",
    {
      schema: {
        summary: "Atualizar setor",
        tags: ["Setor"],
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
  server.delete(
    "/:id",
    {
      schema: {
        summary: "Desativar setor",
        tags: ["Setor"],
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
