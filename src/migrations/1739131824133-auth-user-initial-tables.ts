import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1739130224348 implements MigrationInterface {
    name = 'InitialMigration1739130224348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM type for user roles if it doesn't already exist
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`,
        )

        // Create ENUM type for user status if it doesn't already exist
        await queryRunner.query(
            `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
        )

        // Create the "users" table
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the "users" table if it exists
        await queryRunner.query(`DROP TABLE "users"`)

        // Drop ENUM type for user status
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`)

        // Drop ENUM type for user roles
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`)
    }
}
