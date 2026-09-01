import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsValidObjectId } from '../common/dto/is-valid-object-id.dto';
import { WriteRateLimit } from '../common/decorators/write-rate-limit.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  findOne(@Param() { id }: IsValidObjectId) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @WriteRateLimit()
  update(
    @Param() { id }: IsValidObjectId,
    @CurrentUserId() currentUserId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own account');
    }
    return this.usersService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  @WriteRateLimit()
  remove(
    @Param() { id }: IsValidObjectId,
    @CurrentUserId() currentUserId: string,
  ) {
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.usersService.deleteUserById(id);
  }
}
