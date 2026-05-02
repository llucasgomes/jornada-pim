import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/AppError";
import z4 from "zod/v4";

// 🎯 schema correto do token
const tokenPayloadSchema = z4.object({
  userId: z4.string().uuid(),
  usuarioEmpresaId: z4.string().uuid(),
  empresaId: z4.string().uuid(),
  perfil: z4.string(),
});

type TokenPayload = z4.infer<typeof tokenPayloadSchema>;

export const permission = (rolesPermitidas: string[]) => {
  return async (req: FastifyRequest, _res: FastifyReply) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) throw new AppError("Token não fornecido", 401);

    // 🔐 verifica JWT
    const payload = await req.jwtVerify();

    // ✅ valida estrutura do token
    const parseResult = tokenPayloadSchema.safeParse(payload);

    if (!parseResult.success) {
      throw new AppError("Token inválido", 401);
    }

    const user = parseResult.data;

    // 🔑 valida permissão
    if (!rolesPermitidas.includes(user.perfil)) {
      throw new AppError("Acesso negado", 403);
    }

    // 💡 injeta no request
    req.user = user as TokenPayload;
  };
};
