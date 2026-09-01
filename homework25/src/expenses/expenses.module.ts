import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { expenseSchema } from './schema/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'expense', schema: expenseSchema }]),
    UsersModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
