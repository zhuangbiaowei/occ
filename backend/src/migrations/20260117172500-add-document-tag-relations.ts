import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentTagRelations20260117172500 implements MigrationInterface {
  name = 'AddDocumentTagRelations20260117172500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "document_tag_relations" (
        "document_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        PRIMARY KEY ("document_id", "tag_id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_document_tag_relations_document" ON "document_tag_relations" ("document_id")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_document_tag_relations_tag" ON "document_tag_relations" ("tag_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_document_tag_relations_tag"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_document_tag_relations_document"');
    await queryRunner.query('DROP TABLE IF EXISTS "document_tag_relations"');
  }
}
