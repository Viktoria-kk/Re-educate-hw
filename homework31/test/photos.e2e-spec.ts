import '../src/movies/entities/movie.entity';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import request from 'supertest';
import type { Server } from 'node:http';
import { MoviesModule } from '../src/movies/movies.module';
import { DirectorsModule } from '../src/directors/directors.module';
import { Movie } from '../src/movies/entities/movie.entity';
import { Director } from '../src/directors/entities/director.entity';
import { AwsStorageService } from '../src/photos/aws-storage.service';
import { PhotoCleanup } from '../src/photos/photo-cleanup.entity';
import { PhotoCleanupService } from '../src/photos/photo-cleanup.service';
import type { Photo } from '../src/photos/photo';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=',
  'base64',
);
type MovieResponse = Movie & { photos: (Photo & { url: string })[] };
type DirectorResponse = Director & { profilePhoto: Photo & { url: string } };

describe('Photo API with real SQL and mocked AWS', () => {
  let app: INestApplication;
  let server: Server;
  let db: DataSource;
  let cleanup: PhotoCleanupService;
  let directorId: string;
  let movieId: string;
  const objects = new Map<string, Buffer>();
  const storage = {
    url: (key: string) => `https://test.cloudfront.net/${key}`,
    upload: jest.fn<(photo: Photo, buffer: Buffer) => Promise<void>>(),
    deleteObject: jest.fn<(key: string) => Promise<void>>(),
    invalidate: jest.fn<(key: string) => Promise<void>>(),
  };

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
      .useValue(storage)
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
    db = app.get(DataSource);
    cleanup = app.get(PhotoCleanupService);
    await cleanup.flush();
    // Deterministic retries in tests; production uses the 30-second timer.
    await cleanup.onModuleDestroy();
    if (db.options.type === 'sqljs') await db.query('PRAGMA foreign_keys = ON');
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    storage.upload.mockReset().mockImplementation((photo, buffer) => {
      objects.set(photo.key, buffer);
      return Promise.resolve();
    });
    storage.deleteObject.mockReset().mockImplementation((key) => {
      objects.delete(key);
      return Promise.resolve();
    });
    storage.invalidate.mockReset().mockResolvedValue(undefined);
    objects.clear();
    await db.createQueryBuilder().delete().from(Movie).execute();
    await db.createQueryBuilder().delete().from(Director).execute();
    await db.createQueryBuilder().delete().from(PhotoCleanup).execute();
    const director = await request(server)
      .post('/directors')
      .send({ name: 'Director', nationality: 'Georgian', birthYear: 1980 })
      .expect(201);
    directorId = (director.body as Director).id;
    const movie = await request(server)
      .post('/movies')
      .send({
        name: 'Movie',
        genre: 'drama',
        year: 2020,
        description: 'Test',
        director: directorId,
      })
      .expect(201);
    movieId = (movie.body as Movie).id;
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await app?.close();
  });

  const profile = () =>
    request(server)
      .post(`/directors/${directorId}/photo`)
      .attach('photo', png, 'profile.png');
  const single = (id = movieId) =>
    request(server)
      .post(`/movies/${id}/photo`)
      .attach('photo', png, 'poster.png');

  it('uploads and replaces the single director profile photo and returns CDN URLs in GET responses', async () => {
    const first = (await profile().expect(201)).body as DirectorResponse;
    expect(first.profilePhoto.url).toBe(storage.url(first.profilePhoto.key));
    expect(objects.get(first.profilePhoto.key)).toEqual(png);
    const second = (await profile().expect(201)).body as DirectorResponse;
    expect(second.profilePhoto.id).not.toBe(first.profilePhoto.id);
    expect(objects.has(first.profilePhoto.key)).toBe(false);
    expect(storage.invalidate).toHaveBeenCalledWith(first.profilePhoto.key);
    const result = await request(server)
      .get(`/directors/${directorId}`)
      .expect(200);
    expect((result.body as DirectorResponse).profilePhoto).toEqual(
      second.profilePhoto,
    );
  });

  it('appends one and multiple movie images and serializes nested galleries', async () => {
    await single().expect(201);
    const response = await request(server)
      .post(`/movies/${movieId}/photos`)
      .attach('photos', png, 'a.png')
      .attach('photos', png, 'b.png')
      .expect(201);
    const movie = response.body as MovieResponse;
    expect(movie.photos).toHaveLength(3);
    expect(new Set(movie.photos.map((photo) => photo.key)).size).toBe(3);
    expect(
      movie.photos.every((photo) => photo.url === storage.url(photo.key)),
    ).toBe(true);
    const director = (
      await request(server).get(`/directors/${directorId}`).expect(200)
    ).body as Director;
    expect(director.films[0].photos).toEqual(movie.photos);
    const list = await request(server).get('/movies').expect(200);
    expect((list.body as { data: MovieResponse[] }).data[0].photos).toEqual(
      movie.photos,
    );
  });

  it('deletes individual photos and keeps the owner', async () => {
    await profile().expect(201);
    await request(server).delete(`/directors/${directorId}/photo`).expect(200);
    await request(server).delete(`/directors/${directorId}/photo`).expect(404);
    const movie = (await single().expect(201)).body as MovieResponse;
    const key = movie.photos[0].key;
    const response = await request(server)
      .delete(`/movies/${movieId}/photos/${movie.photos[0].id}`)
      .expect(200);
    expect((response.body as MovieResponse).photos).toEqual([]);
    expect(storage.invalidate).toHaveBeenCalledWith(key);
    expect(objects.size).toBe(0);
    await request(server).get(`/movies/${movieId}`).expect(200);
  });

  it('rejects deleting a photo through a different movie', async () => {
    const photo = ((await single().expect(201)).body as MovieResponse)
      .photos[0];
    const other = await db.getRepository(Movie).save({
      name: 'Other',
      genre: 'drama',
      year: 2020,
      description: 'Test',
      director: { id: directorId },
    });
    await request(server)
      .delete(`/movies/${other.id}/photos/${photo.id}`)
      .expect(404);
    expect(objects.has(photo.key)).toBe(true);
  });

  it('cleans up all gallery photos when a movie is deleted', async () => {
    await single().expect(201);
    await request(server).delete(`/movies/${movieId}`).expect(200);
    expect(objects.size).toBe(0);
    expect(storage.invalidate).toHaveBeenCalledTimes(1);
    await request(server).get(`/directors/${directorId}`).expect(200);
  });

  it('cleans up the profile and every movie gallery when a director is deleted', async () => {
    await profile().expect(201);
    await single().expect(201);
    await single().expect(201);
    await request(server).delete(`/directors/${directorId}`).expect(200);
    expect(objects.size).toBe(0);
    expect(storage.invalidate).toHaveBeenCalledTimes(3);
    await request(server).get(`/movies/${movieId}`).expect(404);
    expect(await db.getRepository(PhotoCleanup).count()).toBe(0);
  });

  it.each(['/movies/:id/photo', '/movies/:id/photos', '/directors/:id/photo'])(
    'rejects missing files: %s',
    async (route) => {
      await request(server)
        .post(
          route.replace(
            ':id',
            route.startsWith('/movies') ? movieId : directorId,
          ),
        )
        .expect(400);
      expect(storage.upload).not.toHaveBeenCalled();
    },
  );

  it('rejects fake image contents, mismatched MIME, unsupported formats and wrong fields', async () => {
    await request(server)
      .post(`/movies/${movieId}/photo`)
      .attach('photo', Buffer.from('not an image'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
      .expect(400);
    await request(server)
      .post(`/movies/${movieId}/photo`)
      .attach('photo', png, { filename: 'fake.jpg', contentType: 'image/jpeg' })
      .expect(400);
    await request(server)
      .post(`/movies/${movieId}/photo`)
      .attach('photo', Buffer.from('<svg/>'), 'fake.svg')
      .expect(400);
    await request(server)
      .post(`/movies/${movieId}/photo`)
      .attach('wrong', png, 'a.png')
      .expect(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects files over 5 MiB and too many files', async () => {
    await request(server)
      .post(`/movies/${movieId}/photo`)
      .attach('photo', Buffer.alloc(5 * 1024 * 1024 + 1), 'large.png')
      .expect(413);
    let upload = request(server).post(`/movies/${movieId}/photos`);
    for (let index = 0; index < 11; index++)
      upload = upload.attach('photos', png, `${index}.png`);
    await upload.expect(400);
    await request(server)
      .post(`/directors/${directorId}/photo`)
      .attach('photo', png, 'a.png')
      .attach('photo', png, 'b.png')
      .expect(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('enforces the 10-photo total across separate requests', async () => {
    let upload = request(server).post(`/movies/${movieId}/photos`);
    for (let index = 0; index < 10; index++)
      upload = upload.attach('photos', png, `${index}.png`);
    await upload.expect(201);
    await single().expect(400);
    expect(objects.size).toBe(10);
  });

  it('validates the entire batch before uploading anything', async () => {
    await request(server)
      .post(`/movies/${movieId}/photos`)
      .attach('photos', png, 'good.png')
      .attach('photos', Buffer.from('fake'), 'fake.png')
      .expect(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('checks owner existence and UUIDs before uploading', async () => {
    await single('123e4567-e89b-42d3-a456-426614174000').expect(404);
    await single('invalid').expect(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rolls back a partially uploaded batch and preserves existing photos', async () => {
    const existing = ((await single().expect(201)).body as MovieResponse)
      .photos;
    storage.upload
      .mockImplementationOnce((photo, buffer) => {
        objects.set(photo.key, buffer);
        return Promise.resolve();
      })
      .mockRejectedValueOnce(new Error('S3 unavailable'));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    await request(server)
      .post(`/movies/${movieId}/photos`)
      .attach('photos', png, 'a.png')
      .attach('photos', png, 'b.png')
      .expect(500);
    const saved = (await request(server).get(`/movies/${movieId}`).expect(200))
      .body as MovieResponse;
    expect(saved.photos).toEqual(existing);
    expect(objects.size).toBe(1);
    expect(storage.deleteObject).toHaveBeenCalledTimes(2);
  });

  it('preserves the previous profile when a replacement fails', async () => {
    const original = ((await profile().expect(201)).body as DirectorResponse)
      .profilePhoto;
    storage.upload.mockRejectedValueOnce(new Error('S3 unavailable'));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    await profile().expect(500);
    const saved = (
      await request(server).get(`/directors/${directorId}`).expect(200)
    ).body as DirectorResponse;
    expect(saved.profilePhoto).toEqual(original);
    expect(objects.has(original.key)).toBe(true);
  });

  it('cleans uploaded objects when saving photo metadata fails', async () => {
    jest
      .spyOn(EntityManager.prototype, 'save')
      .mockRejectedValueOnce(new Error('Database write failed'));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    await single().expect(500);
    expect(objects.size).toBe(0);
    const movie = await db
      .getRepository(Movie)
      .findOneByOrFail({ id: movieId });
    expect(movie.photos).toBeNull();
  });

  it('retains cleanup jobs after S3 failure and retries them after owner deletion', async () => {
    await single().expect(201);
    storage.deleteObject.mockRejectedValueOnce(new Error('AccessDenied'));
    await request(server).delete(`/directors/${directorId}`).expect(200);
    expect(await db.getRepository(PhotoCleanup).count()).toBe(1);
    expect(objects.size).toBe(1);
    await cleanup.flush();
    expect(objects.size).toBe(0);
    expect(await db.getRepository(PhotoCleanup).count()).toBe(0);
  });

  it('retries invalidation without repeating S3 deletion', async () => {
    await profile().expect(201);
    storage.invalidate.mockRejectedValueOnce(new Error('AccessDenied'));
    await request(server).delete(`/directors/${directorId}/photo`).expect(200);
    expect(await db.getRepository(PhotoCleanup).find()).toEqual([
      expect.objectContaining({ objectDeleted: true }),
    ]);
    await cleanup.flush();
    expect(storage.deleteObject).toHaveBeenCalledTimes(1);
    expect(storage.invalidate).toHaveBeenCalledTimes(2);
    expect(await db.getRepository(PhotoCleanup).count()).toBe(0);
  });
});
