import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { fileTypeFromBuffer } from 'file-type';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_MOVIE_PHOTOS = 10;
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function imageUploadOptions(files: number): MulterOptions {
  return {
    limits: { fileSize: MAX_IMAGE_SIZE, files, fields: 0, parts: files + 1 },
    fileFilter: (_request, file, callback) => {
      if (!imageTypes.has(file.mimetype)) {
        return callback(
          new BadRequestException('Only JPEG, PNG and WebP images are allowed'),
          false,
        );
      }
      callback(null, true);
    },
  };
}

export async function validateImages(
  files: Express.Multer.File[] | undefined,
  max: number,
) {
  if (!files?.length || files.length > max) {
    throw new BadRequestException(`Provide between 1 and ${max} images`);
  }
  const types: { mime: string; ext: string }[] = [];
  for (const file of files) {
    if (!file.buffer?.length || file.buffer.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        'Each image must be nonempty and at most 5 MiB',
      );
    }
    const type = await fileTypeFromBuffer(file.buffer).catch(() => undefined);
    if (!type || !imageTypes.has(type.mime) || type.mime !== file.mimetype) {
      throw new BadRequestException(
        'File contents must match a JPEG, PNG or WebP image',
      );
    }
    types.push(type);
  }
  return types;
}
