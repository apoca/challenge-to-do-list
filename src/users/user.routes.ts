import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { UserService } from './user.service'
import { roleMiddleware } from '../middlewares/role.middleware'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserResponseDto } from './dto/user-response.dto'

const userService = new UserService()

export default async function userRoutes(
    fastify: FastifyInstance,
): Promise<void> {
    // Get current user profile
    fastify.get(
        '/me',
        {
            schema: {
                tags: ['Users'],
                security: [{ BearerAuth: [] }],
                response: {
                    200: {
                        description: 'Current user profile',
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            username: { type: 'string', format: 'email' },
                            role: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user
            if (!user) {
                return reply.status(401).send({ message: 'Unauthorized' })
            }

            const userData = await userService.findById(user.id)
            if (!userData) {
                return reply.status(404).send({ message: 'User not found' })
            }

            const sanitizedUser = plainToInstance(UserResponseDto, userData, {
                excludeExtraneousValues: true,
            })
            reply.send(sanitizedUser)
        },
    )

    // List all users (Admin only)
    fastify.get(
        '/',
        {
            preHandler: roleMiddleware('admin'),
            schema: {
                tags: ['Users'],
                security: [{ BearerAuth: [] }],
                response: {
                    200: {
                        description: 'List of all users',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                username: { type: 'string', format: 'email' },
                                role: { type: 'string' },
                                status: { type: 'string' },
                                createdAt: {
                                    type: 'string',
                                    format: 'date-time',
                                },
                                updatedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const users = await userService.listUsers()
            const sanitizedUsers = plainToInstance(UserResponseDto, users, {
                excludeExtraneousValues: true,
            })
            reply.send(sanitizedUsers)
        },
    )

    // Create a new user (Admin only)
    fastify.post(
        '/',
        {
            preHandler: roleMiddleware('admin'),
            schema: {
                tags: ['Users'],
                security: [{ BearerAuth: [] }],
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
                        description: 'User created successfully',
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            username: { type: 'string', format: 'email' },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const body = plainToInstance(CreateUserDto, request.body)
            const errors = await validate(body)

            if (errors.length > 0) {
                const errorMessages = errors
                    .map((err) =>
                        Object.values(err.constraints || {}).join(', '),
                    )
                    .join('; ')
                return reply
                    .status(400)
                    .send({ message: `Validation failed: ${errorMessages}` })
            }

            const newUser = await userService.createUser(body)
            reply.status(201).send(newUser)
        },
    )

    // Get a user by ID (Admin only)
    fastify.get(
        '/:id',
        {
            preHandler: roleMiddleware('admin'),
            schema: {
                tags: ['Users'],
                security: [{ BearerAuth: [] }],
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        description: 'User found',
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            username: { type: 'string', format: 'email' },
                            role: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                            updatedAt: {
                                type: 'string',
                                format: 'date-time',
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const user = await userService.findById(id)
            if (!user) {
                return reply.status(404).send({ message: 'User not found' })
            }

            const sanitizedUser = plainToInstance(UserResponseDto, user, {
                excludeExtraneousValues: true,
            })
            reply.send(sanitizedUser)
        },
    )

    // Update a user by ID (Admin only)
    fastify.patch(
        '/:id',
        {
            preHandler: roleMiddleware('admin'),
            schema: {
                tags: ['Users'],
                security: [{ BearerAuth: [] }],
                body: {
                    type: 'object',
                    properties: {
                        username: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        status: {
                            type: 'string',
                            enum: ['active', 'inactive', 'suspended'],
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const body = plainToInstance(UpdateUserDto, request.body)
            const errors = await validate(body)

            if (errors.length > 0) {
                const errorMessages = errors
                    .map((err) =>
                        Object.values(err.constraints || {}).join(', '),
                    )
                    .join('; ')
                return reply
                    .status(400)
                    .send({ message: `Validation failed: ${errorMessages}` })
            }

            const updatedUser = await userService.updateUser(id, body)
            if (!updatedUser) {
                return reply.status(404).send({ message: 'User not found' })
            }

            reply.send(updatedUser)
        },
    )

    // Delete a user by ID (Admin only)
    fastify.delete(
        '/:id',
        {
            preHandler: roleMiddleware('admin'),
            schema: {
                tags: ['Users'],
                security: [{ BearerAuth: [] }],
                response: {
                    204: {
                        description: 'User successfully deleted',
                        type: 'null',
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string }
            const deleted = await userService.deleteUser(id)
            if (!deleted) {
                return reply.status(404).send({ message: 'User not found' })
            }

            reply.status(204).send()
        },
    )
}
