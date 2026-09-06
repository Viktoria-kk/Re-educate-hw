import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from './entities/director.entity';

import { DirectorsController } from './directors.controller';
import { DirectorsService } from './directors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Director])],
  controllers: [DirectorsController],
  providers: [DirectorsService],
})
export class DirectorsModule {}
