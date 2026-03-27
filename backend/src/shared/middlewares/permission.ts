import type { FastifyReply, FastifyRequest } from 'fastify'

export const permission = (rolesPermitidas: string[]) => {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const authHeader = req.headers.authorization

    const token = authHeader?.split(' ')[1]

    if (!token) {
      res.status(401).send({ error: 'Token não fornecido' })
      return
    }

    const { role, id } = await req.jwtVerify<{
      id: string
      role: string
    }>()

    if (!role) {
      res.status(401).send({ error: 'Dados do usuário ausentes' })
      return
    }

    if (!rolesPermitidas.includes(role)) {
      console.error(
        `Permissão negada: esperado ${rolesPermitidas}, recebeu ${role}`
      )
      res.status(403).send({ error: 'Acesso negado' })
      return
    }

    return
  }
}
