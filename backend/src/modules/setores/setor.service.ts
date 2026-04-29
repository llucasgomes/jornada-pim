import { FastifyReply, FastifyRequest } from 'fastify'
import { setorRepository } from './setor.repository'
import { AppError } from '@/shared/errors/AppError'

export const setorService = {
  async listar(req: FastifyRequest, reply: FastifyReply) {
    const setores = await setorRepository.findAll()
    return reply.status(200).send(setores)
  },

  async buscarPorId(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }

    const setorEncontrado = await setorRepository.findById(id)
    if (!setorEncontrado) throw new AppError('Setor não encontrado', 404)

    return reply.status(200).send(setorEncontrado)
  },

  async criar(req: FastifyRequest, reply: FastifyReply) {
    const { nome, descricao } = req.body as {
      nome: string
      descricao?: string
    }

    const jaExiste = await setorRepository.findByNome(nome)
    if (jaExiste) throw new AppError('Já existe um setor com esse nome', 409)

    const novoSetor = await setorRepository.create({ nome, descricao })
    return reply.status(201).send(novoSetor)
  },

  async atualizar(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }
    const body = req.body as {
      nome?: string
      descricao?: string
      ativo?: boolean
    }

    const setorEncontrado = await setorRepository.findById(id)
    if (!setorEncontrado) throw new AppError('Setor não encontrado', 404)

    if (body.nome && body.nome !== setorEncontrado.nome) {
      const nomeEmUso = await setorRepository.findByNome(body.nome)
      if (nomeEmUso) throw new AppError('Já existe um setor com esse nome', 409)
    }

    const atualizado = await setorRepository.update(id, body)
    return reply.status(200).send(atualizado)
  },

  async deletar(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }

    const setorEncontrado = await setorRepository.findById(id)
    if (!setorEncontrado) throw new AppError('Setor não encontrado', 404)

    const deletado = await setorRepository.delete(id)
    return reply
      .status(200)
      .send({ message: 'Setor desativado com sucesso', setor: deletado })
  },
}
