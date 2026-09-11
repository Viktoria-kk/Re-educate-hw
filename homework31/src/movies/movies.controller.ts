import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiPayloadTooLargeResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import {
  MovieResponseDto,
  MovieDetailsDto,
  MoviePageDto,
} from '../common/dto/api-response.dto';
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

@ApiTags('Movies')
@ApiBadRequestResponse({
  description: 'Invalid body, query, UUID, year range or image upload.',
})
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly photosService: PhotosService,
  ) {}

  @Post(':id/photo')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie UUID',
  })
  @ApiNotFoundResponse({ description: 'Movie or photo not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      required: ['photo'],
      properties: { photo: { type: 'string', format: 'binary' } },
    },
  })
  @ApiPayloadTooLargeResponse({ description: 'Image exceeds 5 MiB.' })
  @ApiServiceUnavailableResponse({
    description: 'Image storage upload failed.',
  })
  @ApiOperation({
    summary: 'Upload one movie photo',
    description:
      'JPEG, PNG or WebP only; maximum 5 MiB per image. A movie may have at most 10 photos in total.',
  })
  @ApiCreatedResponse({ type: MovieResponseDto })
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions(1)))
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.photosService.addMoviePhotos(id, file ? [file] : []);
  }

  @Post(':id/photos')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie UUID',
  })
  @ApiNotFoundResponse({ description: 'Movie or photo not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      required: ['photos'],
      properties: {
        photos: {
          type: 'array',
          minItems: 1,
          maxItems: 10,
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiPayloadTooLargeResponse({ description: 'Image exceeds 5 MiB.' })
  @ApiServiceUnavailableResponse({
    description: 'Image storage upload failed.',
  })
  @ApiOperation({
    summary: 'Upload multiple movie photos',
    description:
      'JPEG, PNG or WebP only; maximum 5 MiB per image. A movie may have at most 10 photos in total.',
  })
  @ApiCreatedResponse({ type: MovieResponseDto })
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
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie UUID',
  })
  @ApiNotFoundResponse({ description: 'Movie or photo not found.' })
  @ApiParam({
    name: 'photoId',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of a photo belonging to this movie.',
  })
  @ApiOperation({
    summary: 'Delete a movie photo',
    description:
      'Returns the updated record. Storage cleanup is retried if necessary.',
  })
  @ApiOkResponse({ type: MovieResponseDto })
  deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.deleteMoviePhoto(id, photoId);
  }

  @Post()
  @ApiBody({ type: CreateMovieDto })
  @ApiOperation({ summary: 'Create a movie' })
  @ApiCreatedResponse({ type: MovieDetailsDto })
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List movies with pagination and filters',
    description:
      'Filters are combined with AND. Results are sorted by name, then UUID.',
  })
  @ApiOkResponse({ type: MoviePageDto })
  findAll(@Query() query: QueryMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie UUID',
  })
  @ApiNotFoundResponse({ description: 'Movie not found.' })
  @ApiOperation({ summary: 'Get a movie by UUID' })
  @ApiOkResponse({ type: MovieDetailsDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie UUID',
  })
  @ApiNotFoundResponse({ description: 'Movie not found.' })
  @ApiBody({ type: UpdateMovieDto })
  @ApiOperation({
    summary: 'Update a movie',
    description: 'Only supplied fields are updated. Null values are rejected.',
  })
  @ApiOkResponse({ type: MovieDetailsDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie UUID',
  })
  @ApiNotFoundResponse({ description: 'Movie not found.' })
  @ApiOperation({
    summary: 'Delete a movie',
    description:
      'Deletes the movie, schedules photo cleanup and returns the deleted movie.',
  })
  @ApiOkResponse({ type: MovieDetailsDto })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.remove(id);
  }
}
