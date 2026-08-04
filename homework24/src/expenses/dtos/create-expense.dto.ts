import { Transform } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['shopping', 'food', 'sport', 'technic', 'travel'])
  category!: string;

  @IsNotEmpty()
  @IsString()
  productName!: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(1)
  quantity!: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(1)
  price!: number;

  @IsNotEmpty()
  @IsMongoId()
  owner!: string;
}
