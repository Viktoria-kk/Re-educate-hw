import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsStorageService } from './aws-storage.service';
import { PhotoCleanup } from './photo-cleanup.entity';
import { PhotoCleanupService } from './photo-cleanup.service';
import { PhotosService } from './photos.service';
import { PhotosInterceptor } from './photos.interceptor';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([PhotoCleanup])],
  providers: [
    AwsStorageService,
    PhotoCleanupService,
    PhotosService,
    { provide: APP_INTERCEPTOR, useClass: PhotosInterceptor },
  ],
  exports: [PhotosService],
})
export class PhotosModule {}
