import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { userSchema } from './schema/user.schema';
import { expenseSchema } from '../expenses/schema/expense.schema';
import { productSchema } from '../products/schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: userSchema },
      { name: 'expense', schema: expenseSchema },
      { name: 'product', schema: productSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
