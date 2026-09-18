import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { Director } from '../directors/entities/director.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    @InjectRepository(Director)
    private readonly directorsRepository: Repository<Director>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.getDirector(createMovieDto.directorId);
    const movie = this.moviesRepository.create({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      releaseYear: createMovieDto.releaseYear,
      director,
    });
    return this.formatMovie(await this.moviesRepository.save(movie));
  }

  async findAll(query: QueryMoviesDto) {
    const queryBuilder = this.moviesRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director');

    if (query.name) {
      queryBuilder.andWhere('LOWER(movie.title) LIKE LOWER(:name)', {
        name: `%${query.name}%`,
      });
    }
    if (query.genre) {
      queryBuilder.andWhere('LOWER(movie.genre) LIKE LOWER(:genre)', {
        genre: `%${query.genre}%`,
      });
    }
    if (query.yearFrom) {
      queryBuilder.andWhere('movie.releaseYear >= :yearFrom', query);
    }
    if (query.yearTo) {
      queryBuilder.andWhere('movie.releaseYear <= :yearTo', query);
    }

    const [data, total] = await queryBuilder
      .orderBy('movie.releaseYear', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      data: data.map((movie) => this.formatMovie(movie)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string) {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: { director: true },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return this.formatMovie(movie);
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const movie = await this.getMovieOrFail(id);
    const { directorId, ...movieFields } = updateMovieDto;
    if (directorId) {
      movie.director = await this.getDirector(directorId);
    }
    Object.assign(movie, movieFields);
    return this.formatMovie(await this.moviesRepository.save(movie));
  }

  async remove(id: string) {
    const movie = await this.getMovieOrFail(id);
    await this.deleteStoredFiles(movie.imageKeys ?? []);
    await this.moviesRepository.remove(movie);
    return this.formatMovie(movie);
  }

  async uploadImages(id: string, images: Express.Multer.File[]) {
    if (!images?.length) {
      throw new BadRequestException('At least one image file is required');
    }

    const movie = await this.getMovieOrFail(id);
    const uploadedKeys: string[] = [];

    try {
      for (const image of images) {
        const key = `movies/${movie.id}/images/${randomUUID()}${this.getExtension(image)}`;
        await this.awsS3Service.uploadFile(key, image);
        uploadedKeys.push(key);
      }
    } catch (error) {
      await this.deleteStoredFiles(uploadedKeys);
      throw error;
    }

    movie.imageKeys = [...(movie.imageKeys ?? []), ...uploadedKeys];
    return this.formatMovie(await this.moviesRepository.save(movie));
  }

  async removeImage(id: string, key: string) {
    const movie = await this.getMovieOrFail(id);
    if (!key || !movie.imageKeys?.includes(key)) {
      throw new NotFoundException('Movie image not found');
    }

    await this.awsS3Service.deleteFile(key);
    movie.imageKeys = movie.imageKeys.filter((imageKey) => imageKey !== key);
    return this.formatMovie(await this.moviesRepository.save(movie));
  }

  private async getDirector(id: string) {
    const director = await this.directorsRepository.findOneBy({ id });
    if (!director) {
      throw new BadRequestException('Director not found');
    }
    return director;
  }

  private async getMovieOrFail(id: string) {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: { director: true },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  private formatMovie(movie: Movie) {
    const { imageKeys, ...movieData } = movie;
    if (!imageKeys?.length) {
      return movieData;
    }
    return {
      ...movieData,
      imageKeys,
      imageUrls: imageKeys.map((key) => this.awsS3Service.getPublicUrl(key)),
    };
  }

  private getExtension(file: Express.Multer.File) {
    const extensionsByMimeType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return (
      extensionsByMimeType[file.mimetype] ??
      extname(file.originalname).toLowerCase()
    );
  }

  private async deleteStoredFiles(keys: string[]) {
    await Promise.all(keys.map((key) => this.awsS3Service.deleteFile(key)));
  }
}
