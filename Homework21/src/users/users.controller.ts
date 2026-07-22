import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    const { firstName, lastName, email, phoneNumber, gender } = createUserDto;

    if (!firstName || !lastName || !email || !phoneNumber || !gender) {
      throw new HttpException(
        'All user fields are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getUserById(Number(id));
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.usersService.deleteUserById(Number(id));
  }

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserById(Number(id), updateUserDto);
  }
}
