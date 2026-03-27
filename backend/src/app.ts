// app.ts

import fasttifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
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
import { globalErrorHandler } from './shared/errors/globalErrorHandler'

export function buildApp() {
  const server = fastify().withTypeProvider<ZodTypeProvider>()

  server.setSerializerCompiler(serializerCompiler)
  server.setValidatorCompiler(validatorCompiler)

  server.register(fasttifyCors, {
    origin: '*', // Permitir todas as origens (ajuste conforme necessário)
  })
  server.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API - JornadaPIM',
        version: '1.0.0',
        description: 'API de gestão de Jornada de Horas trabalhadas no PIM',
      },
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

  //handle errors Global
  // registrar o handler global
  server.setErrorHandler(globalErrorHandler)

  return server
}
