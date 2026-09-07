import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { QueryDirectorsDto } from './dto/query-directors.dto';
import { paginate } from '../common/paginate';

@Injectable()
export class DirectorsService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepo: Repository<Director>,
  ) {}

  async create(dto: CreateDirectorDto) {
    const director = await this.directorRepo.save(
      this.directorRepo.create(dto),
    );
    return this.findOne(director.id);
  }

  async findAll(query: QueryDirectorsDto) {
    const { name, nationality, birthYearFrom, birthYearTo, page, limit } =
      query;
    if (
      birthYearFrom !== undefined &&
      birthYearTo !== undefined &&
      birthYearFrom > birthYearTo
    ) {
      throw new BadRequestException(
        'birthYearFrom must not exceed birthYearTo',
      );
    }
    const builder = this.directorRepo
      .createQueryBuilder('director')
      .leftJoinAndSelect('director.films', 'film');
    if (name)
      builder.andWhere('LOWER(director.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    if (nationality)
      builder.andWhere('LOWER(director.nationality) = LOWER(:nationality)', {
        nationality,
      });
    if (birthYearFrom !== undefined)
      builder.andWhere('director.birthYear >= :birthYearFrom', {
        birthYearFrom,
      });
    if (birthYearTo !== undefined)
      builder.andWhere('director.birthYear <= :birthYearTo', { birthYearTo });
    const [data, total] = await builder
      .orderBy('director.name', 'ASC')
      .addOrderBy('director.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return paginate(data, total, query);
  }

  async findOne(id: string) {
    const director = await this.directorRepo.findOne({
      where: { id },
      relations: { films: true },
    });
    if (!director) throw new NotFoundException('Director not found');
    return director;
  }

  async update(id: string, dto: UpdateDirectorDto) {
    await this.findOne(id);
    if (Object.keys(dto).length) await this.directorRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const director = await this.findOne(id);
    await this.directorRepo.delete(id);
    return director;
  }
}
