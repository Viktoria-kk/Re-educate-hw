import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Movie } from '../movies/entities/movie.entity';
import { Director } from '../directors/entities/director.entity';
import { AwsStorageService } from './aws-storage.service';
import { PhotoCleanupService } from './photo-cleanup.service';
import { MAX_MOVIE_PHOTOS, validateImages } from './image-upload';
import type { Photo } from './photo';

@Injectable()
export class PhotosService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly storage: AwsStorageService,
    private readonly cleanup: PhotoCleanupService,
  ) {}

  private lock() {
    // SQL.js is used only by isolated tests and does not implement row locks.
    return this.dataSource.options.type === 'sqljs'
      ? undefined
      : { mode: 'pessimistic_write' as const };
  }

  private async director(manager: EntityManager, id: string) {
    const director = await manager.findOne(Director, {
      where: { id },
      lock: this.lock(),
    });
    if (!director) throw new NotFoundException('Director not found');
    return director;
  }

  private async movie(manager: EntityManager, id: string) {
    // Lock the parent first: director deletion uses the same lock order.
    const initial = await manager.findOne(Movie, {
      where: { id },
      relations: { director: true },
    });
    if (!initial) throw new NotFoundException('Movie not found');
    await this.director(manager, initial.director.id);
    const movie = await manager.findOne(Movie, {
      where: { id },
      lock: this.lock(),
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  private async upload(
    files: Express.Multer.File[],
    types: { mime: string; ext: string }[],
    prefix: string,
    attempted: string[],
  ) {
    const photos: Photo[] = [];
    for (let index = 0; index < files.length; index++) {
      const id = randomUUID();
      const photo = {
        id,
        key: `images/${prefix}/${id}.${types[index].ext}`,
        contentType: types[index].mime,
        size: files[index].buffer.length,
      };
      // Include ambiguous network failures: an upload may have reached S3.
      attempted.push(photo.key);
      await this.storage.upload(photo, files[index].buffer);
      photos.push(photo);
    }
    return photos;
  }

  async setDirectorPhoto(id: string, file: Express.Multer.File | undefined) {
    const files = file ? [file] : [];
    const types = await validateImages(files, 1);
    const attempted: string[] = [];
    let director: Director;
    try {
      director = await this.dataSource.transaction(async (manager) => {
        const owner = await this.director(manager, id);
        const [photo] = await this.upload(
          files,
          types,
          `directors/${id}`,
          attempted,
        );
        await this.cleanup.enqueue(
          manager,
          owner.profilePhoto ? [owner.profilePhoto.key] : [],
        );
        owner.profilePhoto = photo;
        return manager.save(owner);
      });
    } catch (error) {
      await this.cleanup.rollbackUploads(attempted);
      throw error;
    }
    await this.cleanup.flush();
    return director;
  }

  async addMoviePhotos(id: string, files: Express.Multer.File[] | undefined) {
    const types = await validateImages(files, MAX_MOVIE_PHOTOS);
    const attempted: string[] = [];
    let movie: Movie;
    try {
      movie = await this.dataSource.transaction(async (manager) => {
        const owner = await this.movie(manager, id);
        const existing = owner.photos ?? [];
        if (existing.length + files!.length > MAX_MOVIE_PHOTOS) {
          throw new BadRequestException(
            `A movie can have at most ${MAX_MOVIE_PHOTOS} photos`,
          );
        }
        const uploaded = await this.upload(
          files!,
          types,
          `movies/${id}`,
          attempted,
        );
        owner.photos = [...existing, ...uploaded];
        return manager.save(owner);
      });
    } catch (error) {
      await this.cleanup.rollbackUploads(attempted);
      throw error;
    }
    await this.cleanup.flush();
    return movie;
  }

  async deleteDirectorPhoto(id: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const director = await this.director(manager, id);
      if (!director.profilePhoto)
        throw new NotFoundException('Profile photo not found');
      await this.cleanup.enqueue(manager, [director.profilePhoto.key]);
      director.profilePhoto = null;
      return manager.save(director);
    });
    await this.cleanup.flush();
    return result;
  }

  async deleteMoviePhoto(id: string, photoId: string) {
    const result = await this.dataSource.transaction(async (manager) => {
      const movie = await this.movie(manager, id);
      const photo = movie.photos?.find((item) => item.id === photoId);
      if (!photo) throw new NotFoundException('Photo not found on this movie');
      await this.cleanup.enqueue(manager, [photo.key]);
      movie.photos = movie.photos!.filter((item) => item.id !== photoId);
      return manager.save(movie);
    });
    await this.cleanup.flush();
    return result;
  }

  async deleteMovie(id: string) {
    await this.dataSource.transaction(async (manager) => {
      const movie = await this.movie(manager, id);
      await this.cleanup.enqueue(
        manager,
        (movie.photos ?? []).map((photo) => photo.key),
      );
      await manager.delete(Movie, id);
    });
    await this.cleanup.flush();
  }

  async deleteDirector(id: string) {
    await this.dataSource.transaction(async (manager) => {
      const director = await this.director(manager, id);
      const query = manager
        .createQueryBuilder(Movie, 'movie')
        .where('movie.directorId = :id', { id });
      if (this.dataSource.options.type !== 'sqljs')
        query.setLock('pessimistic_write');
      const movies = await query.getMany();
      const keys = movies.flatMap((movie) =>
        (movie.photos ?? []).map((photo) => photo.key),
      );
      if (director.profilePhoto) keys.push(director.profilePhoto.key);
      await this.cleanup.enqueue(manager, keys);
      await manager.delete(Director, id);
    });
    await this.cleanup.flush();
  }
}
