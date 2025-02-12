import { Repository } from 'typeorm'

import { User } from './user.entity'
import { AppDataSource } from '../config/database'

export class UserService {
    private userRepository: Repository<User>

    constructor() {
        this.userRepository = AppDataSource.getRepository(User)
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOneBy({ id })
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOneBy({ username })
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData)
        return this.userRepository.save(user)
    }

    async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
        const user = await this.findById(id)
        if (!user) return null

        // Avoid updating the password directly
        if (updates.password) {
            throw new Error(
                'Password updates are not allowed via this endpoint.',
            )
        }

        Object.assign(user, updates)
        return this.userRepository.save(user)
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await this.userRepository.delete(id)
        return result.affected === 1
    }

    async listUsers(): Promise<User[]> {
        return this.userRepository.find()
    }
}
