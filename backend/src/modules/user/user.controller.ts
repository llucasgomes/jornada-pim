import type { FastifyInstance } from 'fastify'
import z4 from 'zod/v4'
import {
  internalServerErrorSchema,
  notFoundErrorSchema,
} from '@/shared/errors/errorSchemas'
import { permission } from '@/shared/middlewares/permission'
import { createUserDto } from './dtos/create-user.dto'
import { userResponseDto } from './dtos/user-response'
import { userService } from './user.service'

export default function userController(_server: FastifyInstance) {
  _server.post(
    '/register',
    {
      preHandler: permission(['colaborador', 'gestor', 'rh']),
      schema: {
        summary: 'Rota para registrar um novo usuário',
        tags: ['Usuário'],
        body: createUserDto,
        response: {
          201: userResponseDto,
        },
      },
    },
    userService.create
  )

  //Rota para obter todos os usuarios ativos e Inativos
  _server.get(
    '/all',
    {
      schema: {
        summary: 'Rota para obter todos os usuários',
        tags: ['Usuário'],
        response: {
          200: z4.array(userResponseDto),
          500: internalServerErrorSchema,
        },
      },
    },
    userService.findAll
  )

  //Rota para obter todos os usuarios ativos
  _server.get(
    '/findAllActive',
    {
      schema: {
        summary: 'Rota para obter todos os usuários ativos',
        tags: ['Usuário'],
        response: {
          200: z4.array(userResponseDto),
          500: internalServerErrorSchema,
        },
      },
    },
    userService.findAllActive
  )

  //Rota para obter todos os usuarios ativos
  _server.get(
    '/findAllInactive',
    {
      schema: {
        summary: 'Rota para obter todos os usuários ativos',
        tags: ['Usuário'],
        response: {
          200: z4.array(userResponseDto),
          500: internalServerErrorSchema,
        },
      },
    },
    userService.findAllInactive
  )
  // Rota para obter usuario pelo id (matricula)
  _server.get(
    '/:matricula',
    {
      schema: {
        summary: 'Rota para obter um usuário por matrícula',
        tags: ['Usuário'],
        params: z4.object({
          matricula: z4.string().min(1, 'A matrícula é obrigatória'),
        }),
        response: {
          200: userResponseDto,
          404: notFoundErrorSchema,
          500: internalServerErrorSchema,
        },
      },
    },
    userService.findById
  )

  //Rota para atualizar usuario pelo id (matricula)
  _server.put(
    '/:matricula',
    {
      schema: {
        summary: 'Rota para atualizar um usuário por matrícula',
        tags: ['Usuário'],
        params: z4.object({
          matricula: z4.string().min(1, 'A matrícula é obrigatória'),
        }),
        body: createUserDto.partial(),
        response: {
          200: userResponseDto,
          404: z4.object({
            statusCode: z4.literal(404),
            error: z4.literal('Not Found'),
            message: z4.string(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    userService.update
  )

  // Rota para desativar usuario pelo id (matricula)
  _server.put(
    '/disable/:matricula',
    {
      schema: {
        summary: 'Rota para desativar um usuário por matrícula',
        tags: ['Usuário'],
        params: z4.object({
          matricula: z4.string().min(1, 'A matrícula é obrigatória'),
        }),
        response: {
          200: z4.object({
            message: z4.string(),
          }),
          404: z4.object({
            statusCode: z4.literal(404),
            error: z4.literal('Not Found'),
            message: z4.string(),
          }),
          500: internalServerErrorSchema,
        },
      },
    },
    userService.delete
  )
}
