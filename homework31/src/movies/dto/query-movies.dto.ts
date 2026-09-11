import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryMoviesDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'hang',
    maxLength: 255,
    description: 'Case-insensitive partial name match.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'comedy',
    maxLength: 255,
    description: 'Case-insensitive exact genre match.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  genre?: string;

  @ApiPropertyOptional({
    example: 2000,
    minimum: 1,
    maximum: 9999,
    description: 'Inclusive lower year bound; must not exceed yearTo.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  yearFrom?: number;

  @ApiPropertyOptional({
    example: 2010,
    minimum: 1,
    maximum: 9999,
    description: 'Inclusive upper year bound.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  yearTo?: number;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Filter by director UUID.',
  })
  @IsOptional()
  @IsUUID()
  director?: string;
}
