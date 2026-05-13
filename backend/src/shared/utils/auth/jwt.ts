import jwt from "jsonwebtoken";
import { env } from "@/config/env";

const SECRET_KEY = env.JWT_SECRET;

type TokenPayload = {
  id: string;
  nome: string;
  imageUrl: string | null;
  vinculo: {
    id: string;
    empresaId: string;
    perfil: "colaborador" | "gestor" | "rh" | "administrador";
    cargo: string | null;
    setor: string | null;
  };
};



export function gerarToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "8h",
  });
}
