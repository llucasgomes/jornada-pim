import jwt from 'jsonwebtoken'
import { describe, expect, test } from 'vitest'
import { env } from '../../src/config/env'
import { gerarToken } from '../../src/shared/utils/auth'

describe('gerarToken', () => {
  test('deve gerar um token JWT válido', () => {
    const token = gerarToken('1', 'admin', 'Lucas', '123456')

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
  })

  test('deve conter os dados corretos no payload', () => {
    const token = gerarToken('1', 'admin', 'Lucas', '123456')

    const decoded = jwt.verify(token, env.JWT_SECRET) as any

    expect(decoded.id).toBe('1')
    expect(decoded.cargo).toBe('admin')
    expect(decoded.nome).toBe('Lucas')
    expect(decoded.matricula).toBe('123456')
  })

  test('deve ter expiração de 8 horas', () => {
    const token = gerarToken('1', 'admin', 'Lucas', '123456')

    const decoded = jwt.verify(token, env.JWT_SECRET) as any

    expect(decoded.exp).toBeDefined()
    expect(decoded.iat).toBeDefined()

    const duration = decoded.exp - decoded.iat

    expect(duration).toBe(60 * 60 * 8) // 8 horas
  })
})
