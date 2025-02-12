import {
    initializeTestDataSource,
    clearDatabase,
    testDataSource,
} from './config/ormconfig'
import { User, UserStatus } from '../src/users/user.entity'
import { UserService } from '../src/users/user.service'

describe('UserService (Integration Test)', () => {
    let userService: UserService

    beforeAll(async () => {
        await initializeTestDataSource()
        userService = new UserService()
        ;(userService as any).userRepository =
            testDataSource.getRepository(User)
    })

    afterEach(async () => {
        await clearDatabase()
    })

    afterAll(async () => {
        await testDataSource.destroy()
    })

    it('should create a new user', async () => {
        const user = await userService.createUser({
            username: 'newuser@example.com',
            password: 'password123',
        })
        expect(user).toHaveProperty('id')
        expect(user.username).toBe('newuser@example.com')
    })

    it('should find a user by ID', async () => {
        const createdUser = await userService.createUser({
            username: 'findme@example.com',
            password: 'password123',
        })
        const user = await userService.findById(createdUser.id)
        expect(user).not.toBeNull()
        expect(user?.username).toBe('findme@example.com')
    })

    it('should find a user by username', async () => {
        await userService.createUser({
            username: 'finduser@example.com',
            password: 'password123',
        })
        const user = await userService.findByUsername('finduser@example.com')
        expect(user).not.toBeNull()
        expect(user?.username).toBe('finduser@example.com')
    })

    it('should update a user', async () => {
        const createdUser = await userService.createUser({
            username: 'updateuser@example.com',
            password: 'password123',
        })
        const updatedUser = await userService.updateUser(createdUser.id, {
            status: UserStatus.SUSPENDED,
        })
        expect(updatedUser).not.toBeNull()
        expect(updatedUser?.status).toBe(UserStatus.SUSPENDED)
    })

    it('should list all users', async () => {
        await userService.createUser({
            username: 'user1@example.com',
            password: 'password123',
        })
        await userService.createUser({
            username: 'user2@example.com',
            password: 'password123',
        })

        const users = await userService.listUsers()
        expect(users.length).toBe(2)
    })

    it('should delete a user', async () => {
        const createdUser = await userService.createUser({
            username: 'deleteuser@example.com',
            password: 'password123',
        })
        const deleted = await userService.deleteUser(createdUser.id)
        expect(deleted).toBe(true)

        const user = await userService.findById(createdUser.id)
        expect(user).toBeNull()
    })
})
