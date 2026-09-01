import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
  })
  category!: string;

  @Prop({
    type: String,
    required: true,
  })
  description!: string;

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

export const productSchema = SchemaFactory.createForClass(Product);
