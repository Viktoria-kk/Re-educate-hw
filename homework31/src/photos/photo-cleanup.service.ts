import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AwsStorageService } from './aws-storage.service';
import { PhotoCleanup } from './photo-cleanup.entity';

@Injectable()
export class PhotoCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PhotoCleanupService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running?: Promise<void>;

  constructor(
    @InjectRepository(PhotoCleanup)
    private readonly repository: Repository<PhotoCleanup>,
    private readonly storage: AwsStorageService,
  ) {}

  async enqueue(manager: EntityManager, keys: string[]) {
    if (keys.length) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(PhotoCleanup)
        .values(
          [...new Set(keys)].map((key) => ({ key, objectDeleted: false })),
        )
        .orIgnore()
        .execute();
    }
  }

  async rollbackUploads(keys: string[]) {
    try {
      await this.enqueue(this.repository.manager, keys);
      await this.flush();
    } catch {
      this.logger.error(
        'Could not queue failed-upload cleanup; database recovery is required',
      );
    }
  }

  flush(): Promise<void> {
    if (!this.running) {
      this.running = this.process().finally(() => {
        this.running = undefined;
      });
    }
    return this.running;
  }

  private async process() {
    try {
      const jobs = await this.repository.find({ take: 100 });
      for (const job of jobs) {
        try {
          if (!job.objectDeleted) {
            await this.storage.deleteObject(job.key);
            await this.repository.update(job.key, { objectDeleted: true });
          }
          await this.storage.invalidate(job.key);
          await this.repository.delete(job.key);
        } catch {
          this.logger.warn(
            `Photo cleanup pending for ${job.key}; retrying automatically`,
          );
        }
      }
    } catch {
      this.logger.warn(
        'Photo cleanup database unavailable; retrying automatically',
      );
    }
  }

  onModuleInit() {
    this.timer = setInterval(() => {
      void this.flush();
    }, 30_000);
    this.timer.unref();
    void this.flush();
  }

  async onModuleDestroy() {
    clearInterval(this.timer);
    await this.running;
  }
}
