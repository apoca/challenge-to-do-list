import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { CreateToDoDto } from './dto/create-todo.dto'
import { UpdateToDoDto } from './dto/update-todo.dto'
import { ToDoService } from './todo.service'
import { verifyJWT } from '../middlewares/jwt.middleware'
import { UserResponseDto } from '../users/dto/user-response.dto'
import { User } from '../users/user.entity'

const todoService = new ToDoService()

export default async function todoRoutes(
    fastify: FastifyInstance,
): Promise<void> {
    fastify.addHook('onRequest', verifyJWT)

    // List all To-Do items
    fastify.get(
        '/',
        {
            schema: {
                tags: ['To-Dos'],
                querystring: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['pending', 'in progress', 'completed'],
                        },
                        dueDateFrom: { type: 'string', format: 'date-time' },
                        dueDateTo: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.user) {
                return reply.status(401).send({
                    message: 'Unauthorized: No user information found.',
                })
            }
            const { id: userId, role } = request.user
            const { status, dueDateFrom, dueDateTo } = request.query as {
                status?: string
                dueDateFrom?: string
                dueDateTo?: string
            }

            const todos = await todoService.findAll(userId, role, {
                status,
                dueDateFrom: dueDateFrom ? new Date(dueDateFrom) : undefined,
                dueDateTo: dueDateTo ? new Date(dueDateTo) : undefined,
            })

            reply.send(todos)
        },
    )

    // Create a new To-Do item
    fastify.post(
        '/',
        {
            schema: {
                tags: ['To-Dos'],
                body: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in progress', 'completed'],
                        },
                        dueDate: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.user) {
                return reply.status(401).send({
                    message: 'Unauthorized: No user information found.',
                })
            }
            const { id: userId } = request.user
            const body = plainToInstance(CreateToDoDto, request.body)
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

            const newToDo = await todoService.create(body, userId)
            reply.status(201).send(newToDo)
        },
    )

    // Get a To-Do item by ID
    fastify.get(
        '/:id',
        {
            schema: { tags: ['To-Dos'] },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.user) {
                return reply.status(401).send({
                    message: 'Unauthorized: No user information found.',
                })
            }
            const { id: userId, role } = request.user
            const { id } = request.params as { id: string }

            try {
                const todo = await todoService.findById(id, userId, role)
                if (todo) {
                    const sanitizedUser = plainToInstance(
                        UserResponseDto,
                        todo.user,
                        {
                            excludeExtraneousValues: true,
                        },
                    )

                    todo.user = sanitizedUser as unknown as User
                    reply.send(todo)
                } else {
                    reply.status(404).send({ message: 'To-Do not found' })
                }
            } catch (error) {
                reply.status(403).send({ message: (error as Error).message })
            }
        },
    )

    // Update a To-Do item by ID
    fastify.patch(
        '/:id',
        {
            schema: {
                tags: ['To-Dos'],
                body: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in progress', 'completed'],
                        },
                        dueDate: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.user) {
                return reply.status(401).send({
                    message: 'Unauthorized: No user information found.',
                })
            }
            const { id: userId, role } = request.user
            const { id } = request.params as { id: string }
            const body = plainToInstance(UpdateToDoDto, request.body)
            const errors = await validate(body)

            if (errors.length > 0) {
                const errorMessages = errors
                    .map((err) =>
                        Object.values(err.constraints || {}).join(', '),
                    )
                    .join('; ')
                return reply.status(400).send({
                    message: `Validation failed: ${errorMessages}`,
                })
            }

            try {
                const updatedToDo = await todoService.update(
                    id,
                    body,
                    userId,
                    role,
                )

                if (updatedToDo) {
                    const sanitizedUser = plainToInstance(
                        UserResponseDto,
                        updatedToDo.user,
                        {
                            excludeExtraneousValues: true,
                        },
                    )
                    updatedToDo.user = sanitizedUser as unknown as User
                    reply.send(updatedToDo)
                } else {
                    reply.status(404).send({ message: 'To-Do not found' })
                }
            } catch (error) {
                reply.status(403).send({ message: (error as Error).message })
            }
        },
    )

    // Delete a To-Do item by ID
    fastify.delete(
        '/:id',
        {
            schema: {
                tags: ['To-Dos'],
                response: {
                    204: {
                        description: 'To-Do successfully deleted',
                        type: 'null',
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            if (!request.user) {
                return reply.status(401).send({
                    message: 'Unauthorized: No user information found.',
                })
            }
            const { id: userId, role } = request.user
            const { id } = request.params as { id: string }

            try {
                await todoService.delete(id, userId, role)
                reply.status(204).send()
            } catch (error) {
                reply.status(403).send({ message: (error as Error).message })
            }
        },
    )
}
