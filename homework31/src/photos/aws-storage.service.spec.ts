import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { AwsStorageService } from './aws-storage.service';

describe('AwsStorageService', () => {
  let storage: AwsStorageService | undefined;
  const values = {
    AWS_BUCKET_NAME: 'test-bucket',
    AWS_REGION: 'eu-central-1',
    AWS_CLOUDFRONT_URL: 'https://test.cloudfront.net',
    AWS_CLOUDFRONT_DISTRIBUTION_ID: 'EXAMPLE',
    AWS_ACCESS_KEY: 'test-access-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret',
  };
  const config = (overrides: Record<string, string | undefined> = {}) => {
    const data: Record<string, string | undefined> = {
      ...values,
      ...overrides,
    };
    return {
      get: (key: string) => data[key],
      getOrThrow: (key: string) => {
        if (!data[key]) throw new Error(`Missing ${key}`);
        return data[key];
      },
    } as unknown as ConfigService;
  };
  beforeEach(() => {
    jest.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never);
    jest
      .spyOn(CloudFrontClient.prototype, 'send')
      .mockResolvedValue({} as never);
    storage = new AwsStorageService(config());
  });
  afterEach(() => {
    storage?.onModuleDestroy();
    jest.restoreAllMocks();
  });

  it('uploads to the configured private bucket with content type and cache headers', async () => {
    const photo = {
      id: 'id',
      key: 'images/test.png',
      contentType: 'image/png',
      size: 3,
    };
    const buffer = Buffer.from('png');
    await storage!.upload(photo, buffer);
    const command = jest.spyOn(S3Client.prototype, 'send').mock
      .calls[0][0] as PutObjectCommand;
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toEqual({
      Bucket: 'test-bucket',
      Key: photo.key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=0, s-maxage=86400, must-revalidate',
    });
    expect(command.input.ACL).toBeUndefined();
  });
  it('maps upload failures to a safe 503 without exposing credentials', async () => {
    jest
      .spyOn(S3Client.prototype, 'send')
      .mockRejectedValueOnce(new Error('private error'));
    await expect(
      storage!.upload(
        { id: 'id', key: 'images/x.png', size: 1, contentType: 'image/png' },
        Buffer.from('x'),
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });
  it('deletes the exact object and invalidates the exact CloudFront path', async () => {
    await storage!.deleteObject('images/x.png');
    await storage!.invalidate('images/x.png');
    const deletion = jest.spyOn(S3Client.prototype, 'send').mock
      .calls[0][0] as DeleteObjectCommand;
    expect(deletion).toBeInstanceOf(DeleteObjectCommand);
    expect(deletion.input).toEqual({
      Bucket: 'test-bucket',
      Key: 'images/x.png',
    });
    const invalidation = jest.spyOn(CloudFrontClient.prototype, 'send').mock
      .calls[0][0] as CreateInvalidationCommand;
    expect(invalidation).toBeInstanceOf(CreateInvalidationCommand);
    expect(invalidation.input).toEqual({
      DistributionId: 'EXAMPLE',
      InvalidationBatch: {
        CallerReference: expect.any(String),
        Paths: { Quantity: 1, Items: ['/images/x.png'] },
      },
    });
  });
  it('escapes path segments in public image URLs', () => {
    expect(storage!.url('images/a b.png')).toBe(
      'https://test.cloudfront.net/images/a%20b.png',
    );
  });
  it.each([
    'http://test.cloudfront.net',
    'https://test.cloudfront.net/images',
    'https://test.cloudfront.net/?x=1',
    'https://test.cloudfront.net/#x',
    'https://user:password@test.cloudfront.net',
  ])('rejects malformed CDN origins: %s', (url) => {
    expect(
      () => new AwsStorageService(config({ AWS_CLOUDFRONT_URL: url })),
    ).toThrow('HTTPS origin');
  });
  it('requires the bucket setting and matching credential values', () => {
    expect(
      () => new AwsStorageService(config({ AWS_BUCKET_NAME: undefined })),
    ).toThrow('Missing AWS_BUCKET_NAME');
    expect(
      () => new AwsStorageService(config({ AWS_SECRET_ACCESS_KEY: undefined })),
    ).toThrow('both AWS access key');
  });
  it('supports the default AWS credential chain and standard access key variable', () => {
    const defaultChain = new AwsStorageService(
      config({ AWS_ACCESS_KEY: undefined, AWS_SECRET_ACCESS_KEY: undefined }),
    );
    defaultChain.onModuleDestroy();
    const standard = new AwsStorageService(
      config({ AWS_ACCESS_KEY: undefined, AWS_ACCESS_KEY_ID: 'standard-key' }),
    );
    standard.onModuleDestroy();
  });
});
