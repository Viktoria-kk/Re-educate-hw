import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from '../aws-s3/aws-s3.service';
import { Director } from '../directors/entities/director.entity';
import { Movie } from './entities/movie.entity';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;

  const moviesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const directorsRepository = { findOneBy: jest.fn() };
  const awsS3Service = { deleteFile: jest.fn(), getPublicUrl: jest.fn() };

  const director = { id: 'director-id', name: 'Christopher Nolan' } as Director;
  const movie = {
    id: 'movie-id',
    title: 'Inception',
    genre: 'Science fiction',
    releaseYear: 2010,
    director,
  } as Movie;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: moviesRepository },
        {
          provide: getRepositoryToken(Director),
          useValue: directorsRepository,
        },
        { provide: AwsS3Service, useValue: awsS3Service },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a movie for an existing director', async () => {
    directorsRepository.findOneBy.mockResolvedValue(director);
    moviesRepository.create.mockReturnValue(movie);
    moviesRepository.save.mockResolvedValue(movie);
    const dto = {
      title: movie.title,
      genre: movie.genre,
      releaseYear: movie.releaseYear,
      directorId: director.id,
    };

    await expect(service.create(dto)).resolves.toEqual(movie);
    expect(moviesRepository.create).toHaveBeenCalledWith({
      title: dto.title,
      genre: dto.genre,
      releaseYear: dto.releaseYear,
      director,
    });
  });

  it('rejects creating a movie when its director is missing', async () => {
    directorsRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.create({
        title: movie.title,
        genre: movie.genre,
        releaseYear: movie.releaseYear,
        directorId: director.id,
      }),
    ).rejects.toThrow(new BadRequestException('Director not found'));
  });

  it('finds a movie with its director', async () => {
    moviesRepository.findOne.mockResolvedValue(movie);

    await expect(service.findOne(movie.id)).resolves.toEqual(movie);
    expect(moviesRepository.findOne).toHaveBeenCalledWith({
      where: { id: movie.id },
      relations: { director: true },
    });
  });

  it('throws when a movie does not exist', async () => {
    moviesRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      new NotFoundException('Movie not found'),
    );
  });

  it('changes the movie director when directorId is provided', async () => {
    const newDirector = {
      id: 'new-director-id',
      name: 'Greta Gerwig',
    } as Director;
    moviesRepository.findOne.mockResolvedValue(movie);
    directorsRepository.findOneBy.mockResolvedValue(newDirector);
    moviesRepository.save.mockResolvedValue({
      ...movie,
      director: newDirector,
      title: 'Barbie',
    });

    await expect(
      service.update(movie.id, { title: 'Barbie', directorId: newDirector.id }),
    ).resolves.toEqual({ ...movie, director: newDirector, title: 'Barbie' });
    expect(directorsRepository.findOneBy).toHaveBeenCalledWith({
      id: newDirector.id,
    });
  });

  it('updates movie fields without looking up a director when directorId is omitted', async () => {
    moviesRepository.findOne.mockResolvedValue(movie);
    moviesRepository.save.mockResolvedValue({ ...movie, genre: 'Thriller' });

    await expect(
      service.update(movie.id, { genre: 'Thriller' }),
    ).resolves.toEqual({
      ...movie,
      genre: 'Thriller',
    });
    expect(directorsRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('removes an existing movie', async () => {
    moviesRepository.findOne.mockResolvedValue(movie);
    moviesRepository.remove.mockResolvedValue(movie);

    await expect(service.remove(movie.id)).resolves.toEqual(movie);
    expect(moviesRepository.remove).toHaveBeenCalledWith(movie);
  });

  it('applies movie filters and pagination in findAll', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[movie], 1]),
    };
    moviesRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      service.findAll({
        name: 'inception',
        genre: 'science',
        yearFrom: 2000,
        yearTo: 2020,
        page: 3,
        limit: 4,
      }),
    ).resolves.toEqual({ data: [movie], total: 1, page: 3, limit: 4 });
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(4);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'movie.releaseYear',
      'DESC',
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(8);
    expect(queryBuilder.take).toHaveBeenCalledWith(4);
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
    moviesRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.findAll({ page: 1, limit: 10 })).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
  });
});
