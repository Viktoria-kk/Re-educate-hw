import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear() + 10)
  releaseYear: number;

  @IsUUID()
  directorId: string;
}
