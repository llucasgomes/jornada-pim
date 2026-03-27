import bcrypt from 'bcryptjs'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '@/config/database'
import { usuario } from '@/database/schemas'
import { AppError } from '@/shared/errors/AppError'
import { createUserDto } from './dtos/create-user.dto'
import { userRepository } from './user.repository'

export const userService = {
  //create user
  async create(req: FastifyRequest, reply: FastifyReply) {
    const { senha, ...rest } = createUserDto.parse(req.body)

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10)

    //envia para o banco de dados
    const [user] = await db
      .insert(usuario)
      .values({ ...rest, senha: hashedPassword })
      .returning()

    return reply.status(201).send(user)
  },
  //get all users
  async findAll() {
    return await userRepository.findAll()
  },

  //get user by id
  async findById(req: FastifyRequest, reply: FastifyReply) {
    const { matricula } = req.params as { matricula: string }
    const user = await userRepository.findById(matricula)

    if (!user) throw new AppError('Usuário não encontrado', 404)

    return reply.status(200).send(user)
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { matricula } = req.params as { matricula: string }
    const data = createUserDto.partial().parse(req.body)

    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10)
    }

    const updatedUser = await userRepository.update(matricula, data)

    if (!updatedUser) throw new AppError('Usuário não encontrado', 404)

    return reply.status(200).send(updatedUser)
  },

  //delete user by id
  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { matricula } = req.params as { matricula: string }

    const deleted = await userRepository.delete(matricula)

    if (!deleted) throw new AppError('Usuário não encontrado', 404)

    return reply.status(200).send({ message: 'Usuário deletado com sucesso' })
  },
}
