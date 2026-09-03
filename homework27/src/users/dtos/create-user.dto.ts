import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;

  @IsNotEmpty()
  @IsIn(['m', 'f'])
  gender!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  age!: number;
}
