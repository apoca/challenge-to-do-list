import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { AuthService } from './auth.service'
import { UserService } from '../users/user.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

const userService = new UserService()
const authService = new AuthService(userService)

export default async function authRoutes(
    fastify: FastifyInstance,
): Promise<void> {
    fastify.post(
        '/register',
        {
            schema: {
                tags: ['Auth'],
                body: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 12 },
                    },
                },
                response: {
                    201: {
                        description: 'User successfully registered',
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            username: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const body = plainToInstance(RegisterDto, request.body)
            const errors = await validate(body)
            if (errors.length > 0) {
                reply.status(400).send({
                    message: 'Validation failed',
                    errors: errors.map((err) =>
                        Object.values(err.constraints || {}).join(', '),
                    ),
                })
                return
            }

            const user = await authService.register(
                body.username,
                body.password,
            )
            reply.code(201).send(user)
        },
    )

    fastify.post(
        '/login',
        {
            schema: {
                tags: ['Auth'],
                body: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        description: 'Successfully logged in',
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const body = plainToInstance(LoginDto, request.body)
            const errors = await validate(body)
            if (errors.length > 0) {
                reply.status(400).send({
                    message: 'Validation failed',
                    errors: errors.map((err) =>
                        Object.values(err.constraints || {}).join(', '),
                    ),
                })
                return
            }

            const token = await authService.login(body.username, body.password)
            if (!token) {
                reply.status(401).send({ message: 'Invalid credentials' })
                return
            }

            reply.send({ token })
        },
    )
}
