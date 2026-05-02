import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/shared/errors/AppError";
import { gerarToken, verificarSenha } from "@/shared/utils/auth";

import { userRepository } from "../user/user.repository";
import { userEmpresaRepository } from "../user-empresa/user-empresa.repository";

import { authRequestSchema } from "./auth.schema";

export const authService = {
  async login(req: FastifyRequest, reply: FastifyReply) {
    const { cpf, senha } = authRequestSchema.parse(req.body);

    // 🔎 1. usuário
    const user = await userRepository.findByCpfWithPassword(cpf);

    if (!user) throw new AppError("Credenciais inválidas", 401);

    // 🔐 2. senha
    const senhaValida = await verificarSenha(senha, user.senha);

    if (!senhaValida) throw new AppError("Credenciais inválidas", 401);

    // 🔎 3. vínculos ativos
    const vinculos = await userEmpresaRepository.findActiveByUser(user.id);

    if (vinculos.length === 0) {
      throw new AppError("Usuário não possui vínculo ativo", 403);
    }

    // ⚠️ regra atual: apenas 1 vínculo permitido
    const vinculo = vinculos[0];

    // 🔑 4. token baseado no vínculo
    const token = gerarToken({
      userId: user.id,
      usuarioEmpresaId: vinculo.id,
      empresaId: vinculo.empresaId,
      perfil: vinculo.perfil,
      nome: user.nome,
      imageUrl: user.imageUrl ?? null,
    });

    // 🎁 5. resposta
    return reply.status(200).send({
      message: "Login autenticado",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        imageUrl: user.imageUrl,
      },
      vinculo: {
        id: vinculo.id,
        empresaId: vinculo.empresaId,
        perfil: vinculo.perfil,
        cargo: vinculo.cargo,
        setor: vinculo.setor,
      },
    });
  },

  async getMe(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user as {
      userId: string;
      usuarioEmpresaId: string;
      empresaId: string;
      perfil: string;
    };

    if (!user?.userId) {
      throw new AppError("Não autenticado", 401);
    }

    const usuario = await userRepository.findById(user.userId);

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return reply.status(200).send({
      user: usuario,
      contexto: {
        usuarioEmpresaId: user.usuarioEmpresaId,
        empresaId: user.empresaId,
        perfil: user.perfil,
      },
    });
  },
};
