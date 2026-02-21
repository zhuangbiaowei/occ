import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRagflowSyncJobIdDefault20260118131000 implements MigrationInterface {
  name = 'FixRagflowSyncJobIdDefault20260118131000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'ragflow_sync_jobs'
            AND column_name = 'id'
            AND column_default IS NULL
        ) THEN
          ALTER TABLE "ragflow_sync_jobs"
          ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "ragflow_sync_jobs" ALTER COLUMN "id" DROP DEFAULT',
    );
  }
}
