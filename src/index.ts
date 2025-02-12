import 'reflect-metadata'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import dotenv from 'dotenv'
import { FastifyInstance, fastify } from 'fastify'

import authRoutes from './auth/auth.routes'
import { connect } from './config/database'
import { verifyJWT } from './middlewares/jwt.middleware'
import todoRoutes from './todos/todo.routes'
import userRoutes from './users/user.routes'

dotenv.config()

const server: FastifyInstance = fastify({ logger: true })

const start = async () => {
    try {
        // Connect to the database
        await connect()

        // Configure Swagger with OpenAPI 3.0.3
        server.register(fastifySwagger, {
            mode: 'dynamic',
            openapi: {
                openapi: '3.0.3',
                info: {
                    title: 'Challenge To-Do List API',
                    version: '1.0.0',
                },
                components: {
                    securitySchemes: {
                        BearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                    },
                },
                security: [{ BearerAuth: [] }],
            },
        })

        // Configure Swagger-UI
        server.register(fastifySwaggerUi, {
            routePrefix: '/docs',
            staticCSP: true,
            transformStaticCSP: (header) => header,
            uiConfig: {
                deepLinking: true,
            },
        })

        // Register public routes (auth)
        server.register(authRoutes, { prefix: '/auth' })

        // Register protected routes (users and todos)
        server.register(async (instance) => {
            instance.addHook('onRequest', verifyJWT)
            instance.register(userRoutes, { prefix: '/users' })
            instance.register(todoRoutes, { prefix: '/todos' })
        })

        // Start the server
        await server.listen({
            port: parseInt(process.env.PORT || '3000'),
            host: '0.0.0.0',
        })

        server.log.info(
            `🚀 Server running on http://localhost:${process.env.PORT}`,
        )
        server.log.info(
            `📚 Swagger Docs available at http://localhost:${process.env.PORT}/docs`,
        )
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()
