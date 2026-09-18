import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateMovieDto } from './dto/create-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll(@Query() query: QueryMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.moviesService.uploadImages(id, images);
  }

  @Delete(':id/images')
  removeImage(@Param('id') id: string, @Body('key') key: string) {
    return this.moviesService.removeImage(id, key);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}
