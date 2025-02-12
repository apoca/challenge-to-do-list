import {
    initializeTestDataSource,
    clearDatabase,
    testDataSource,
} from './config/ormconfig'
import { AuthService } from '../src/auth/auth.service'
import { User, UserStatus } from '../src/users/user.entity'
import { UserService } from '../src/users/user.service'

describe('AuthService (Integration Test)', () => {
    let authService: AuthService
    let userService: UserService

    beforeAll(async () => {
        await initializeTestDataSource()
        userService = new UserService()
        ;(userService as any).userRepository =
            testDataSource.getRepository(User)
        authService = new AuthService(userService)
    })

    afterEach(async () => {
        await clearDatabase()
    })

    afterAll(async () => {
        await testDataSource.destroy()
    })

    it('should register a new user', async () => {
        const user = await authService.register(
            'test@example.com',
            'password123',
        )
        expect(user).toHaveProperty('id')
        expect(user.username).toBe('test@example.com')
    })

    it('should login with correct credentials', async () => {
        await authService.register('loginuser@example.com', 'password123')
        const token = await authService.login(
            'loginuser@example.com',
            'password123',
        )
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
    })

    it('should not login with incorrect password', async () => {
        await authService.register('loginuser@example.com', 'password123')
        const token = await authService.login(
            'loginuser@example.com',
            'wrongpassword',
        )
        expect(token).toBeNull()
    })

    it('should return 401 if user is inactive', async () => {
        const user = await authService.register(
            'inactiveuser@example.com',
            'password123',
        )

        await userService.updateUser(user.id, { status: UserStatus.INACTIVE })
        try {
            const token = await authService.login(
                'inactiveuser@example.com',
                'password123',
            )
            expect(token).toBeNull()
        } catch (error) {
            const err = error as { status: number; message: string }
            expect(err.status).toBe(401)
            expect(err.message).toBe('Invalid credentials or inactive user')
        }
    })
})
