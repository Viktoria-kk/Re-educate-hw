import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateDirectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  birthYear: number;

  @IsString()
  @IsNotEmpty()
  nationality: string;
}
