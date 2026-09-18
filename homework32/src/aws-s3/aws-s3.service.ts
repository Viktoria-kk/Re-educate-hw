import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class AwsS3Service {
  private readonly bucketName: string;
  private readonly cloudFrontUrl: string;
  private readonly cloudFrontDistributionId: string;
  private readonly s3Client: S3Client;
  private readonly cloudFrontClient: CloudFrontClient;

  constructor() {
    this.bucketName = this.getRequiredConfig('AWS_BUCKET_NAME');
    const region = this.getRequiredConfig('AWS_REGION');
    const cloudFrontDomain = this.getRequiredConfig('AWS_CLOUDFRONT_DOMAIN');
    this.cloudFrontDistributionId = this.getRequiredConfig(
      'AWS_CLOUDFRONT_DISTRIBUTION_ID',
    );
    const credentials = {
      accessKeyId: this.getRequiredConfig('AWS_ACCESS_KEY'),
      secretAccessKey: this.getRequiredConfig('AWS_SECRET_ACCESS_KEY'),
    };

    this.cloudFrontUrl = `https://${cloudFrontDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
    this.s3Client = new S3Client({
      region,
      credentials,
    });
    this.cloudFrontClient = new CloudFrontClient({
      region: 'us-east-1',
      credentials,
    });
  }

  async uploadFile(key: string, file: Express.Multer.File) {
    this.ensureImage(file);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return key;
  }

  async deleteFile(key: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
    await this.cloudFrontClient.send(
      new CreateInvalidationCommand({
        DistributionId: this.cloudFrontDistributionId,
        InvalidationBatch: {
          CallerReference: randomUUID(),
          Paths: { Quantity: 1, Items: [`/${key}`] },
        },
      }),
    );
  }

  getPublicUrl(key: string) {
    return `${this.cloudFrontUrl}/${key}`;
  }

  private ensureImage(file: Express.Multer.File | undefined) {
    if (!file?.buffer) {
      throw new BadRequestException('An image file is required');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }
  }

  private getRequiredConfig(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`${key} must be configured`);
    }
    return value;
  }
}
