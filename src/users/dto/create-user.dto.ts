import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
    @IsEmail({}, { message: 'Username must be a valid email address' })
    username!: string

    @IsString()
    @MinLength(12, {
        message: 'Password must be at least 12 characters long',
    })
    password!: string
}
