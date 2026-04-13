import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { AppError } from '../errors/AppError'
import { userResponseDto } from '@/modules/user/dtos/user-response'

// cria um schema parcial com Zod
const userPartialSchema = userResponseDto.partial()

interface UserPayload {
  id?: string
  perfil?: string
  nome?: string
  matricula?: string
}

export const authMiddleware = async (
  req: FastifyRequest,
  res: FastifyReply,
  done: () => void
) => {
  const schemaParams = z.string().min(1, 'Token inválido')

  try {
    const authHeader = req.headers.authorization
    const token = schemaParams.parse(authHeader?.split(' ')[1])

    if (!token) throw new AppError('Token não fornecido', 401)

    // pega o payload do JWT
    const payload = await req.jwtVerify<UserPayload>()

    // valida parcialmente com Zod
    const parseResult = userPartialSchema.safeParse(payload)

    if (!parseResult.success)
      throw new AppError('Dados do usuário inválidos', 401)

    req.user = payload // Adiciona os dados do usuário ao request
    done()
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error)
    throw new AppError('Token inválido', 401)
  }
}
