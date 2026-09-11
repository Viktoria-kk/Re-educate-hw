import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Hangover', maxLength: 255, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'comedy', maxLength: 255, minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  genre!: string;

  @ApiProperty({ example: 2009, minimum: 1, maximum: 9999 })
  @IsInt()
  @Min(1)
  @Max(9999)
  year!: number;

  @ApiProperty({
    example:
      'Three friends retrace their steps after a Las Vegas bachelor party.',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'UUID of an existing director.',
  })
  @IsUUID()
  director!: string;
}
