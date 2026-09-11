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
  DirectorResponseDto,
  DirectorDetailsDto,
  DirectorPageDto,
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
  UseInterceptors,
} from '@nestjs/common';
import { DirectorsService } from './directors.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { QueryDirectorsDto } from './dto/query-directors.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from '../photos/photos.service';
import { imageUploadOptions } from '../photos/image-upload';

@ApiTags('Directors')
@ApiBadRequestResponse({
  description: 'Invalid body, query, UUID, year range or image upload.',
})
@Controller('directors')
export class DirectorsController {
  constructor(
    private readonly directorsService: DirectorsService,
    private readonly photosService: PhotosService,
  ) {}

  @Post(':id/photo')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Director UUID',
  })
  @ApiNotFoundResponse({ description: 'Director or photo not found.' })
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
    summary: 'Upload or replace the director profile photo',
    description:
      'JPEG, PNG or WebP only; maximum 5 MiB per image. Replaces the existing profile photo.',
  })
  @ApiCreatedResponse({ type: DirectorResponseDto })
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions(1)))
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.photosService.setDirectorPhoto(id, file);
  }

  @Delete(':id/photo')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Director UUID',
  })
  @ApiNotFoundResponse({ description: 'Director or photo not found.' })
  @ApiOperation({
    summary: 'Delete a director photo',
    description:
      'Returns the updated record. Storage cleanup is retried if necessary.',
  })
  @ApiOkResponse({ type: DirectorResponseDto })
  deletePhoto(@Param('id', ParseUUIDPipe) id: string) {
    return this.photosService.deleteDirectorPhoto(id);
  }

  @Post()
  @ApiBody({ type: CreateDirectorDto })
  @ApiOperation({ summary: 'Create a director' })
  @ApiCreatedResponse({ type: DirectorDetailsDto })
  create(@Body() dto: CreateDirectorDto) {
    return this.directorsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List directors with pagination and filters',
    description:
      'Filters are combined with AND. Results are sorted by name, then UUID.',
  })
  @ApiOkResponse({ type: DirectorPageDto })
  findAll(@Query() query: QueryDirectorsDto) {
    return this.directorsService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Director UUID',
  })
  @ApiNotFoundResponse({ description: 'Director not found.' })
  @ApiOperation({ summary: 'Get a director by UUID' })
  @ApiOkResponse({ type: DirectorDetailsDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.directorsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Director UUID',
  })
  @ApiNotFoundResponse({ description: 'Director not found.' })
  @ApiBody({ type: UpdateDirectorDto })
  @ApiOperation({
    summary: 'Update a director',
    description: 'Only supplied fields are updated. Null values are rejected.',
  })
  @ApiOkResponse({ type: DirectorDetailsDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDirectorDto,
  ) {
    return this.directorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Director UUID',
  })
  @ApiNotFoundResponse({ description: 'Director not found.' })
  @ApiOperation({
    summary: 'Delete a director',
    description:
      'Deletes the director and their movies, schedules photo cleanup and returns the deleted director.',
  })
  @ApiOkResponse({ type: DirectorDetailsDto })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.directorsService.remove(id);
  }
}
