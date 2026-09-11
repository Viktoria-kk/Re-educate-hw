import { ApiProperty } from '@nestjs/swagger';

export class PhotoResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'images/movies/movie-id/photo-id.jpg' })
  key!: string;

  @ApiProperty({ enum: ['image/jpeg', 'image/png', 'image/webp'] })
  contentType!: string;

  @ApiProperty({ example: 2048, description: 'File size in bytes.' })
  size!: number;

  @ApiProperty({
    example:
      'https://example.cloudfront.net/images/movies/movie-id/photo-id.jpg',
  })
  url!: string;
}

export class MovieResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'The Hangover' })
  name!: string;

  @ApiProperty({ example: 'comedy' })
  genre!: string;

  @ApiProperty({ example: 2009 })
  year!: number;

  @ApiProperty({
    example:
      'Three friends retrace their steps after a Las Vegas bachelor party.',
  })
  description!: string;

  @ApiProperty({ type: [PhotoResponseDto], nullable: true })
  photos!: PhotoResponseDto[] | null;
}

export class DirectorResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Todd Phillips' })
  name!: string;

  @ApiProperty({ example: 'American' })
  nationality!: string;

  @ApiProperty({ example: 1970 })
  birthYear!: number;

  @ApiProperty({ type: PhotoResponseDto, nullable: true })
  profilePhoto!: PhotoResponseDto | null;
}

export class MovieDetailsDto extends MovieResponseDto {
  @ApiProperty({ type: DirectorResponseDto })
  director!: DirectorResponseDto;
}

export class DirectorDetailsDto extends DirectorResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  films!: MovieResponseDto[];
}

class PageResponseDto {
  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class MoviePageDto extends PageResponseDto {
  @ApiProperty({ type: [MovieDetailsDto] })
  data!: MovieDetailsDto[];
}

export class DirectorPageDto extends PageResponseDto {
  @ApiProperty({ type: [DirectorDetailsDto] })
  data!: DirectorDetailsDto[];
}
