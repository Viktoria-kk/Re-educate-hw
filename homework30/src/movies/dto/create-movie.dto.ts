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
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  genre!: string;

  @IsInt()
  @Min(1)
  @Max(9999)
  year!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  director!: string;
}
