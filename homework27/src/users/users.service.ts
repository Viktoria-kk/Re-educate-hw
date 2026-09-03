import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../expenses/schema/expense.schema';
import { Product } from '../products/schema/product.schema';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    @InjectModel('expense') private readonly expenseModel: Model<Expense>,
    @InjectModel('product') private readonly productModel: Model<Product>,
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

  findUserByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  getGenderStatistics() {
    return this.userModel.aggregate<{
      gender: string;
      averageAge: number;
      totalUsers: number;
    }>([
      {
        $match: {
          gender: { $in: ['m', 'f'] },
          age: { $type: 'number' },
        },
      },
      {
        $group: {
          _id: '$gender',
          averageAge: { $avg: '$age' },
          totalUsers: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          gender: '$_id',
          averageAge: { $round: ['$averageAge', 2] },
          totalUsers: 1,
        },
      },
      { $sort: { gender: 1 } },
    ]);
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
    await this.productModel.deleteMany({ owner: new Types.ObjectId(userId) });
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

  removeExpenseFromUser(userId: string, expenseId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $pull: { expenses: new Types.ObjectId(expenseId) },
    });
  }
}
