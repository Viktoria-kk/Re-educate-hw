import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { Movie } from '../movies/entities/movie.entity';
import { CreateDirectorDto } from './dto/create-director.dto';
import { QueryDirectorsDto } from './dto/query-directors.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { Director } from './entities/director.entity';

@Injectable()
export class DirectorsService {
  constructor(
    @InjectRepository(Director)
    private readonly directorsRepository: Repository<Director>,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createDirectorDto: CreateDirectorDto) {
    const director = this.directorsRepository.create(createDirectorDto);
    return this.formatDirector(await this.directorsRepository.save(director));
  }

  async findAll(query: QueryDirectorsDto) {
    const queryBuilder = this.directorsRepository
      .createQueryBuilder('director')
      .leftJoinAndSelect('director.films', 'film');

    if (query.name) {
      queryBuilder.andWhere('LOWER(director.name) LIKE LOWER(:name)', {
        name: `%${query.name}%`,
      });
    }
    if (query.nationality) {
      queryBuilder.andWhere(
        'LOWER(director.nationality) LIKE LOWER(:nationality)',
        {
          nationality: `%${query.nationality}%`,
        },
      );
    }
    if (query.birthYearFrom) {
      queryBuilder.andWhere('director.birthYear >= :birthYearFrom', query);
    }
    if (query.birthYearTo) {
      queryBuilder.andWhere('director.birthYear <= :birthYearTo', query);
    }

    const [data, total] = await queryBuilder
      .orderBy('director.name', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return {
      data: data.map((director) => this.formatDirector(director)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string) {
    const director = await this.directorsRepository.findOne({
      where: { id },
      relations: { films: true },
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }
    return this.formatDirector(director);
  }

  async update(id: string, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.getDirectorOrFail(id);
    Object.assign(director, updateDirectorDto);
    return this.formatDirector(await this.directorsRepository.save(director));
  }

  async remove(id: string) {
    const director = await this.getDirectorOrFail(id);
    await this.deleteStoredFiles([
      director.profilePhotoKey,
      ...(director.films ?? []).flatMap((movie) => movie.imageKeys ?? []),
    ]);
    await this.directorsRepository.remove(director);
    return this.formatDirector(director);
  }

  async uploadProfilePhoto(id: string, photo: Express.Multer.File) {
    const director = await this.getDirectorOrFail(id);
    const key = `directors/${director.id}/profile/${randomUUID()}${this.getExtension(photo)}`;

    await this.awsS3Service.uploadFile(key, photo);
    const previousKey = director.profilePhotoKey;
    director.profilePhotoKey = key;
    const savedDirector = await this.directorsRepository.save(director);

    if (previousKey) {
      await this.awsS3Service.deleteFile(previousKey);
    }

    return this.formatDirector(savedDirector);
  }

  async removeProfilePhoto(id: string) {
    const director = await this.getDirectorOrFail(id);
    if (!director.profilePhotoKey) {
      throw new NotFoundException('Profile photo not found');
    }

    await this.awsS3Service.deleteFile(director.profilePhotoKey);
    director.profilePhotoKey = null;
    return this.formatDirector(await this.directorsRepository.save(director));
  }

  private async getDirectorOrFail(id: string) {
    const director = await this.directorsRepository.findOne({
      where: { id },
      relations: { films: true },
    });
    if (!director) {
      throw new NotFoundException('Director not found');
    }
    return director;
  }

  private formatDirector(director: Director) {
    const { profilePhotoKey, ...directorData } = director;
    if (!profilePhotoKey) {
      return directorData;
    }
    return {
      ...directorData,
      profilePhotoUrl: this.awsS3Service.getPublicUrl(profilePhotoKey),
    };
  }

  private getExtension(file: Express.Multer.File) {
    const extension = extname(file.originalname).toLowerCase();
    const extensionsByMimeType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return extensionsByMimeType[file.mimetype] ?? extension;
  }

  private async deleteStoredFiles(keys: (string | null | undefined)[]) {
    await Promise.all(
      keys
        .filter((key): key is string => Boolean(key))
        .map((key) => this.awsS3Service.deleteFile(key)),
    );
  }
}
