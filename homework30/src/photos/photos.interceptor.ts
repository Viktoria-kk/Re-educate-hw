import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { AwsStorageService } from './aws-storage.service';

@Injectable()
export class PhotosInterceptor implements NestInterceptor {
  constructor(private readonly storage: AwsStorageService) {}

  private serialize(value: unknown): unknown {
    if (Array.isArray(value))
      return value.map((item: unknown) => this.serialize(item));
    if (value === null || typeof value !== 'object') return value;
    const record = value as Record<string, unknown>;
    const result = Object.fromEntries(
      Object.entries(record).map(([key, item]) => [key, this.serialize(item)]),
    );
    if (
      typeof record.key === 'string' &&
      typeof record.contentType === 'string' &&
      typeof record.id === 'string'
    ) {
      result.url = this.storage.url(record.key);
    }
    return result;
  }

  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((value: unknown) => this.serialize(value)));
  }
}
