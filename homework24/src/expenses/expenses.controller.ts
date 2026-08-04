import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsValidObjectId } from '../common/dto/is-valid-object-id.dto';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseQueryDto } from './dtos/expense-query.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Query() query: ExpenseQueryDto) {
    return this.expensesService.getExpenses(query);
  }

  @Get(':id')
  findOne(@Param() { id }: IsValidObjectId) {
    return this.expensesService.getExpenseById(id);
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.createExpense(createExpenseDto);
  }
}
