import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentTag } from './entities/document-tag.entity';
import { RagflowSyncJob } from './entities/ragflow-sync-job.entity';
import { KnowledgeBaseService } from './knowledge-base.service';
import { TagService } from './tag.service';
import { RagflowSyncService } from './ragflow-sync.service';
import { RagflowSyncWorker } from './ragflow-sync.worker';
import {
  KnowledgeBaseController,
  DocumentController,
  TagController,
} from './knowledge-base.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeBase,
      KnowledgeDocument,
      DocumentVersion,
      DocumentTag,
      RagflowSyncJob,
    ]),
    UsersModule,
  ],
  controllers: [KnowledgeBaseController, DocumentController, TagController],
  providers: [KnowledgeBaseService, TagService, RagflowSyncService, RagflowSyncWorker],
  exports: [KnowledgeBaseService, TagService, RagflowSyncService],
})
export class KnowledgeBaseModule {}
