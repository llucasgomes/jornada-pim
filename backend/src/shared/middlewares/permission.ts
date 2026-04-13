import type { FastifyReply, FastifyRequest } from 'fastify'
import { userResponseDto } from '@/modules/user/dtos/user-response'
import { AppError } from '../errors/AppError'

// cria um schema parcial com Zod
const userPartialSchema = userResponseDto.partial()

interface UserPayload {
  id?: string
  perfil?: string
  nome?: string
  matricula?: string
}

export const permission = (rolesPermitidas: string[]) => {
  return async (req: FastifyRequest, _res: FastifyReply) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) throw new AppError('Token não fornecido', 401)

    // pega o payload do JWT
    const payload = await req.jwtVerify<UserPayload>()

    // valida parcialmente com Zod
    const parseResult = userPartialSchema.safeParse(payload)

    if (!parseResult.success)
      throw new AppError('Dados do usuário inválidos', 401)

    const user = parseResult.data
    const role = user.perfil

    if (!role) throw new AppError('Dados do usuário ausentes', 401)

    if (!rolesPermitidas.includes(role)) {
      console.error(
        `Permissão negada: esperado ${rolesPermitidas}, recebeu ${role}`
      )
      throw new AppError('Acesso negado', 401)
    }

    return
  }
}
