import * as bcrypt from 'bcrypt'
import { Exclude } from 'class-transformer'
import { IsEmail, IsStrongPassword } from 'class-validator'
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
} from 'typeorm'

import { ToDoItem } from '../todos/todo.entity'

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ unique: true })
    @IsEmail({}, { message: 'Username must be a valid email address.' })
    username!: string

    @Exclude()
    @Column()
    @IsStrongPassword({}, { message: 'Password is too weak.' })
    password!: string

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status!: UserStatus

    @OneToMany(() => ToDoItem, (todo) => todo.user)
    todos?: ToDoItem[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10)
        }
    }

    async comparePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password)
    }
}
