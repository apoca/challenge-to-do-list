import { IsEnum, IsOptional, IsString } from 'class-validator'
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm'

import { User } from '../users/user.entity'

export enum ToDoStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in progress',
    COMPLETED = 'completed',
}

@Entity('todos')
export class ToDoItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    @IsString()
    title!: string

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string

    @Column({ type: 'enum', enum: ToDoStatus, default: ToDoStatus.PENDING })
    @IsEnum(ToDoStatus)
    status!: ToDoStatus

    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    dueDate?: Date

    @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE' })
    user!: User

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}
