// src/shared/utils/auth/bcrypt.spec.ts
import { describe, expect, test } from 'vitest'
import { gerarHashSenha, verificarSenha } from '../../src/shared/utils/auth'

describe('Hash de Passwords', () => {
  test('deve gerar um hash e verificar corretamente', async () => {
    const senha = 'minhaSenhaSecreta'

    const hash = await gerarHashSenha(senha)
    expect(hash).toBeTypeOf('string')
    expect(hash).not.toBe(senha) // hash deve ser diferente da senha original
  })

  test('deve validar a senha com sucesso', async () => {
    const senha = 'minhaSenhaSecreta'

    const hash = await gerarHashSenha(senha)
    const valida = verificarSenha(senha, hash)

    expect(valida).toBe(true)
  })

  test('deve validar a senha sem sucesso', async () => {
    const senha = 'minhaSenhaSecreta'

    const hash = await gerarHashSenha(senha)

    const invalida = verificarSenha('senhaErrada', hash)
    expect(invalida).toBe(false)
  })
})
