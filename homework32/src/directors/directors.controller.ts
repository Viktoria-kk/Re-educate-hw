import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDirectorDto } from './dto/create-director.dto';
import { QueryDirectorsDto } from './dto/query-directors.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { DirectorsService } from './directors.service';

@Controller('directors')
export class DirectorsController {
  constructor(private readonly directorsService: DirectorsService) {}

  @Post()
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorsService.create(createDirectorDto);
  }

  @Get()
  findAll(@Query() query: QueryDirectorsDto) {
    return this.directorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.directorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDirectorDto: UpdateDirectorDto,
  ) {
    return this.directorsService.update(id, updateDirectorDto);
  }

  @Post(':id/profile-photo')
  @UseInterceptors(
    FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.directorsService.uploadProfilePhoto(id, photo);
  }

  @Delete(':id/profile-photo')
  removeProfilePhoto(@Param('id') id: string) {
    return this.directorsService.removeProfilePhoto(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.directorsService.remove(id);
  }
}
