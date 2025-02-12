import { Repository } from 'typeorm'

import { CreateToDoDto } from './dto/create-todo.dto'
import { UpdateToDoDto } from './dto/update-todo.dto'
import { ToDoItem } from './todo.entity'
import { AppDataSource } from '../config/database'

export class ToDoService {
    private todoRepository: Repository<ToDoItem>

    constructor() {
        this.todoRepository = AppDataSource.getRepository(ToDoItem)
    }

    // Create a new To-Do item associated with the user
    async create(
        createToDoDto: CreateToDoDto,
        userId: string,
    ): Promise<ToDoItem> {
        const todo = this.todoRepository.create({
            ...createToDoDto,
            user: { id: userId },
        })
        return this.todoRepository.save(todo)
    }

    // Find all To-Do items with optional filters (Admins see all, users see their own)
    async findAll(
        userId: string,
        role: 'admin' | 'user',
        filters: { status?: string; dueDateFrom?: Date; dueDateTo?: Date },
    ): Promise<ToDoItem[]> {
        const query = this.todoRepository.createQueryBuilder('todo')

        if (role === 'user') {
            query.andWhere('todo.user.id = :userId', { userId })
        }

        if (filters.status) {
            query.andWhere('todo.status = :status', { status: filters.status })
        }

        if (filters.dueDateFrom) {
            query.andWhere('todo.dueDate >= :dueDateFrom', {
                dueDateFrom: filters.dueDateFrom,
            })
        }

        if (filters.dueDateTo) {
            query.andWhere('todo.dueDate <= :dueDateTo', {
                dueDateTo: filters.dueDateTo,
            })
        }

        return query.getMany()
    }

    // Find a To-Do item by ID (check permissions: admin or owner)
    async findById(
        id: string,
        userId: string,
        role: 'admin' | 'user',
    ): Promise<ToDoItem | null> {
        const todo = await this.todoRepository.findOne({
            where: { id },
            relations: ['user'],
        })

        if (!todo) return null

        // Check permissions: only admin or task owner can access
        if (role !== 'admin' && todo.user.id !== userId) {
            throw new Error(
                'Forbidden: You do not have permission to access this task.',
            )
        }

        return todo
    }

    // Update a To-Do item if the user has permission (admin or task owner)
    async update(
        id: string,
        updateToDoDto: UpdateToDoDto,
        userId: string,
        role: 'admin' | 'user',
    ): Promise<ToDoItem | null> {
        const todo = await this.findById(id, userId, role)
        if (!todo) return null

        Object.assign(todo, updateToDoDto)
        return this.todoRepository.save(todo)
    }

    // Delete a To-Do item if the user has permission (admin or task owner)
    async delete(
        id: string,
        userId: string,
        role: 'admin' | 'user',
    ): Promise<boolean> {
        const todo = await this.findById(id, userId, role)
        if (!todo) return false

        const result = await this.todoRepository.delete(id)
        return result.affected === 1
    }
}
