import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixKnowledgeDocumentsId20260117173000 implements MigrationInterface {
  name = 'FixKnowledgeDocumentsId20260117173000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD COLUMN IF NOT EXISTS "id" uuid',
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          WHERE c.contype = 'p'
            AND t.relname = 'knowledge_documents'
        ) THEN
          ALTER TABLE "knowledge_documents"
          ADD CONSTRAINT "pk_knowledge_documents_id" PRIMARY KEY ("id");
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP CONSTRAINT IF EXISTS "pk_knowledge_documents_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN IF EXISTS "id"',
    );
  }
}
