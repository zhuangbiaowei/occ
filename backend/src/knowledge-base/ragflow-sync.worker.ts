import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { RagflowSyncJob } from './entities/ragflow-sync-job.entity';
import { RagflowSyncService } from './ragflow-sync.service';

@Injectable()
export class RagflowSyncWorker implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly config: ConfigService,
    private readonly ragflowSyncService: RagflowSyncService,
    @InjectRepository(RagflowSyncJob)
    private readonly syncJobRepository: Repository<RagflowSyncJob>,
  ) {}

  onModuleInit() {
    const intervalSeconds = this.config.get<number>('RAGFLOW_SYNC_INTERVAL_SEC', 30);
    this.timer = setInterval(() => {
      void this.tick();
    }, intervalSeconds * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async tick() {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      const now = new Date();
      const batchSize = this.config.get<number>('RAGFLOW_SYNC_BATCH_SIZE', 10);
      const jobs = await this.syncJobRepository.find({
        where: [
          { status: 'pending', nextRetryAt: IsNull() },
          { status: 'pending', nextRetryAt: LessThanOrEqual(now) },
        ],
        order: { createdAt: 'ASC' },
        take: batchSize,
      });

      for (const job of jobs) {
        await this.ragflowSyncService.processJob(job);
      }
    } finally {
      this.running = false;
    }
  }
}
