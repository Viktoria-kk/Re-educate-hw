import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PhotosService } from '../photos/photos.service';
import { imageUploadOptions, MAX_MOVIE_PHOTOS } from '../photos/image-upload';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly photosService: PhotosService,
  ) {}

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions(1)))
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.photosService.addMoviePhotos(id, file ? [file] : []);
  }

  @Post(':id/photos')
  @UseInterceptors(
    FilesInterceptor(
      'photos',
      MAX_MOVIE_PHOTOS,
      imageUploadOptions(MAX_MOVIE_PHOTOS),
    ),
  )
  uploadPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
  ) {
    return this.photosService.addMoviePhotos(id, files);
  }

  @Delete(':id/photos/:photoId')
  deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.deleteMoviePhoto(id, photoId);
  }

  @Post()
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.remove(id);
  }
}
