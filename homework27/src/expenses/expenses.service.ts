import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseQueryDto } from './dtos/expense-query.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { Expense } from './schema/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel('expense') private readonly expenseModel: Model<Expense>,
    private readonly usersService: UsersService,
  ) {}

  getExpenses(
    { page = 1, take = 30, category, priceFrom, priceTo }: ExpenseQueryDto,
    userId: string,
  ) {
    if (
      priceFrom !== undefined &&
      priceTo !== undefined &&
      priceFrom > priceTo
    ) {
      throw new BadRequestException('priceFrom cannot be greater than priceTo');
    }

    const filters: Record<string, unknown> = {
      owner: new Types.ObjectId(userId),
    };
    if (category) filters.category = category.toLowerCase();
    if (priceFrom !== undefined || priceTo !== undefined) {
      filters.price = {
        ...(priceFrom !== undefined && { $gte: priceFrom }),
        ...(priceTo !== undefined && { $lte: priceTo }),
      };
    }

    return this.expenseModel
      .find(filters)
      .skip((page - 1) * take)
      .limit(take)
      .populate({ path: 'owner', select: 'firstName lastName email -_id' });
  }

  getStatistics() {
    return this.expenseModel.aggregate<{
      category: string;
      totalExpense: number;
      totalItems: number;
      expenseCount: number;
      expenses: Array<Record<string, unknown>>;
    }>([
      {
        $group: {
          _id: '$category',
          totalExpense: {
            $sum: { $multiply: ['$price', '$quantity'] },
          },
          totalItems: { $sum: '$quantity' },
          expenseCount: { $sum: 1 },
          expenses: {
            $push: {
              id: '$_id',
              productName: '$productName',
              quantity: '$quantity',
              price: '$price',
              expenseTotal: { $multiply: ['$price', '$quantity'] },
              owner: '$owner',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalExpense: 1,
          totalItems: 1,
          expenseCount: 1,
          expenses: 1,
        },
      },
      { $sort: { category: 1 } },
    ]);
  }

  getTopSpenders(limit: number) {
    return this.expenseModel.aggregate<{
      userId: Types.ObjectId;
      firstName: string;
      lastName: string;
      email: string;
      totalSpent: number;
      totalItems: number;
      expenseCount: number;
    }>([
      {
        $group: {
          _id: '$owner',
          totalSpent: { $sum: { $multiply: ['$price', '$quantity'] } },
          totalItems: { $sum: '$quantity' },
          expenseCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
          totalSpent: 1,
          totalItems: 1,
          expenseCount: 1,
        },
      },
    ]);
  }

  async getExpenseById(id: string, userId: string) {
    const expense = await this.expenseModel
      .findOne({ _id: id, owner: new Types.ObjectId(userId) })
      .populate({ path: 'owner', select: 'firstName lastName email -_id' });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async createExpense(expenseDto: CreateExpenseDto, userId: string) {
    const ownerId = new Types.ObjectId(userId);
    await this.usersService.getUserById(userId);

    const createdExpense = await this.expenseModel.create({
      ...expenseDto,
      owner: ownerId,
    });

    await this.usersService.addExpenseToUser(
      createdExpense.owner,
      createdExpense._id.toString(),
    );

    return createdExpense;
  }

  async updateExpense(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    userId: string,
  ) {
    const updatedExpense = await this.expenseModel.findOneAndUpdate(
      { _id: id, owner: new Types.ObjectId(userId) },
      { ...updateExpenseDto, $inc: { __v: 1 } },
      { new: true },
    );

    if (!updatedExpense) {
      throw new NotFoundException('Expense not found');
    }

    return updatedExpense;
  }

  async deleteExpense(id: string, userId: string) {
    const deletedExpense = await this.expenseModel.findOneAndDelete({
      _id: id,
      owner: new Types.ObjectId(userId),
    });

    if (!deletedExpense) {
      throw new NotFoundException('Expense not found');
    }

    await this.usersService.removeExpenseFromUser(userId, id);
    return deletedExpense;
  }
}
