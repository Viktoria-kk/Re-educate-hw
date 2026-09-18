import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { GqlJwtGuard } from '../auth/gql-jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/current-user.decorator';
import { UserType } from './dto/user.type';
import { UsersService } from './users.service';

@Resolver(() => UserType)
@UseGuards(GqlJwtGuard)
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

  @Query(() => UserType)
  async me(@CurrentUser() current: JwtUser): Promise<UserType> {
    return this.users.toType(await this.users.requireById(current.id));
  }

  @Query(() => UserType)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserType> {
    return this.users.toType(await this.users.requireById(id));
  }
}
