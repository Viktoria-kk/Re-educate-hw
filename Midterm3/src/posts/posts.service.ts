import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreatePostInput } from './dto/create-post.input';
import { PostType } from './dto/post.type';
import { UpdatePostInput } from './dto/update-post.input';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private readonly posts: Model<Post>) {}

  async create(input: CreatePostInput, authorId: string): Promise<PostType> {
    const post = await this.posts.create({
      title: input.title.trim(),
      content: input.content.trim(),
      authorId: new Types.ObjectId(authorId),
    });
    return this.toType(post);
  }

  async findAll(): Promise<PostType[]> {
    const posts = await this.posts.find().sort({ _id: -1 }).limit(100).exec();
    return posts.map((post) => this.toType(post));
  }

  async findOne(id: string): Promise<PostType> {
    return this.toType(await this.requirePost(id));
  }

  async update(id: string, input: UpdatePostInput, userId: string): Promise<PostType> {
    const post = await this.requirePost(id);
    this.assertOwner(post, userId);
    if (input.title !== undefined) post.title = input.title.trim();
    if (input.content !== undefined) post.content = input.content.trim();
    await post.save();
    return this.toType(post);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const post = await this.requirePost(id);
    this.assertOwner(post, userId);
    await post.deleteOne();
    return true;
  }

  private async requirePost(id: string): Promise<PostDocument> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid post ID');
    const post = await this.posts.findById(id).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private assertOwner(post: PostDocument, userId: string): void {
    if (post.authorId.toString() !== userId) {
      throw new ForbiddenException('Only the author may modify this post');
    }
  }

  private toType(post: PostDocument): PostType {
    return {
      id: post.id as string,
      title: post.title,
      content: post.content,
      authorId: post.authorId.toString(),
    };
  }
}
