import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

export interface UserListResponse {
  data: unknown[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    cached: boolean;
  };
}

@Injectable()
export class UsersService {
  private cacheRevision = 0;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userModel.create({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
      });
      this.invalidateUserCache();
      return user;
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  findAll(pagination: PaginationDto) {
    return this.findAndCache(pagination, {});
  }

  findFiltered(query: FilterUsersDto) {
    const filters = this.buildFilters(query);
    return this.findAndCache(query, filters);
  }

  async findOne(id: string) {
    const cacheKey = `users:${this.cacheRevision}:${id}`;
    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set(cacheKey, user, 60_000);
    return user;
  }

  async totalUsers() {
    const cacheKey = `users:total:${this.cacheRevision}`;
    const cachedTotal = await this.cacheManager.get<number>(cacheKey);

    if (cachedTotal !== undefined) {
      return { total: cachedTotal, cached: true };
    }

    const total = await this.userModel.countDocuments().exec();
    await this.cacheManager.set(cacheKey, total, 60_000);
    return { total, cached: false };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            ...updateUserDto,
            ...(updateUserDto.email && {
              email: updateUserDto.email.toLowerCase(),
            }),
          },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      this.invalidateUserCache();
      return updatedUser;
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    this.invalidateUserCache();
    return deletedUser;
  }

  private async findAndCache(
    query: PaginationDto | FilterUsersDto,
    filters: QueryFilter<User>,
  ): Promise<UserListResponse> {
    const { page, limit } = query;
    const cacheKey = `users:list:${this.cacheRevision}:${JSON.stringify(query)}`;
    const cachedResponse =
      await this.cacheManager.get<UserListResponse>(cacheKey);

    if (cachedResponse) {
      return {
        ...cachedResponse,
        meta: { ...cachedResponse.meta, cached: true },
      };
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filters)
        .sort({ _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filters).exec(),
    ]);

    const response: UserListResponse = {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        cached: false,
      },
    };

    await this.cacheManager.set(cacheKey, response, 60_000);
    return response;
  }

  private buildFilters(query: FilterUsersDto): QueryFilter<User> {
    const { age, ageFrom, ageTo, gender, name } = query;

    if (age !== undefined && (ageFrom !== undefined || ageTo !== undefined)) {
      throw new BadRequestException(
        'Use either age or ageFrom/ageTo, not both',
      );
    }

    if (ageFrom !== undefined && ageTo !== undefined && ageFrom > ageTo) {
      throw new BadRequestException('ageFrom cannot be greater than ageTo');
    }

    const filters: QueryFilter<User> = {};

    if (age !== undefined) {
      filters.age = age;
    } else if (ageFrom !== undefined || ageTo !== undefined) {
      filters.age = {
        ...(ageFrom !== undefined && { $gte: ageFrom }),
        ...(ageTo !== undefined && { $lte: ageTo }),
      };
    }

    if (gender !== undefined) {
      filters.gender = gender;
    }

    if (name?.trim()) {
      filters.fullName = {
        $regex: this.escapeRegex(name.trim()),
        $options: 'i',
      };
    }

    return filters;
  }

  private invalidateUserCache() {
    this.cacheRevision += 1;
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11_000
    );
  }
}
