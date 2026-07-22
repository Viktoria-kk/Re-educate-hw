import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { IExpense } from './expense.interface';

@Injectable()
export class ExpensesService {
  private expenses: IExpense[] = [];
  private nextId = 1;

  getExpenses(): IExpense[] {
    return this.expenses;
  }

  createExpense(createExpenseDto: CreateExpenseDto): IExpense {
    const newExpense: IExpense = {
      id: this.nextId++,
      ...createExpenseDto,
      totalPrice: createExpenseDto.quantity * createExpenseDto.price,
    };

    this.expenses.push(newExpense);
    return newExpense;
  }

  getExpenseById(expenseId: number): IExpense {
    const expense = this.expenses.find((item) => item.id === expenseId);

    if (!expense) {
      throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
    }

    return expense;
  }

  deleteExpenseById(expenseId: number): IExpense {
    const index = this.expenses.findIndex((item) => item.id === expenseId);

    if (index === -1) {
      throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
    }

    const [deletedExpense] = this.expenses.splice(index, 1);
    return deletedExpense;
  }

  updateExpenseById(
    expenseId: number,
    updateExpenseDto: UpdateExpenseDto,
  ): IExpense {
    const index = this.expenses.findIndex((item) => item.id === expenseId);

    if (index === -1) {
      throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
    }

    const updatedExpense = {
      ...this.expenses[index],
      ...updateExpenseDto,
    };

    updatedExpense.totalPrice = updatedExpense.quantity * updatedExpense.price;
    this.expenses[index] = updatedExpense;

    return this.expenses[index];
  }
}
