import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Director } from '../directors/entities/director.entity';
import { QueryMoviesDto } from './dto/query-movies.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let module: TestingModule;
  let record: Movie;
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn<() => Promise<[Movie[], number]>>(),
  };
  const repositoryMock = {
    create: jest.fn<(dto: unknown) => Movie>(),
    save: jest.fn<(entity: Movie) => Promise<Movie>>(),
    findOne: jest.fn<(options: unknown) => Promise<Movie | null>>(),
    update: jest.fn<(id: string, dto: unknown) => Promise<unknown>>(),
    delete: jest.fn<(id: string) => Promise<unknown>>(),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };
  const directorRepositoryMock = {
    findOneBy: jest.fn<(options: unknown) => Promise<Director | null>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    record = {
      id: 'movie-id',
      name: 'The Hangover',
      genre: 'comedy',
      year: 2009,
      description: 'A film.',
      director: {
        id: 'director-id',
        name: 'Todd Phillips',
        nationality: 'American',
        birthYear: 1970,
        films: [],
      },
    };
    repositoryMock.create.mockReturnValue(record);
    repositoryMock.save.mockResolvedValue(record);
    repositoryMock.findOne.mockResolvedValue(record);
    repositoryMock.update.mockResolvedValue({ affected: 1 });
    repositoryMock.delete.mockResolvedValue({ affected: 1 });
    queryBuilder.getManyAndCount.mockResolvedValue([[record], 1]);
    directorRepositoryMock.findOneBy.mockResolvedValue(record.director);
    module = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: repositoryMock },
        {
          provide: getRepositoryToken(Director),
          useValue: directorRepositoryMock,
        },
      ],
    }).compile();
    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('create', () => {
    const dto = {
      name: 'The Hangover',
      genre: 'comedy',
      year: 2009,
      description: 'A film.',
      director: 'director-id',
    };
    it('creates and returns the record with its director', async () => {
      expect(await service.create(dto)).toEqual(record);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...dto,
        director: record.director,
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(record);
      expect(directorRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: dto.director,
      });
    });
    it('rejects a nonexistent director without saving a movie', async () => {
      jest
        .spyOn(directorRepositoryMock, 'findOneBy')
        .mockResolvedValueOnce(null);
      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException('Director not found'),
      );
      expect(repositoryMock.create).not.toHaveBeenCalled();
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
    it('propagates database save failures', async () => {
      const error = new Error('Database unavailable');
      repositoryMock.save.mockRejectedValueOnce(error);
      await expect(service.create(dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('returns default pagination and loads the relationship without filters', async () => {
      expect(await service.findAll(new QueryMoviesDto())).toEqual({
        data: [record],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith('movie');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'movie.director',
        'director',
      );
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('movie.name', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('movie.id', 'ASC');
    });
    it('calculates later-page offsets and rounds up total pages', async () => {
      queryBuilder.getManyAndCount.mockResolvedValueOnce([[record], 21]);
      const query = Object.assign(new QueryMoviesDto(), { page: 3, limit: 10 });
      expect(await service.findAll(query)).toEqual({
        data: [record],
        total: 21,
        page: 3,
        limit: 10,
        totalPages: 3,
      });
      expect(queryBuilder.skip).toHaveBeenCalledWith(20);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });
    it('returns zero total pages when no records match', async () => {
      queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);
      expect(await service.findAll(new QueryMoviesDto())).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
    it('combines filters using bound parameters and inclusive year boundaries', async () => {
      const query = Object.assign(new QueryMoviesDto(), {
        name: 'hang',
        genre: 'comedy',
        yearFrom: 2002,
        yearTo: 2010,
        director: 'director-id',
      });
      await service.findAll(query);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(movie.name) LIKE LOWER(:name)',
        { name: '%hang%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(movie.genre) = LOWER(:genre)',
        { genre: 'comedy' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'director.id = :director',
        { director: 'director-id' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'movie.year >= :yearFrom',
        { yearFrom: 2002 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'movie.year <= :yearTo',
        { yearTo: 2010 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(5);
    });
    it.each(['yearFrom', 'yearTo'])(
      'supports a single year boundary: %s',
      async (key) => {
        await service.findAll(
          Object.assign(new QueryMoviesDto(), { [key]: 2000 }),
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
      },
    );
    it('accepts equal year boundaries', async () => {
      await expect(
        service.findAll(
          Object.assign(new QueryMoviesDto(), { yearFrom: 2000, yearTo: 2000 }),
        ),
      ).resolves.toMatchObject({ total: 1 });
    });
    it('rejects reversed year ranges before querying the database', async () => {
      await expect(
        service.findAll(
          Object.assign(new QueryMoviesDto(), { yearFrom: 2010, yearTo: 2000 }),
        ),
      ).rejects.toThrow(
        new BadRequestException('yearFrom must not exceed yearTo'),
      );
      expect(repositoryMock.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns a record with its director', async () => {
      expect(await service.findOne(record.id)).toEqual(record);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: record.id },
        relations: { director: true },
      });
    });
    it('throws when the record does not exist', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Movie not found'),
      );
    });
  });

  describe('update', () => {
    it('updates provided fields and preserves omitted fields and relationships', async () => {
      const originalDirector = record.director;
      const result = await service.update(record.id, { name: 'Updated' });
      expect(result).toMatchObject({
        name: 'Updated',
        year: 2009,
        director: originalDirector,
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(result);
      expect(directorRepositoryMock.findOneBy).not.toHaveBeenCalled();
    });
    it('handles an empty update', async () => {
      expect(await service.update(record.id, {})).toEqual(record);
      expect(directorRepositoryMock.findOneBy).not.toHaveBeenCalled();
    });
    it('rejects a missing record without writing', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      await expect(
        service.update('missing', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
    it('reassigns the movie to an existing director', async () => {
      const director = { ...record.director, id: 'new-director' };
      directorRepositoryMock.findOneBy.mockResolvedValueOnce(director);
      expect(
        await service.update(record.id, { director: director.id }),
      ).toMatchObject({ director });
      expect(directorRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: director.id,
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ director }),
      );
    });
    it('rejects a nonexistent replacement director without saving', async () => {
      directorRepositoryMock.findOneBy.mockResolvedValueOnce(null);
      await expect(
        service.update(record.id, { director: 'missing' }),
      ).rejects.toThrow(BadRequestException);
      expect(repositoryMock.save).not.toHaveBeenCalled();
      expect(record.director.id).toBe('director-id');
    });
  });

  describe('remove', () => {
    it('deletes the record and returns its previous data', async () => {
      expect(await service.remove(record.id)).toEqual(record);
      expect(repositoryMock.delete).toHaveBeenCalledWith(record.id);
    });
    it('does not delete when the record is missing', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repositoryMock.delete).not.toHaveBeenCalled();
    });
    it('propagates a failed deletion', async () => {
      const error = new Error('Delete failed');
      repositoryMock.delete.mockRejectedValueOnce(error);
      await expect(service.remove(record.id)).rejects.toThrow(error);
    });
  });
});
