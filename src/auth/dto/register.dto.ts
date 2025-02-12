import { IsString, MinLength, Matches, IsEmail } from 'class-validator'

export class RegisterDto {
    @IsEmail({}, { message: 'Username must be a valid email address.' })
    username!: string

    @IsString()
    @MinLength(12, { message: 'Password must be at least 12 characters long.' })
    @Matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password!: string
}
