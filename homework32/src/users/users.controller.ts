import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from './current-user-id.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUserId() userId: string) {
    return this.usersService.getCurrentUser(userId);
  }

  @Delete('me')
  deactivateCurrentUser(@CurrentUserId() userId: string) {
    return this.usersService.deactivateCurrentUser(userId);
  }
}
