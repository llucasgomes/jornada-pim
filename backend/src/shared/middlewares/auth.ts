import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

export const authMiddleware = async (
  req: FastifyRequest,
  res: FastifyReply,
  done: () => void
) => {
  console.log('Entrou no authMiddleware')
  const schemaParams = z.string().min(1, 'Token inválido')

  try {
    const authHeader = req.headers.authorization
    const token = schemaParams.parse(authHeader?.split(' ')[1])

    if (!token) {
      console.log('Authorization header não encontrado')
      res.status(401).send({ error: 'Token não fornecido' })
      done()
    }

    const decoded = await req.jwtVerify<{ usuarioId: string; cargo: string }>()

    req.user = decoded // Adiciona os dados do usuário ao request
    console.log('Saindo no authMiddleware')
    done()
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error)
    res.status(401).send({ error: '401 - Token inválido' })
    done()
  }
}
