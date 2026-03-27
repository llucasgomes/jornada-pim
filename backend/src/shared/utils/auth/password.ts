import bcrypt from 'bcryptjs'

export function verificarSenha(senha: string, hash: string) {
  return bcrypt.compareSync(senha, hash)
}

export async function gerarHashSenha(senha: string) {
  const salt = bcrypt.genSaltSync(10)
  return await bcrypt.hashSync(senha, salt)
}