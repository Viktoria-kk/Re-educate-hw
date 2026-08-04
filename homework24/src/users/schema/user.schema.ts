import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
    lowercase: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
  })
  lastName!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
  })
  phoneNumber!: string;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
  })
  gender!: string;

  @Prop({
    type: Date,
    required: true,
  })
  subscriptionStartDate!: Date;

  @Prop({
    type: Date,
    required: true,
  })
  subscriptionEndDate!: Date;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'expense',
    default: [],
  })
  expenses!: Types.ObjectId[];
}

export const userSchema = SchemaFactory.createForClass(User);
