import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRagflowDocumentId20260117213000 implements MigrationInterface {
  name = 'AddRagflowDocumentId20260117213000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" ADD "ragflow_document_id" character varying(64)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "knowledge_documents" DROP COLUMN "ragflow_document_id"',
    );
  }
}
