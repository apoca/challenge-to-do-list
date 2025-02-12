import 'reflect-metadata'
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'

import { ToDoItem } from '../todos/todo.entity'
import { User } from '../users/user.entity'

dotenv.config()

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize:
        process.env.NODE_ENV === 'development' &&
        process.env.DB_SYNCRONIZE === 'true',
    logging: true,
    entities: [User, ToDoItem],
    migrations: ['src/migrations/*.ts'],
})

export const connect = async () => {
    try {
        await AppDataSource.initialize()
        console.log('Database connected')
    } catch (err) {
        console.error('Database connection error:', err)
        process.exit(1)
    }
}
