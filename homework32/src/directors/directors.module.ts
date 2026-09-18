import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { DirectorsController } from './directors.controller';
import { DirectorsService } from './directors.service';
import { AwsS3Module } from '../aws-s3/aws-s3.module';
import { Director } from './entities/director.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Director, Movie]), AwsS3Module],
  controllers: [DirectorsController],
  providers: [DirectorsService],
  exports: [TypeOrmModule],
})
export class DirectorsModule {}
