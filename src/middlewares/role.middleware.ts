import { FastifyReply, FastifyRequest } from 'fastify'

export const roleMiddleware = (requiredRole: 'admin' | 'user') => {
    return async (
        request: FastifyRequest,
        reply: FastifyReply,
    ): Promise<void> => {
        const user = request.user

        if (!user) {
            reply.status(401).send({ message: 'Unauthorized: No user found' })
            return
        }

        if (user.role !== requiredRole) {
            reply.status(403).send({
                message:
                    'Forbidden: You do not have permission to access this resource.',
            })
            return
        }
    }
}
