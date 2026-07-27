import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { ExpenseQueryDto } from './dtos/expense-query.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getExpenses(@Query() expenseQueryDto: ExpenseQueryDto) {
    return this.expensesService.getExpenses(expenseQueryDto);
  }

  @Post()
  createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    const { category, productName, quantity, price } = createExpenseDto;

    if (
      !category ||
      !productName ||
      quantity === undefined ||
      price === undefined
    ) {
      throw new HttpException(
        'All expense fields are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (quantity <= 0 || price < 0) {
      throw new HttpException(
        'Quantity must be greater than 0 and price cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.expensesService.createExpense(createExpenseDto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.expensesService.getExpenseById(Number(id));
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.expensesService.deleteExpenseById(Number(id));
  }

  @Patch(':id')
  updateById(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    if (
      updateExpenseDto.quantity !== undefined &&
      updateExpenseDto.quantity <= 0
    ) {
      throw new HttpException(
        'Quantity must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateExpenseDto.price !== undefined && updateExpenseDto.price < 0) {
      throw new HttpException(
        'Price cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.expensesService.updateExpenseById(Number(id), updateExpenseDto);
  }
}
