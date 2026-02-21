import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRagflowSync20260117104500 implements MigrationInterface {
  name = 'AddRagflowSync20260117104500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "knowledge_bases" ADD COLUMN IF NOT EXISTS "ragflow_dataset_id" varchar(64)',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ragflow_sync_jobs" (
        "id" uuid PRIMARY KEY,
        "document_id" varchar(36) NOT NULL,
        "knowledge_base_id" varchar(36) NOT NULL,
        "operation" varchar(16) NOT NULL,
        "status" varchar(16) NOT NULL DEFAULT 'pending',
        "retry_count" int NOT NULL DEFAULT 0,
        "last_error" text NULL,
        "next_retry_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "ragflow_sync_jobs"');
    await queryRunner.query(
      'ALTER TABLE "knowledge_bases" DROP COLUMN IF EXISTS "ragflow_dataset_id"',
    );
  }
}
