import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsInt,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;

  @IsIn(['m', 'f'])
  gender!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  age!: number;

  @IsString()
  @MinLength(8)
  password!: string;
}
