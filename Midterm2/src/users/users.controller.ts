import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ObjectIdParamDto } from '../common/dto/object-id-param.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('users')
  findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  @Get('users/filter')
  findFiltered(@Query() query: FilterUsersDto) {
    return this.usersService.findFiltered(query);
  }

  @Get('total-users')
  totalUsers() {
    return this.usersService.totalUsers();
  }

  @Get('users/:id')
  findOne(@Param() { id }: ObjectIdParamDto) {
    return this.usersService.findOne(id);
  }

  @Patch('users/:id')
  update(
    @Param() { id }: ObjectIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  remove(@Param() { id }: ObjectIdParamDto) {
    return this.usersService.remove(id);
  }
}
