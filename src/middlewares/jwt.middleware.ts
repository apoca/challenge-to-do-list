import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export async function verifyJWT(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.status(401).send({
            message: 'Unauthorized: Bearer token missing or invalid format',
        })
        return
    }

    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'defaultSecret',
        ) as {
            id: string
            username: string
            role: 'admin' | 'user'
        }

        if (!request.user) {
            request.user = decoded // Inject the decoded token into request.user
        }
    } catch (err) {
        console.error('JWT verification failed:', err)
        reply
            .status(401)
            .send({ message: 'Unauthorized: Invalid or expired token' })
    }
}
