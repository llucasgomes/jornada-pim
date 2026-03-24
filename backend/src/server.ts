import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastify, { FastifyInstance } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import ScalarReferencies from '@scalar/fastify-api-reference'

//instanciar
const server: FastifyInstance = fastify().withTypeProvider<ZodTypeProvider>()

//configurações
server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

//Plugins
server.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'PIM API',
      description: 'API para gerenciamento de produtos',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

//rotas
server.get('/', async (request, reply) => {
  return reply.send('Hello World')
})

server.register(ScalarReferencies, {
  routePrefix: '/api-docs',
  configuration: {
    theme: 'kepler',
  },
})

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Servidor rodando em ${address}`)
})
