// app.ts

import fasttifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import ScalarFastifyApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from './config/env'
import authRoutes from './modules/auth/auth.route'
import userRoutes from './modules/user/user.route'
import uploadRoutes from './modules/upload/upload.route'
import { globalErrorHandler } from './shared/errors/globalErrorHandler'
import registroPontoRoutes from './modules/registro-ponto/registro-ponto.route'
import dashboardRoutes from './modules/dashboard/dashboard.route'
import relatorioRoutes from './modules/relatorio/relatorio.route'
import setorRoutes from './modules/setores/setor.route'

export function buildApp() {
  const server = fastify().withTypeProvider<ZodTypeProvider>()

  server.setSerializerCompiler(serializerCompiler)
  server.setValidatorCompiler(validatorCompiler)

  server.register(fasttifyCors, {
    origin: '*', // Permitir todas as origens (ajuste conforme necessário)
  })

  server.register(fastifyMultipart)

  server.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API - JornadaPIM',
        version: '1.0.0',
        description: `
## Sobre o projeto

O **JornadaPIM** é uma plataforma web de controle de ponto e jornada de trabalho
desenvolvida para o **Polo Industrial de Manaus (PIM)**.

Substitui relógios de ponto físicos e planilhas manuais por um fluxo digital com
cálculo automático de horas trabalhadas, extras, atrasos e banco de horas.

---

## Autenticação

Todas as rotas (exceto \`POST /auth/login\`) exigem token JWT no header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

O token é obtido na rota \`POST /auth/login\` e expira em **8 horas**.

---

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| \`colaborador\` | Registra ponto, consulta próprio histórico e banco de horas |
| \`gestor\` | Acompanha equipe, visualiza dashboard, aprova ajustes |
| \`rh\` | Acesso total, cadastra colaboradores, gera espelho mensal |

---

## Regras de negócio

- Sequência obrigatória de batidas: \`entrada → saida_almoco → retorno_almoco → saida\`
- Timestamp gerado sempre pelo **servidor** — nunca pelo cliente
- Todo cálculo de horas é feito no backend com timezone **America/Manaus**
- Colaborador inativo não pode registrar ponto

---

## Credenciais de teste

| Matrícula | Senha | Perfil |
|---|---|---|
| PIM-0901 | 123456789 | gestor |
| PIM-0902 | 123456789 | gestor |
| PIM-0903 | 123456789 | rh |
| PIM-0001 | 123456789 | colaborador |
    `,
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', // Especifica que é um JWT
          },
        },
      },
      security: [{ bearerAuth: [] }], // Aplica o esquema de segurança globalmente
    },
    transform: jsonSchemaTransform,
  })

  server.register(ScalarFastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      theme: 'kepler',
    },
  })

  server.get('/', async () => {
    return { message: 'servidor ok' }
  })

  server.register(authRoutes)
  server.register(userRoutes)
  server.register(uploadRoutes)
  server.register(registroPontoRoutes)
  server.register(dashboardRoutes)
  server.register(relatorioRoutes)
  server.register(setorRoutes)

  //handle errors Global
  // registrar o handler global
  server.setErrorHandler(globalErrorHandler)

  return server
}
