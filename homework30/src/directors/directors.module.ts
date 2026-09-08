import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from './entities/director.entity';

import { DirectorsController } from './directors.controller';
import { DirectorsService } from './directors.service';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Director]), PhotosModule],
  controllers: [DirectorsController],
  providers: [DirectorsService],
})
export class DirectorsModule {}
