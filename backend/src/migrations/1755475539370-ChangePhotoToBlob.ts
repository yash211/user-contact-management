import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePhotoToBlob1755475539370 implements MigrationInterface {
    name = 'ChangePhotoToBlob1755475539370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change photo column from VARCHAR to BYTEA to store binary image data
        await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "photo" TYPE BYTEA USING NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert photo column back to VARCHAR
        await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "photo" TYPE VARCHAR(500)`);
    }
}
