import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { Server } from 'http';
import { MoviesModule } from '../src/movies/movies.module';
import { DirectorsModule } from '../src/directors/directors.module';
import { Director } from '../src/directors/entities/director.entity';
import { Movie } from '../src/movies/entities/movie.entity';
import { AwsStorageService } from '../src/photos/aws-storage.service';
import { PhotoCleanup } from '../src/photos/photo-cleanup.entity';

describe('Movies and directors API (SQL)', () => {
  let app: INestApplication;
  let server: Server;
  let directorId: string;
  let secondDirectorId: string;
  let movieId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...(process.env.TEST_MYSQL_DATABASE
            ? {
                type: 'mysql' as const,
                host: process.env.SQL_HOST,
                port: Number(process.env.SQL_PORT ?? 3306),
                username: process.env.SQL_USERNAME,
                password: process.env.SQL_PASSWORD,
                database: process.env.TEST_MYSQL_DATABASE,
              }
            : { type: 'sqljs' as const }),
          entities: [Movie, Director, PhotoCleanup],
          synchronize: true,
        }),
        MoviesModule,
        DirectorsModule,
      ],
    })
      .overrideProvider(AwsStorageService)
      .useValue({
        url: (key: string) => `https://test.cloudfront.net/${key}`,
        upload: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        deleteObject: jest
          .fn<() => Promise<void>>()
          .mockResolvedValue(undefined),
        invalidate: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
    if (!process.env.TEST_MYSQL_DATABASE) {
      await app.get(DataSource).query('PRAGMA foreign_keys = ON');
    }
    // The MySQL runner shares its temporary database between sequential suites.
    const db = app.get(DataSource);
    await db.createQueryBuilder().delete().from(Movie).execute();
    await db.createQueryBuilder().delete().from(Director).execute();
    await db.createQueryBuilder().delete().from(PhotoCleanup).execute();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('creates directors with empty films arrays and movies with director objects', async () => {
    const first = await request(server)
      .post('/directors')
      .send({ name: 'Todd Phillips', nationality: 'American', birthYear: 1970 })
      .expect(201);
    const firstBody = first.body as Director;
    directorId = firstBody.id;
    expect(firstBody.films).toEqual([]);
    const second = await request(server)
      .post('/directors')
      .send({ name: 'Zoe Smith', nationality: 'British', birthYear: 1980 })
      .expect(201);
    secondDirectorId = (second.body as Director).id;
    for (const movie of [
      { name: 'The Hangover', genre: 'comedy', year: 2009 },
      { name: 'The Hangover Part II', genre: 'comedy', year: 2011 },
      { name: 'Joker', genre: 'drama', year: 2019 },
    ]) {
      const response = await request(server)
        .post('/movies')
        .send({ ...movie, description: 'A film.', director: directorId })
        .expect(201);
      const body = response.body as Movie;
      expect(body.director.id).toBe(directorId);
      if (movie.year === 2009) movieId = body.id;
    }
  });

  it('combines movie filters and uses inclusive year bounds', async () => {
    const result = await request(server)
      .get('/movies?genre=COMEDY&yearFrom=2002&yearTo=2009&name=hang')
      .expect(200);
    expect(result.body).toMatchObject({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      data: [{ id: movieId, director: { id: directorId } }],
    });
  });

  it('paginates both resources without truncating a director films array', async () => {
    const movies = await request(server)
      .get('/movies?page=2&limit=2')
      .expect(200);
    expect(movies.body).toMatchObject({ total: 3, page: 2, totalPages: 2 });
    expect((movies.body as { data: Movie[] }).data).toHaveLength(1);
    const directors = await request(server)
      .get('/directors?page=1&limit=1')
      .expect(200);
    expect(directors.body).toMatchObject({ total: 2, totalPages: 2 });
    const data = (directors.body as { data: Director[] }).data;
    expect(data).toHaveLength(1);
    expect(data[0].films).toHaveLength(3);
    const empty = await request(server).get('/movies?page=10').expect(200);
    expect(empty.body).toMatchObject({ data: [], total: 3 });
  });

  it('combines director filters', async () => {
    const result = await request(server)
      .get(
        '/directors?name=tod&nationality=american&birthYearFrom=1970&birthYearTo=1970',
      )
      .expect(200);
    expect(result.body).toMatchObject({ total: 1, data: [{ id: directorId }] });
    await request(server).get(`/directors/${directorId}`).expect(200);
    await request(server).get(`/movies/${movieId}`).expect(200);
  });

  it.each([
    '/movies?page=0',
    '/movies?limit=101',
    '/movies?page=abc',
    '/movies?yearFrom=2010&yearTo=2000',
    '/directors?birthYearFrom=2000&birthYearTo=1900',
    '/directors?limit=-1',
    '/movies/not-a-uuid',
  ])('rejects invalid query or ID: %s', async (url) => {
    await request(server).get(url).expect(400);
  });

  it('rejects invalid bodies and nonexistent directors', async () => {
    await request(server)
      .post('/directors')
      .send({ name: 'Missing fields' })
      .expect(400);
    await request(server)
      .patch(`/movies/${movieId}`)
      .send({ year: null })
      .expect(400);
    await request(server)
      .post('/movies')
      .send({
        name: 'Test',
        genre: 'comedy',
        year: 2009,
        description: 'Test',
        director: '123e4567-e89b-42d3-a456-426614174000',
      })
      .expect(400);
  });

  it('updates records and moves the film to a different director', async () => {
    const movie = await request(server)
      .patch(`/movies/${movieId}`)
      .send({ name: 'Renamed', director: secondDirectorId })
      .expect(200);
    expect(movie.body).toMatchObject({
      name: 'Renamed',
      director: { id: secondDirectorId },
    });
    const oldDirector = await request(server)
      .get(`/directors/${directorId}`)
      .expect(200);
    expect((oldDirector.body as Director).films).toHaveLength(2);
    const updated = await request(server)
      .patch(`/directors/${secondDirectorId}`)
      .send({ nationality: 'Georgian' })
      .expect(200);
    expect(updated.body).toMatchObject({
      nationality: 'Georgian',
      films: [{ id: movieId }],
    });
  });

  it('deletes movies and cascades director deletion, returning 404 afterwards', async () => {
    await request(server).delete(`/movies/${movieId}`).expect(200);
    await request(server).get(`/movies/${movieId}`).expect(404);
    await request(server)
      .patch(`/movies/${movieId}`)
      .send({ name: 'Gone' })
      .expect(404);
    await request(server).delete(`/movies/${movieId}`).expect(404);
    await request(server).delete(`/directors/${directorId}`).expect(200);
    await request(server).get(`/directors/${directorId}`).expect(404);
    await request(server).delete(`/directors/${directorId}`).expect(404);
    const movies = await request(server).get('/movies').expect(200);
    expect(movies.body).toMatchObject({ data: [], total: 0 });
  });
});
