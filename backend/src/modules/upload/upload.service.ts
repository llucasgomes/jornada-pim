import type { FastifyReply, FastifyRequest } from "fastify";
import type { MultipartFile } from "@fastify/multipart";

import { AppError } from "@/shared/errors/AppError";
import { uploadImage } from "@/shared/utils/upload-image";

export const uploadService = {
  async upload(req: FastifyRequest, reply: FastifyReply) {
    const file = (await req.file()) as MultipartFile | undefined;

    if (!file) {
      throw new AppError("Arquivo não enviado", 400);
    }

    // 🔒 valida tipo
    if (!file.mimetype.startsWith("image/")) {
      throw new AppError("Apenas imagens são permitidas", 400);
    }

    const buffer = await file.toBuffer();

    // 🧼 nome único
    const filename = `${Date.now()}-${file.filename}`;

    const url = await uploadImage(buffer, filename);

    return reply.status(200).send({ url });
  },
};
