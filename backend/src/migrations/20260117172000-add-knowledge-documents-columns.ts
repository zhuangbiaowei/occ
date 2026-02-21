import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKnowledgeDocumentsColumns20260117172000 implements MigrationInterface {
  name = 'AddKnowledgeDocumentsColumns20260117172000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "knowledge_base_id" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "created_by" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "updated_by" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "file_name" varchar(100)',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "file_path" varchar(200)',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "mime_type" varchar(100)',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "file_hash" varchar(64)',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "version" int DEFAULT 1',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT \'active\'',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "read_count" int DEFAULT 0',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_knowledge_documents_kb" ON "knowledge_documents" ("knowledge_base_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_knowledge_documents_created_by" ON "knowledge_documents" ("created_by")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_knowledge_documents_updated_by" ON "knowledge_documents" ("updated_by")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_knowledge_documents_updated_by"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_knowledge_documents_created_by"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_knowledge_documents_kb"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "read_count"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "status"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "version"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "file_hash"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "mime_type"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "file_path"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "file_name"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "updated_by"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "created_by"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "knowledge_base_id"',
    );
  }
}
