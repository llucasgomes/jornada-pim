import { createUserDto } from './user.dto';
import { AppError } from "@/shared/errors/AppError";
import { gerarHashSenha } from "@/shared/utils/auth";
import type { FastifyReply, FastifyRequest } from "fastify";
import { userRepository } from "./user.repository";

export const userService = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const { senha, cpf, nome } = createUserDto.parse(req.body);

    // 🔎 verifica se já existe usuário global
    const userExistente = await userRepository.findByCpf(cpf);

    if (userExistente) {
      throw new AppError("Usuário já existe com esse CPF", 409);
    }

    const hashedPassword = await gerarHashSenha(senha);

    const user = await userRepository.create({
      nome,
      cpf,
      senha: hashedPassword,
    });

    return reply.status(201).send(user);
  },

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userRepository.findAll();
    return reply.status(200).send(users);
  },

  async findAllActive(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userRepository.findAllActive();
    return reply.status(200).send(users);
  },

  async findAllInactive(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userRepository.findAllInactive();
    return reply.status(200).send(users);
  },

  async findById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const user = await userRepository.findById(id);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    return reply.status(200).send(user);
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const data = createUserDto.partial().parse(req.body);

    if (data.senha) {
      data.senha = await gerarHashSenha(data.senha);
    }

    const updatedUser = await userRepository.update(id, data);
    if (!updatedUser) throw new AppError("Usuário não encontrado", 404);

    return reply.status(200).send(updatedUser);
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const deleted = await userRepository.delete(id);
    if (!deleted) throw new AppError("Usuário não encontrado", 404);

    return reply.status(200).send({
      message: "Usuário desativado com sucesso",
    });
  },
};
