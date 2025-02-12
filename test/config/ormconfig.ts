import { Client } from 'pg'
import { DataSource } from 'typeorm'

import { ToDoItem } from '../../src/todos/todo.entity'
import { User } from '../../src/users/user.entity'

const databaseName = 'todo_test_db'

async function dropDatabaseIfExists() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        user: process.env.DB_USER || 'test',
        password: process.env.DB_PASS || 'test',
        database: 'postgres',
    })

    try {
        await client.connect()
        await client.query(`DROP DATABASE IF EXISTS ${databaseName}`)
    } catch (error) {
        console.error('Error dropping database:', error)
    } finally {
        await client.end()
    }
}

async function createDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        user: process.env.DB_USER || 'test',
        password: process.env.DB_PASS || 'test',
        database: 'postgres',
    })

    try {
        await client.connect()
        await client.query(`CREATE DATABASE ${databaseName}`)
    } catch (error) {
        console.error('Error creating database:', error)
    } finally {
        await client.end()
    }
}

export const testDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER || 'test',
    password: process.env.DB_PASS || 'test',
    database: databaseName,
    synchronize: true,
    logging: false,
    entities: [User, ToDoItem],
})

export async function initializeTestDataSource() {
    await dropDatabaseIfExists()
    await createDatabase()
    await testDataSource.initialize()
}

export async function clearDatabase() {
    await testDataSource.destroy()
    await dropDatabaseIfExists()
    await createDatabase()
    await testDataSource.initialize()
}
