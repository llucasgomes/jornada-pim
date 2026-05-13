import { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "@/shared/errors/AppError";
import { SetorRepository } from "./setor.repository";

export const setorService = {
  async listar(req: FastifyRequest, reply: FastifyReply) {
    // Como o setor depende de empresa, geralmente filtramos por empresaId via query ou params
    const { empresaId } = req.query as { empresaId: string };

    if (!empresaId) throw new AppError("O ID da empresa é obrigatório", 400);

    const setores = await SetorRepository.findAllByEmpresa(empresaId);
    return reply.status(200).send(setores);
  },

  async buscarPorId(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const setorEncontrado = await SetorRepository.findById(id);
    if (!setorEncontrado) throw new AppError("Setor não encontrado", 404);

    return reply.status(200).send(setorEncontrado);
  },

  async criar(req: FastifyRequest, reply: FastifyReply) {
    const { nome, descricao, empresaId } = req.body as {
      nome: string;
      descricao?: string;
      empresaId: string;
    };

    if (!empresaId) throw new AppError("empresaId é obrigatório", 400);

    // Verifica unicidade do nome DENTRO da mesma empresa (conforme seu uniqueIndex)
    const jaExiste = await SetorRepository.findByNameInEmpresa(nome, empresaId);
    if (jaExiste)
      throw new AppError("Já existe um setor com esse nome nesta empresa", 409);

    const novoSetor = await SetorRepository.create({
      nome,
      descricao,
      empresaId,
    });

    return reply.status(201).send(novoSetor);
  },

  async atualizar(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const body = req.body as {
      nome?: string;
      descricao?: string;
      ativo?: boolean;
    };

    const setorEncontrado = await SetorRepository.findById(id);
    if (!setorEncontrado) throw new AppError("Setor não encontrado", 404);

    // Se estiver mudando o nome, verifica se o novo nome já existe na mesma empresa
    if (body.nome && body.nome !== setorEncontrado.nome) {
      const nomeEmUso = await SetorRepository.findByNameInEmpresa(
        body.nome,
        setorEncontrado.empresaId,
      );
      if (nomeEmUso)
        throw new AppError(
          "Já existe um setor com esse nome nesta empresa",
          409,
        );
    }

    const atualizado = await SetorRepository.update(id, body);
    return reply.status(200).send(atualizado);
  },

  async deletar(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const setorEncontrado = await SetorRepository.findById(id);
    if (!setorEncontrado) throw new AppError("Setor não encontrado", 404);

    const deletado = await SetorRepository.delete(id);

    return reply.status(200).send({
      message: "Setor removido com sucesso",
      setor: deletado,
    });
  },
};
