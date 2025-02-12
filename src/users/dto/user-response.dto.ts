import { Exclude, Expose } from 'class-transformer'

export class UserResponseDto {
    @Expose()
    id!: string

    @Expose()
    username!: string

    @Expose()
    role!: 'admin' | 'user'

    @Expose()
    status!: 'active' | 'inactive' | 'suspended'

    @Expose()
    createdAt!: Date

    @Expose()
    updatedAt!: Date

    @Exclude()
    password!: string
}
