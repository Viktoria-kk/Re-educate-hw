import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from '../directors/entities/director.entity';
import { Movie } from './entities/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { AwsS3Module } from '../aws-s3/aws-s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Director]), AwsS3Module],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
