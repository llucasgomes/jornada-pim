import type { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '@/shared/errors/AppError'
import { gerarToken, verificarSenha } from '@/shared/utils/auth'
import { userRepository } from '../user/user.repository'
import { authRequestSchema } from './auth.schema'

export const authService = async (req: FastifyRequest, reply: FastifyReply) => {
  const { matricula, senha } = authRequestSchema.parse(req.body)

  const user = await userRepository.findById(matricula)

  if (!user) throw new AppError('Credenciais inválidas', 401)

  const senhaValida = await verificarSenha(senha, user.senha)

  if (!senhaValida) throw new AppError('Credenciais inválidas', 401)

  const token = gerarToken(user.id, user.perfil, user.nome, user.matricula)

  return reply.status(200).send({
    message: 'Login autenticado',
    token,
  })
}
