import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDirectorDto {
  @ApiProperty({ example: 'Todd Phillips', maxLength: 255, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'American', maxLength: 255, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nationality!: string;

  @ApiProperty({ example: 1970, minimum: 1, maximum: 9999 })
  @IsInt()
  @Min(1)
  @Max(9999)
  birthYear!: number;
}
