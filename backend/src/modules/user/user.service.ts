import { AppError } from '@/shared/errors/AppError'
import { gerarHashSenha } from '@/shared/utils/auth'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createUserDto } from './dtos/create-user.dto'
import { userRepository } from './user.repository'
import { gerarMatricula } from '@/shared/utils/gerar-matricula'
import { uploadImage } from '@/shared/utils/upload-image'
import type {  MultipartFile } from '@fastify/multipart'


type UploadedFile = {
  buffer: Buffer;
  filename: string;
};

export const userService = {
 
  async create(req: FastifyRequest, reply: FastifyReply) {
    const { senha, ...rest } = createUserDto.parse(req.body)

    const file = (await req.file()) as MultipartFile | undefined;

    let imageUrl

    if (file)  {
      const buffer = await file.toBuffer()
      imageUrl = await uploadImage(buffer, file.filename);
    }  


    const matricula = await gerarMatricula()
    
    const hashedPassword = await gerarHashSenha(senha)

    const user = await userRepository.create({
      ...rest,
      matricula,
      senha: hashedPassword,
      imageUrl,
    });

    return reply.status(201).send(user)
  },

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userRepository.findAll()
    return reply.status(200).send(users)
  },

  async findAllActive(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userRepository.findAll()
    return reply.status(200).send(users)
  },
  async findAllInactive(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userRepository.findAllInactive()
    return reply.status(200).send(users)
  },

  async findById(req: FastifyRequest, reply: FastifyReply) {
    const { matricula } = req.params as { matricula: string }

    const user = await userRepository.findByMatricula(matricula)
    if (!user) throw new AppError('Usuário não encontrado', 404)

    return reply.status(200).send(user)
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { matricula } = req.params as { matricula: string }
    const data = createUserDto.partial().parse(req.body)

    if (data.senha) {
      data.senha = await gerarHashSenha(data.senha)
    }

    const updatedUser = await userRepository.update(matricula, data)
    if (!updatedUser) throw new AppError('Usuário não encontrado', 404)

    return reply.status(200).send(updatedUser)
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { matricula } = req.params as { matricula: string }

    const deleted = await userRepository.delete(matricula)
    if (!deleted) throw new AppError('Usuário não encontrado', 404)

    return reply.status(200).send({ message: 'Usuário deletado com sucesso' })
  }
  
}
