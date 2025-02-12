import { IsEmail, IsStrongPassword, MinLength } from 'class-validator'

export class LoginDto {
    @IsEmail({}, { message: 'Username must be a valid email address.' })
    username!: string

    @IsStrongPassword({}, { message: 'Password is too weak.' })
    @MinLength(12, { message: 'Password must be at least 12 characters long.' })
    password!: string
}
