import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Director } from '../directors/entities/director.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { paginate } from '../common/paginate';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Director)
    private readonly directorRepo: Repository<Director>,
  ) {}

  private async getDirector(id: string) {
    const director = await this.directorRepo.findOneBy({ id });
    if (!director) throw new BadRequestException('Director not found');
    return director;
  }

  async create(dto: CreateMovieDto) {
    const director = await this.getDirector(dto.director);
    return this.movieRepo.save(this.movieRepo.create({ ...dto, director }));
  }

  async findAll(query: QueryMoviesDto) {
    const { name, genre, yearFrom, yearTo, director, page, limit } = query;
    if (yearFrom !== undefined && yearTo !== undefined && yearFrom > yearTo) {
      throw new BadRequestException('yearFrom must not exceed yearTo');
    }
    const builder = this.movieRepo
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director');
    if (name)
      builder.andWhere('LOWER(movie.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    if (genre)
      builder.andWhere('LOWER(movie.genre) = LOWER(:genre)', { genre });
    if (yearFrom !== undefined)
      builder.andWhere('movie.year >= :yearFrom', { yearFrom });
    if (yearTo !== undefined)
      builder.andWhere('movie.year <= :yearTo', { yearTo });
    if (director) builder.andWhere('director.id = :director', { director });
    const [data, total] = await builder
      .orderBy('movie.name', 'ASC')
      .addOrderBy('movie.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return paginate(data, total, query);
  }

  async findOne(id: string) {
    const movie = await this.movieRepo.findOne({
      where: { id },
      relations: { director: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async update(id: string, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    const { director, ...properties } = dto;
    if (director !== undefined)
      movie.director = await this.getDirector(director);
    Object.assign(movie, properties);
    return this.movieRepo.save(movie);
  }

  async remove(id: string) {
    const movie = await this.findOne(id);
    await this.movieRepo.delete(id);
    return movie;
  }
}
