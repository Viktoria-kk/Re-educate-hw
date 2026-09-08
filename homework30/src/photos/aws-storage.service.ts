import {
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { randomUUID } from 'node:crypto';
import type { Photo } from './photo';

@Injectable()
export class AwsStorageService implements OnModuleDestroy {
  private readonly s3: S3Client;
  private readonly cloudfront: CloudFrontClient;
  private readonly bucket: string;
  private readonly distribution: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.bucket = config.getOrThrow<string>('AWS_BUCKET_NAME');
    this.distribution = config.getOrThrow<string>(
      'AWS_CLOUDFRONT_DISTRIBUTION_ID',
    );
    const url = new URL(config.getOrThrow<string>('AWS_CLOUDFRONT_URL'));
    if (
      url.protocol !== 'https:' ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    ) {
      throw new Error(
        'AWS_CLOUDFRONT_URL must be an HTTPS origin without a path',
      );
    }
    this.baseUrl = url.origin;
    const accessKeyId =
      config.get<string>('AWS_ACCESS_KEY') ||
      config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
      throw new Error(
        'Provide both AWS access key values or use the default credential chain',
      );
    }
    const credentials =
      accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
            sessionToken: config.get<string>('AWS_SESSION_TOKEN'),
          }
        : undefined;
    const options = { credentials, maxAttempts: 3 };
    this.s3 = new S3Client({
      ...options,
      region: config.getOrThrow<string>('AWS_REGION'),
    });
    this.cloudfront = new CloudFrontClient({ ...options, region: 'us-east-1' });
  }

  url(key: string) {
    return `${this.baseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }

  async upload(photo: Photo, buffer: Buffer) {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: photo.key,
          Body: buffer,
          ContentType: photo.contentType,
          // Browsers revalidate; CloudFront can retain images for one day.
          CacheControl: 'public, max-age=0, s-maxage=86400, must-revalidate',
        }),
      );
    } catch {
      throw new ServiceUnavailableException(
        'Image upload failed; check AWS configuration and permissions',
      );
    }
  }

  async deleteObject(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async invalidate(key: string) {
    await this.cloudfront.send(
      new CreateInvalidationCommand({
        DistributionId: this.distribution,
        InvalidationBatch: {
          CallerReference: randomUUID(),
          Paths: { Quantity: 1, Items: [`/${key}`] },
        },
      }),
    );
  }

  onModuleDestroy() {
    this.s3.destroy();
    this.cloudfront.destroy();
  }
}
