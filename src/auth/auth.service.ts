import * as jwt from 'jsonwebtoken'

import { UserStatus } from '../users/user.entity'
import { UserService } from '../users/user.service'

export class AuthService {
    constructor(private userService: UserService) {}

    /**
     * Register a new user.
     * @param username - The username of the user.
     * @param password - The plain password of the user.
     * @returns The registered user with id and username.
     */
    async register(
        username: string,
        password: string,
    ): Promise<{ id: string; username: string }> {
        const existingUser = await this.userService.findByUsername(username)
        if (existingUser) {
            throw new Error('Username already exists')
        }

        const user = await this.userService.createUser({ username, password })
        return { id: user.id, username: user.username }
    }

    /**
     * Log in a user and generate a JWT token.
     * @param username - The username of the user.
     * @param password - The plain password of the user.
     * @returns A JWT token if the login is successful, or null if not.
     */
    async login(username: string, password: string): Promise<string | null> {
        const user = await this.userService.findByUsername(username)
        if (!user || user.status !== UserStatus.ACTIVE) {
            return null
        }

        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            return null
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'defaultSecret',
            { expiresIn: '1h' },
        )

        return token
    }
}
