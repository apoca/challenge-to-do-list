import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChallengeInitialTables1739385298407 implements MigrationInterface {
    name = 'ChallengeInitialTables1739385298407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`,
        )
        await queryRunner.query(
            `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
        )
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        )
        await queryRunner.query(
            `CREATE TYPE "public"."todos_status_enum" AS ENUM('pending', 'in progress', 'completed')`,
        )
        await queryRunner.query(
            `CREATE TABLE "todos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "status" "public"."todos_status_enum" NOT NULL DEFAULT 'pending', "dueDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`,
        )
        await queryRunner.query(
            `ALTER TABLE "todos" ADD CONSTRAINT "FK_4583be7753873b4ead956f040e3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "todos" DROP CONSTRAINT "FK_4583be7753873b4ead956f040e3"`,
        )
        await queryRunner.query(`DROP TABLE "todos"`)
        await queryRunner.query(`DROP TYPE "public"."todos_status_enum"`)
        await queryRunner.query(`DROP TABLE "users"`)
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`)
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`)
    }
}
