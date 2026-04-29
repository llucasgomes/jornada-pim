import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

const SECRET_KEY = env.JWT_SECRET

export function gerarToken(
  id: string,
  perfil: string,
  nome: string,
  matricula: string,
  imageUrl: string | null
) {
  return jwt.sign({ id, perfil, nome, matricula, imageUrl }, SECRET_KEY, {
    expiresIn: '8h',
  })
}
