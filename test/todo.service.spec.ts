import {
    initializeTestDataSource,
    clearDatabase,
    testDataSource,
} from './config/ormconfig'
import { ToDoItem, ToDoStatus } from '../src/todos/todo.entity'
import { ToDoService } from '../src/todos/todo.service'
import { User, UserRole } from '../src/users/user.entity'

describe('ToDoService (Integration Test)', () => {
    let todoService: ToDoService
    let testUser: User
    let adminUser: User

    beforeAll(async () => {
        try {
            await initializeTestDataSource()

            todoService = new ToDoService()
            ;(todoService as any).todoRepository =
                testDataSource.getRepository(ToDoItem)

            await createTestUsers()
        } catch (error) {
            console.error('Error in beforeAll:', error)
            throw error
        }
    })

    async function createTestUsers() {
        const userRepository = testDataSource.getRepository(User)

        const existingUser = await userRepository.findOneBy({
            username: 'user@example.com',
        })
        if (!existingUser) {
            testUser = userRepository.create({
                username: 'user@example.com',
                password: 'password123',
                role: UserRole.USER,
            })
            await userRepository.save(testUser)
        }

        const existingAdmin = await userRepository.findOneBy({
            username: 'admin@example.com',
        })
        if (!existingAdmin) {
            adminUser = userRepository.create({
                username: 'admin@example.com',
                password: 'password123',
                role: UserRole.ADMIN,
            })
            await userRepository.save(adminUser)
        }
    }

    beforeEach(async () => {
        await createTestUsers()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    afterAll(async () => {
        await testDataSource.destroy()
    })

    it('should create a new To-Do item', async () => {
        const newToDo = await todoService.create(
            {
                title: 'Write integration tests',
                description: 'Cover all To-DoService methods',
                status: ToDoStatus.PENDING,
                dueDate: new Date(),
            },
            testUser.id,
        )
        expect(newToDo).toHaveProperty('id')
        expect(newToDo.title).toBe('Write integration tests')
        expect(newToDo.user.id).toBe(testUser.id)
    })

    it('should list all To-Dos for an admin', async () => {
        await todoService.create(
            {
                title: 'Admin To-Do',
                description: 'Admin Task',
                status: ToDoStatus.PENDING,
            },
            adminUser.id,
        )
        const todos = await todoService.findAll(adminUser.id, 'admin', {})
        expect(todos.length).toBe(1)
        expect(todos[0].title).toBe('Admin To-Do')
    })

    it("should list only the user's To-Dos for a regular user", async () => {
        await todoService.create(
            {
                title: 'User To-Do',
                description: 'User Task',
                status: ToDoStatus.PENDING,
            },
            testUser.id,
        )
        const todos = await todoService.findAll(testUser.id, 'user', {})
        expect(todos.length).toBe(1)
        expect(todos[0].title).toBe('User To-Do')
    })

    it('should filter To-Dos by status', async () => {
        await todoService.create(
            { title: 'Completed Task', status: ToDoStatus.COMPLETED },
            testUser.id,
        )
        const todos = await todoService.findAll(testUser.id, 'user', {
            status: 'completed',
        })
        expect(todos.length).toBe(1)
        expect(todos[0].status).toBe('completed')
    })

    it('should find a To-Do by ID for the owner or admin', async () => {
        const todo = await todoService.create(
            { title: 'Find Me Task', description: 'To be found' },
            testUser.id,
        )
        const foundToDo = await todoService.findById(
            todo.id,
            testUser.id,
            'user',
        )
        expect(foundToDo).not.toBeNull()
        expect(foundToDo?.title).toBe('Find Me Task')
    })

    it('should update a To-Do for the owner or admin', async () => {
        const todo = await todoService.create(
            { title: 'Update Me Task', description: 'Before update' },
            testUser.id,
        )
        const updatedToDo = await todoService.update(
            todo.id,
            { title: 'Updated Task' },
            testUser.id,
            'user',
        )
        expect(updatedToDo?.title).toBe('Updated Task')
    })

    it('should delete a To-Do for the owner or admin', async () => {
        const todo = await todoService.create(
            { title: 'Delete Me Task' },
            testUser.id,
        )
        const deleted = await todoService.delete(todo.id, testUser.id, 'user')
        expect(deleted).toBe(true)
        const foundToDo = await todoService.findById(
            todo.id,
            testUser.id,
            'user',
        )
        expect(foundToDo).toBeNull()
    })

    it("should not allow a user to access another user's To-Do", async () => {
        const todo = await todoService.create(
            { title: 'Forbidden Task' },
            adminUser.id,
        )
        try {
            await todoService.findById(todo.id, testUser.id, 'user')
        } catch (error) {
            expect((error as Error).message).toBe(
                'Forbidden: You do not have permission to access this task.',
            )
        }
    })
})
