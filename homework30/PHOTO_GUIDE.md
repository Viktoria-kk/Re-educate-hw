# Homework 30 — S3 photos and CloudFront

This homework adapts user profile photos to **directors** and product photos to **movies**. It extends homework29; the original homework29 folder is unchanged. The API still has no login or authentication. These endpoints act on director/movie IDs, so they do not represent logged-in user ownership checks.

## What was added

- A director has one `profilePhoto`, initially `null`. Uploading another photo replaces it.
- A movie has a `photos` gallery, initially `null` for records without uploads and `[]` after all photos have been removed. Both single and batch uploads append photos. Maximum: **10 photos total per movie**.
- Images live in the private S3 bucket. MySQL stores photo IDs, S3 keys, detected content types and sizes, not image bytes or base64.
- API responses add a `url` to each photo, including nested movie/director responses and paginated lists. These URLs use your CloudFront distribution.
- Deleting individual photos or their owner records queues S3 deletion and CloudFront invalidation. Director deletion also handles images from every movie removed by the existing database cascade.
- Existing JSON CRUD routes, relationships, filtering and pagination continue to work. Create the record with JSON first, then upload photos through the new multipart routes.

## Run

Use Node.js **22 or newer**. Dependencies are already installed in this copy.

```powershell
cd C:\Users\V\Desktop\Re-educate-hw\homework30
npm install
npm run start:dev
```

Keep your MySQL server running. The copied `.env` retains the existing MySQL connection. With `SQL_SYNC=true`, starting homework30 adds nullable photo columns to `movies` and `directors`, and creates `photo_cleanup` in that configured database. It therefore shares data with the earlier homework unless you create another database and change `SQL_DATABASE`. Existing records remain valid. Schema synchronization is intended for local homework development.

Required AWS values:

```dotenv
AWS_ACCESS_KEY=your_iam_access_key_id
AWS_SECRET_ACCESS_KEY=your_iam_secret_access_key
AWS_REGION=eu-central-1
AWS_BUCKET_NAME=gita-backend-homework-30
AWS_CLOUDFRONT_URL=https://d1yhpsg8tsfmvb.cloudfront.net
AWS_CLOUDFRONT_DISTRIBUTION_ID=E3RWSOCT0YBDO2
```

`.env` is ignored by Git. Do not put real credentials in `.env.example`. The backend also accepts the standard `AWS_ACCESS_KEY_ID` name and optional `AWS_SESSION_TOKEN`. If both explicit key values are absent, the AWS SDK can use its default credential chain. Required bucket/region/CloudFront settings are checked at startup.

## Upload routes

| Method | Route | Multipart file field | Result |
| --- | --- | --- | --- |
| POST | `/directors/:id/photo` | `photo` — one file | Upload or replace profile photo |
| DELETE | `/directors/:id/photo` | No body | Remove profile photo |
| POST | `/movies/:id/photo` | `photo` — one file | Append one gallery image |
| POST | `/movies/:id/photos` | `photos` — repeated field | Append several gallery images |
| DELETE | `/movies/:id/photos/:photoId` | No body | Remove one image belonging to this movie |

Upload/delete-photo responses contain the updated owner record. Use the normal GET endpoints to retrieve full movie/director relationships. Uploads return HTTP 201; successful deletes return 200.

In Postman, choose **Body → form-data**, enter the field name above, switch its type from Text to **File**, and select the image. For batch upload, repeat the `photos` field. Let Postman set `Content-Type` with its multipart boundary. Do not send movie/director metadata to these photo-only routes.

PowerShell examples (replace IDs and local file paths):

```powershell
curl.exe -X POST "http://localhost:3000/directors/DIRECTOR_ID/photo" -F "photo=@C:/images/profile.png"
curl.exe -X POST "http://localhost:3000/movies/MOVIE_ID/photo" -F "photo=@C:/images/poster.jpg"
curl.exe -X POST "http://localhost:3000/movies/MOVIE_ID/photos" -F "photos=@C:/images/scene1.jpg" -F "photos=@C:/images/scene2.png"
curl.exe -X DELETE "http://localhost:3000/movies/MOVIE_ID/photos/PHOTO_ID"
curl.exe -X DELETE "http://localhost:3000/directors/DIRECTOR_ID/photo"
```

Example photo metadata returned inside `profilePhoto` or the `photos` array:

```json
{
  "id": "a-generated-uuid",
  "key": "images/movies/MOVIE_ID/a-generated-uuid.png",
  "contentType": "image/png",
  "size": 18432,
  "url": "https://d1yhpsg8tsfmvb.cloudfront.net/images/movies/MOVIE_ID/a-generated-uuid.png"
}
```

Use `id` in the delete route, and `url` in an image element or browser. Storage keys use server-generated UUIDs and detected extensions; filenames supplied by clients do not control S3 paths.

## Validation and errors

- JPEG, PNG and WebP only; file signatures must match the declared MIME type.
- Maximum **5 MiB (5,242,880 bytes) per image**. Multer rejects oversized uploads with 413.
- Missing/empty files, fake image contents, unsupported types, wrong file fields, extra text fields and too many photos return 400.
- IDs must be UUIDs. Unknown owners and photos return 404.
- A photo can only be deleted through the movie it belongs to.
- A batch is validated before any file is uploaded. If an upload or database write fails, newly attempted objects are queued for cleanup and previously saved photos are preserved.
- AWS upload errors return a generic 503 instead of exposing SDK error details or credentials.

## AWS permissions

The bucket stays private with **Block all public access ON**, ACLs disabled and SSE-S3 encryption. Keep versioning disabled for this homework: with versioning enabled, ordinary `DeleteObject` leaves older versions behind.

Attach the following identity policy to IAM user `gita-backend-homework`. This is an **IAM user policy**, separate from the S3 bucket policy below.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::gita-backend-homework-30/images/*"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::821579665794:distribution/E3RWSOCT0YBDO2"
    }
  ]
}
```

CloudFront should use the regular S3 origin for this bucket, an empty origin path, Origin Access Control (OAC) with requests always signed, GET/HEAD methods, HTTPS redirect, and the CachingOptimized cache policy. There is no need for S3 website hosting or direct browser uploads to S3.

The distribution needs this **S3 bucket policy statement** to read images through OAC. If its generated policy already grants equivalent access, keep that policy rather than duplicating it. Merge with any unrelated existing statements.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontReadImages",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gita-backend-homework-30/images/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::821579665794:distribution/E3RWSOCT0YBDO2"
        }
      }
    }
  ]
}
```

Images are viewable by anyone with their CloudFront URL. OAC protects the S3 origin; it does not require viewers to log in.

## Deletion and retry behavior

Database changes and cleanup jobs are committed in the same SQL transaction. The worker then deletes each object from S3 and requests invalidation of its exact CloudFront path. Accepted invalidation removes the queued job; completion of invalidation at the edge is asynchronous.

If AWS is unavailable or permissions are missing, the API removes the photo reference immediately and the persistent cleanup job remains. It retries at startup and every 30 seconds while the backend is running. A saved `objectDeleted` flag prevents repeated S3 deletion when only invalidation is failing. Logs identify pending keys without printing credentials. You can inspect outstanding work with `SELECT * FROM photo_cleanup;`.

Uploads use unique keys, so replacements do not overwrite a cached old URL. Browser caching requires revalidation; CloudFront caching is allowed for one day. Previously downloaded copies cannot be remotely erased.

MySQL row locks serialize photo changes to the same owner. AWS and SQL are separate systems: a process crash during an upload, or simultaneous AWS and database failure before cleanup can be queued, can still leave an orphan object requiring manual cleanup. The queue covers normal request failures and retries; it is not a distributed transaction.

## Tests

```powershell
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run test:cov
npm run test:mysql
npm run test:aws
```

- Unit tests retain the original MoviesService and DirectorsService cases and add AWS command/configuration checks.
- API tests use a real SQL.js database and mocked AWS calls. They cover profile replacement, single/batch galleries, validation, photo ownership, deletion/cascade cleanup, failed batches, failed metadata writes and retry behavior.
- Coverage combines unit and API tests. The original services keep their 100% statement/line/function thresholds; the expanded suite also measures photo services, validation and URL serialization.
- `test:mysql` creates and drops only a uniquely named temporary database, exercising the real MySQL driver and row locks. It never uses the configured homework database for test writes.
- `test:aws` uses your real `.env` and AWS resources. It uploads one uniquely named temporary PNG under `images/self-check/`, reads it through S3 and CloudFront, then deletes it and requests invalidation. It does not change IAM, bucket settings or your distribution settings.

Verified on September 8, 2026: build and lint passed; the combined suite passed **83 tests**, with **98.04% statements/lines, 90.99% branches and 100% functions**. Both API suites also passed all **33 tests against a temporary MySQL database**.

AWS checks on September 8, 2026 confirmed S3 upload/read/delete, public CloudFront image delivery, and successful CloudFront invalidation submission after the IAM permission was added. The temporary S3 test image was deleted. Invalidation propagation at CloudFront edge locations is asynchronous.

## Main code

- `src/photos/aws-storage.service.ts`: SDK clients, upload/delete commands, CloudFront URLs and invalidation.
- `src/photos/photos.service.ts`: owner lookup, image metadata, uploads/replacement and transactional deletion.
- `src/photos/photo-cleanup.service.ts`: persistent cleanup queue and automatic retries.
- `src/photos/image-upload.ts`: upload limits and image signature validation.
- `src/photos/photos.interceptor.ts`: adds CloudFront URLs to returned photo metadata.
- Director/movie controllers: multipart endpoints; entities: nullable photo metadata columns.

References: [NestJS file uploads](https://docs.nestjs.com/techniques/file-upload), [CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html), [CloudFront invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html).
