import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum Gender {
  Male = 'm',
  Female = 'f',
}

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ type: String, required: true, trim: true })
  fullName!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({ type: Number, required: true, min: 1, max: 120, index: true })
  age!: number;

  @Prop({ type: String, required: true, enum: Gender })
  gender!: Gender;
}

export type UserDocument = HydratedDocument<User>;
export const userSchema = SchemaFactory.createForClass(User);
