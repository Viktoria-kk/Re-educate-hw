import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class UserQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
