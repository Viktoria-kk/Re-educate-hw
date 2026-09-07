// Load Movie first: the existing entities use circular decorator metadata.
import '../movies/entities/movie.entity';
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
import { Movie } from '../movies/entities/movie.entity';
import { Director } from './entities/director.entity';
import { DirectorsService } from './directors.service';
import { QueryDirectorsDto } from './dto/query-directors.dto';

describe('DirectorsService', () => {
  let service: DirectorsService;
  let module: TestingModule;
  let record: Director;
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn<() => Promise<[Director[], number]>>(),
  };
  const repositoryMock = {
    create: jest.fn<(dto: unknown) => Director>(),
    save: jest.fn<(entity: Director) => Promise<Director>>(),
    findOne: jest.fn<(options: unknown) => Promise<Director | null>>(),
    update: jest.fn<(id: string, dto: unknown) => Promise<unknown>>(),
    delete: jest.fn<(id: string) => Promise<unknown>>(),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    record = {
      id: 'director-id',
      name: 'Todd Phillips',
      nationality: 'American',
      birthYear: 1970,
      films: [{ id: 'movie-id', name: 'The Hangover' } as Movie],
    };
    repositoryMock.create.mockReturnValue(record);
    repositoryMock.save.mockResolvedValue(record);
    repositoryMock.findOne.mockResolvedValue(record);
    repositoryMock.update.mockResolvedValue({ affected: 1 });
    repositoryMock.delete.mockResolvedValue({ affected: 1 });
    queryBuilder.getManyAndCount.mockResolvedValue([[record], 1]);

    module = await Test.createTestingModule({
      providers: [
        DirectorsService,
        { provide: getRepositoryToken(Director), useValue: repositoryMock },
      ],
    }).compile();
    service = module.get<DirectorsService>(DirectorsService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('create', () => {
    const dto = {
      name: 'Todd Phillips',
      nationality: 'American',
      birthYear: 1970,
    };
    it('creates and returns the record with its films', async () => {
      expect(await service.create(dto)).toEqual(record);
      expect(repositoryMock.create).toHaveBeenCalledWith(dto);
      expect(repositoryMock.save).toHaveBeenCalledWith(record);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: record.id },
        relations: { films: true },
      });
    });

    it('propagates database save failures', async () => {
      const error = new Error('Database unavailable');
      repositoryMock.save.mockRejectedValueOnce(error);
      await expect(service.create(dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('returns default pagination and loads the relationship without filters', async () => {
      expect(await service.findAll(new QueryDirectorsDto())).toEqual({
        data: [record],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'director',
      );
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'director.films',
        'film',
      );
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('director.name', 'ASC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
        'director.id',
        'ASC',
      );
    });
    it('calculates later-page offsets and rounds up total pages', async () => {
      queryBuilder.getManyAndCount.mockResolvedValueOnce([[record], 21]);
      const query = Object.assign(new QueryDirectorsDto(), {
        page: 3,
        limit: 10,
      });
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
      expect(await service.findAll(new QueryDirectorsDto())).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
    it('combines filters using bound parameters and inclusive year boundaries', async () => {
      const query = Object.assign(new QueryDirectorsDto(), {
        name: 'Todd',
        nationality: 'American',
        birthYearFrom: 1960,
        birthYearTo: 1980,
      });
      await service.findAll(query);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(director.name) LIKE LOWER(:name)',
        { name: '%Todd%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(director.nationality) = LOWER(:nationality)',
        { nationality: 'American' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'director.birthYear >= :birthYearFrom',
        { birthYearFrom: 1960 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'director.birthYear <= :birthYearTo',
        { birthYearTo: 1980 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(4);
    });
    it.each(['birthYearFrom', 'birthYearTo'])(
      'supports a single year boundary: %s',
      async (key) => {
        await service.findAll(
          Object.assign(new QueryDirectorsDto(), { [key]: 2000 }),
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
      },
    );
    it('accepts equal year boundaries', async () => {
      await expect(
        service.findAll(
          Object.assign(new QueryDirectorsDto(), {
            birthYearFrom: 2000,
            birthYearTo: 2000,
          }),
        ),
      ).resolves.toMatchObject({ total: 1 });
    });
    it('rejects reversed year ranges before querying the database', async () => {
      await expect(
        service.findAll(
          Object.assign(new QueryDirectorsDto(), {
            birthYearFrom: 2010,
            birthYearTo: 2000,
          }),
        ),
      ).rejects.toThrow(
        new BadRequestException('birthYearFrom must not exceed birthYearTo'),
      );
      expect(repositoryMock.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns a record with its films', async () => {
      expect(await service.findOne(record.id)).toEqual(record);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: record.id },
        relations: { films: true },
      });
    });
    it('throws when the record does not exist', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        new NotFoundException('Director not found'),
      );
    });
  });

  describe('update', () => {
    it('updates provided fields and preserves omitted fields and relationships', async () => {
      const updated = { ...record, name: 'Updated' };
      repositoryMock.findOne
        .mockResolvedValueOnce(record)
        .mockResolvedValueOnce(updated);
      expect(await service.update(record.id, { name: 'Updated' })).toEqual(
        updated,
      );
      expect(repositoryMock.update).toHaveBeenCalledWith(record.id, {
        name: 'Updated',
      });
      expect(repositoryMock.findOne).toHaveBeenCalledTimes(2);
    });
    it('handles an empty update', async () => {
      expect(await service.update(record.id, {})).toEqual(record);
      expect(repositoryMock.update).not.toHaveBeenCalled();
    });
    it('rejects a missing record without writing', async () => {
      repositoryMock.findOne.mockResolvedValueOnce(null);
      await expect(
        service.update('missing', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
      expect(repositoryMock.update).not.toHaveBeenCalled();
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
