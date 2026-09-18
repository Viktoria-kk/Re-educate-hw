import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { Movie } from '../movies/entities/movie.entity';
import { DirectorsService } from './directors.service';
import { Director } from './entities/director.entity';

describe('DirectorsService', () => {
  let service: DirectorsService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const moviesRepository = {};
  const awsS3Service = { deleteFile: jest.fn(), getPublicUrl: jest.fn() };

  const director = {
    id: 'director-id',
    name: 'Christopher Nolan',
    birthYear: 1970,
    nationality: 'British',
    films: [],
  } as Director;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectorsService,
        { provide: getRepositoryToken(Director), useValue: repository },
        { provide: getRepositoryToken(Movie), useValue: moviesRepository },
        { provide: AwsS3Service, useValue: awsS3Service },
      ],
    }).compile();

    service = module.get<DirectorsService>(DirectorsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('creates and saves a director', async () => {
    const dto = {
      name: director.name,
      birthYear: director.birthYear,
      nationality: director.nationality,
    };
    repository.create.mockReturnValue(director);
    repository.save.mockResolvedValue(director);

    await expect(service.create(dto)).resolves.toEqual(director);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(director);
  });

  it('finds a director with its films', async () => {
    repository.findOne.mockResolvedValue(director);

    await expect(service.findOne(director.id)).resolves.toEqual(director);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: director.id },
      relations: { films: true },
    });
  });

  it('throws when a director does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      new NotFoundException('Director not found'),
    );
  });

  it('updates an existing director', async () => {
    repository.findOne.mockResolvedValue(director);
    repository.save.mockResolvedValue({ ...director, nationality: 'English' });

    await expect(
      service.update(director.id, { nationality: 'English' }),
    ).resolves.toEqual({
      ...director,
      nationality: 'English',
    });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ nationality: 'English' }),
    );
  });

  it('removes an existing director', async () => {
    repository.findOne.mockResolvedValue(director);
    repository.remove.mockResolvedValue(director);

    await expect(service.remove(director.id)).resolves.toEqual(director);
    expect(repository.remove).toHaveBeenCalledWith(director);
  });

  it('applies director filters and pagination in findAll', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[director], 1]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.findAll({
        name: 'nolan',
        nationality: 'brit',
        birthYearFrom: 1950,
        birthYearTo: 1980,
        page: 2,
        limit: 5,
      }),
    ).resolves.toEqual({ data: [director], total: 1, page: 2, limit: 5 });
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(4);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('director.name', 'ASC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
  });

  it('uses default pagination when findAll receives no filters', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.findAll({ page: 1, limit: 10 })).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
  });
});
