import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryDirectorsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  birthYearFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  birthYearTo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
