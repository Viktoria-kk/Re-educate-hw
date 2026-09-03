import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Expense {
  @Prop({
    type: String,
    required: true,
  })
  category!: string;

  @Prop({
    type: String,
    required: true,
  })
  productName!: string;

  @Prop({
    type: Number,
    required: true,
  })
  quantity!: number;

  @Prop({
    type: Number,
    required: true,
  })
  price!: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  })
  owner!: Types.ObjectId;
}

export const expenseSchema = SchemaFactory.createForClass(Expense);
