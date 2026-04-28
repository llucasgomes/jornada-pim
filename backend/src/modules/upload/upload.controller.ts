import type { FastifyInstance } from "fastify";
import z4 from "zod/v4";

import { uploadService } from "./upload.service";
import { permission } from "@/shared/middlewares/permission";
import { internalServerErrorSchema } from "@/shared/errors/errorSchemas";

export default function uploadController(_server: FastifyInstance) {
  _server.post(
    "/",
    {
      preHandler: permission(["colaborador", "gestor", "rh"]),
      schema: {
        summary: "Upload de imagem",
        tags: ["Upload"],
        consumes: ["multipart/form-data"], // 🔥 obrigatório
        response: {
          200: z4.object({
            url: z4.string().url(),
          }),
          400: z4.object({
            statusCode: z4.literal(400),
            message: z4.string(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    uploadService.upload,
  );
}
