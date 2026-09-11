import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryDirectorsDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'Todd',
    maxLength: 255,
    description: 'Case-insensitive partial name match.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'American',
    maxLength: 255,
    description: 'Case-insensitive exact nationality match.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nationality?: string;

  @ApiPropertyOptional({
    example: 1960,
    minimum: 1,
    maximum: 9999,
    description:
      'Inclusive lower birth year bound; must not exceed birthYearTo.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  birthYearFrom?: number;

  @ApiPropertyOptional({
    example: 1980,
    minimum: 1,
    maximum: 9999,
    description: 'Inclusive upper birth year bound.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  birthYearTo?: number;
}
