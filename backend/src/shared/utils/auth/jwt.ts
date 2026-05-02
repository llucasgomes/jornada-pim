import jwt from "jsonwebtoken";
import { env } from "@/config/env";

const SECRET_KEY = env.JWT_SECRET;

type TokenPayload = {
  userId: string;
  usuarioEmpresaId: string;
  empresaId: string;
  perfil: string;
  nome: string;
  imageUrl: string | null;
};

export function gerarToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "8h",
  });
}
