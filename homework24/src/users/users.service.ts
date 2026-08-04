import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../expenses/schema/expense.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    @InjectModel('expense') private readonly expenseModel: Model<Expense>,
  ) {}

  getUsers({ page = 1, take = 30, gender, email }: UserQueryDto) {
    const filters: Record<string, unknown> = {};

    if (gender) {
      filters.gender = gender.toLowerCase();
    }

    if (email) {
      filters.email = email.toLowerCase();
    }

    return this.userModel
      .find(filters)
      .skip((page - 1) * take)
      .limit(take);
  }

  async createUser(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase();
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date(subscriptionStartDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    return this.userModel.create({
      ...createUserDto,
      email,
      phoneNumber: createUserDto.phoneNumber,
      subscriptionStartDate,
      subscriptionEndDate,
    });
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).populate({
      path: 'expenses',
      select: 'category productName quantity price -_id',
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUserById(userId: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    await this.expenseModel.deleteMany({ owner: new Types.ObjectId(userId) });
    return deletedUser;
  }

  async updateUserById(userId: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { ...updateUserDto, $inc: { __v: 1 } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async upgradeSubscription(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscriptionEndDate = new Date(
      Math.max(Date.now(), user.subscriptionEndDate.getTime()),
    );
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    user.subscriptionEndDate = subscriptionEndDate;
    await user.save();

    return {
      message: 'Subscription upgraded successfully',
      subscriptionEndDate,
    };
  }

  async addExpenseToUser(userId: Types.ObjectId, expenseId: string) {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
      $push: { expenses: expenseId },
    });

    return updatedUser;
  }
}
