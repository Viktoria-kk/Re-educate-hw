import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Director } from '../directors/entities/director.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Director]), PhotosModule],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
