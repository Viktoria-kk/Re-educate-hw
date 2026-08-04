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
import { Expense } from './schema/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel('expense') private readonly expenseModel: Model<Expense>,
    private readonly usersService: UsersService,
  ) {}

  getExpenses({
    page = 1,
    take = 30,
    category,
    priceFrom,
    priceTo,
  }: ExpenseQueryDto) {
    if (
      priceFrom !== undefined &&
      priceTo !== undefined &&
      priceFrom > priceTo
    ) {
      throw new BadRequestException('priceFrom cannot be greater than priceTo');
    }

    const filters: Record<string, unknown> = {};
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

  async getExpenseById(id: string) {
    const expense = await this.expenseModel
      .findById(id)
      .populate({ path: 'owner', select: 'firstName lastName email -_id' });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async createExpense({ owner, ...expenseDto }: CreateExpenseDto) {
    const ownerId = new Types.ObjectId(owner);
    await this.usersService.getUserById(owner);

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
}
