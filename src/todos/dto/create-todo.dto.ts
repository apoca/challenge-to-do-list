import { IsEnum, IsOptional, IsString } from 'class-validator'

import { ToDoStatus } from '../todo.entity'

export class CreateToDoDto {
    @IsString()
    title!: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsEnum(ToDoStatus)
    status?: ToDoStatus

    @IsOptional()
    dueDate?: Date
}
