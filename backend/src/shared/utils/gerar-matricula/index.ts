import { db } from "@/config/database";
import { empresa } from "@/database/schemas";
import { AppError } from "@/shared/errors/AppError";
import { eq, sql } from "drizzle-orm";

export async function gerarMatricula(empresaId: string) {
  const [empresaAtualizada] = await db
    .update(empresa)
    .set({
      sequencialMatricula: sql`${empresa.sequencialMatricula} + 1`,
    })
    .where(eq(empresa.id, empresaId))
    .returning({
      sequencial: empresa.sequencialMatricula,
      nome: empresa.nome,
    });

  if (!empresaAtualizada) {
    throw new AppError("Empresa não encontrada", 404);
  }

  const numero = empresaAtualizada.sequencial;
  const sigla = gerarSiglaEmpresa(empresaAtualizada.nome);

  return `${sigla}-${String(numero).padStart(4, "0")}`;
}

function gerarSiglaEmpresa(nome: string) {
  return nome
    .split(" ")
    .filter((p) => p.length > 2)
    .map((p) => p[0].toUpperCase())
    .join("")
    .slice(0, 4);
}
