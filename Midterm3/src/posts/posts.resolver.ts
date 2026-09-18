import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/current-user.decorator';
import { GqlJwtGuard } from '../auth/gql-jwt.guard';
import { CreatePostInput } from './dto/create-post.input';
import { PostType } from './dto/post.type';
import { UpdatePostInput } from './dto/update-post.input';
import { PostsService } from './posts.service';

@Resolver(() => PostType)
@UseGuards(GqlJwtGuard)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [PostType])
  posts(): Promise<PostType[]> {
    return this.postsService.findAll();
  }

  @Query(() => PostType)
  post(@Args('id', { type: () => ID }) id: string): Promise<PostType> {
    return this.postsService.findOne(id);
  }

  @Mutation(() => PostType)
  createPost(@Args('input') input: CreatePostInput, @CurrentUser() user: JwtUser): Promise<PostType> {
    return this.postsService.create(input, user.id);
  }

  @Mutation(() => PostType)
  updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePostInput,
    @CurrentUser() user: JwtUser,
  ): Promise<PostType> {
    return this.postsService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  deletePost(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: JwtUser): Promise<boolean> {
    return this.postsService.remove(id, user.id);
  }
}
