import { loadEnvFile } from 'node:process';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

loadEnvFile('.env');
const key = `images/self-check/${randomUUID()}.png`;
const bucket = process.env.AWS_BUCKET_NAME;
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};
const s3 = new S3Client({ region: process.env.AWS_REGION, credentials, maxAttempts: 2 });
const cdn = new CloudFrontClient({ region: 'us-east-1', credentials, maxAttempts: 2 });
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=', 'base64');
let attempted = false;
try {
  attempted = true;
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: png, ContentType: 'image/png', CacheControl: 'public, max-age=0, s-maxage=60, must-revalidate' }));
  console.log('PASS: S3 upload');
  const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!Buffer.from(await result.Body.transformToByteArray()).equals(png)) throw new Error('S3 response differs from the test image');
  console.log('PASS: S3 read');
  const response = await fetch(`${process.env.AWS_CLOUDFRONT_URL.replace(/\/$/, '')}/${key}`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`CloudFront returned HTTP ${response.status}; check OAC, the bucket policy, origin and deployment status`);
  if (!Buffer.from(await response.arrayBuffer()).equals(png)) throw new Error('CloudFront response differs from the test image');
  console.log('PASS: public CloudFront image delivery');
} catch (error) {
  console.error(`FAIL: ${error.name}: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (attempted) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      console.log('PASS: temporary S3 image deleted');
      await cdn.send(new CreateInvalidationCommand({
        DistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: { CallerReference: randomUUID(), Paths: { Quantity: 1, Items: [`/${key}`] } },
      }));
      console.log('PASS: CloudFront invalidation accepted (propagation is asynchronous)');
    } catch (error) {
      console.error(`Cleanup failed for ${key}: ${error.name}: ${error.message}`);
      process.exitCode = 1;
    }
  }
  s3.destroy();
  cdn.destroy();
}
