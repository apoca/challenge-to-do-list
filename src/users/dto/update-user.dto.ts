import {
    IsString,
    IsOptional,
    IsEnum,
    Matches,
    MinLength,
} from 'class-validator'

import { UserRole, UserStatus } from '../user.entity'

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string

    @IsOptional()
    @IsEnum(UserRole, { message: 'Role must be either user or admin' })
    role?: UserRole

    @IsOptional()
    @IsEnum(UserStatus, {
        message: 'Status must be active, inactive, or suspended',
    })
    status?: UserStatus

    @IsOptional()
    @MinLength(12, { message: 'Password must be at least 12 characters long.' })
    @Matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password?: string
}
