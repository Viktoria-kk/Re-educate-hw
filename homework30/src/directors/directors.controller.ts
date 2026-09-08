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

@Controller('directors')
export class DirectorsController {
  constructor(
    private readonly directorsService: DirectorsService,
    private readonly photosService: PhotosService,
  ) {}

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions(1)))
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.photosService.setDirectorPhoto(id, file);
  }

  @Delete(':id/photo')
  deletePhoto(@Param('id', ParseUUIDPipe) id: string) {
    return this.photosService.deleteDirectorPhoto(id);
  }

  @Post()
  create(@Body() dto: CreateDirectorDto) {
    return this.directorsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryDirectorsDto) {
    return this.directorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.directorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDirectorDto,
  ) {
    return this.directorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.directorsService.remove(id);
  }
}
