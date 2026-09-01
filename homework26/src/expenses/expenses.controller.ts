import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsValidObjectId } from '../common/dto/is-valid-object-id.dto';
import { WriteRateLimit } from '../common/decorators/write-rate-limit.decorator';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseQueryDto } from './dtos/expense-query.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Query() query: ExpenseQueryDto, @CurrentUserId() userId: string) {
    return this.expensesService.getExpenses(query, userId);
  }

  @Get(':id')
  findOne(@Param() { id }: IsValidObjectId, @CurrentUserId() userId: string) {
    return this.expensesService.getExpenseById(id, userId);
  }

  @Post()
  @WriteRateLimit()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUserId() userId: string,
  ) {
    return this.expensesService.createExpense(createExpenseDto, userId);
  }

  @Patch(':id')
  @WriteRateLimit()
  update(
    @Param() { id }: IsValidObjectId,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentUserId() userId: string,
  ) {
    return this.expensesService.updateExpense(id, updateExpenseDto, userId);
  }

  @Delete(':id')
  @WriteRateLimit()
  remove(@Param() { id }: IsValidObjectId, @CurrentUserId() userId: string) {
    return this.expensesService.deleteExpense(id, userId);
  }
}
