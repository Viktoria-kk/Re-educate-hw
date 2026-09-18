# Homework 32 — Authentication, OTP, and Email

The previous Movies/Directors API extended with TypeORM users, JWT authentication,
email verification by OTP, and transactional emails through Nodemailer.

## Setup

1. In MySQL Workbench, create the database:

   ```sql
   CREATE DATABASE movies_db;
   ```

2. Copy `.env.example` to `.env` and replace `DB_PASSWORD` with your MySQL password. If your MySQL user or database has a different name, update the relevant fields too.
3. Configure AWS credentials, bucket name, region, and `AWS_CLOUDFRONT_DOMAIN` in `.env`. The S3 bucket should remain private and be accessible through the CloudFront origin access control.
4. Configure `JWT_SECRET` and the `EMAIL_*` SMTP settings. For Gmail, use an App Password in `EMAIL_PASS`, not the regular Google password.
5. Start the project:

   ```bash
   npm run start:dev
   ```

`DB_SYNCHRONIZE=true` makes TypeORM create the `directors`, `movies`, and `users` tables automatically during development.

## Authentication and email flow

- `POST /auth/sign-up` creates an unverified user and emails a six-digit OTP. The OTP expires after five minutes and only its SHA-256 hash is stored.
- `POST /auth/verify` verifies the OTP, returns a one-hour JWT, and sends the Welcome email.
- `POST /auth/resend-verification` sends a new OTP after the previous code has expired.
- `POST /auth/sign-in` returns a one-hour JWT for an active, verified user.
- `GET /users/me` returns the authenticated user. Send the token as `Authorization: Bearer <token>`.
- `DELETE /users/me` soft-deactivates the authenticated account and sends a deactivation email.

Example sign-up body:

```json
{
  "email": "user@example.com",
  "fullName": "Test User",
  "password": "password123"
}
```

Example verification body:

```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```

## Swagger documentation

After starting the application, open [http://localhost:3000/api](http://localhost:3000/api) for the interactive Swagger UI. The OpenAPI contract is maintained in YAML at `src/swagger/swagger.yaml` and served at [http://localhost:3000/swagger/swagger.yaml](http://localhost:3000/swagger/swagger.yaml).

## Endpoints

### Directors

- `POST /directors`
- `GET /directors?page=1&limit=10&name=christopher&nationality=british&birthYearFrom=1950&birthYearTo=1980`
- `GET /directors/:id`
- `PATCH /directors/:id`
- `DELETE /directors/:id`

Create a director:

```json
{
  "name": "Christopher Nolan",
  "birthYear": 1970,
  "nationality": "British"
}
```

### Movies

- `POST /movies`
- `GET /movies?page=1&limit=10&genre=comedy&yearFrom=2002&yearTo=2010&name=hang`
- `GET /movies/:id`
- `PATCH /movies/:id`
- `DELETE /movies/:id`

Create a movie using the director UUID returned from `POST /directors`:

```json
{
  "title": "The Hangover",
  "genre": "Comedy",
  "releaseYear": 2009,
  "directorId": "director-uuid-here"
}
```

Each movies response includes its `director`; each directors response includes its `films` array.

## Image storage

Images are stored as private S3 objects and returned as CloudFront URLs. The database stores only S3 keys.

The IAM user also needs `cloudfront:CreateInvalidation` for the configured CloudFront distribution so deleted images are removed from the edge cache immediately.

- `POST /directors/:id/profile-photo` with form-data field `photo` uploads or replaces a director profile photo.
- `DELETE /directors/:id/profile-photo` deletes the profile photo from S3 and MySQL.
- `POST /movies/:id/images` with one or more form-data fields named `images` uploads up to ten movie images per request.
- `DELETE /movies/:id/images` with JSON body `{ "key": "movies/<movie-id>/images/<file>" }` deletes one movie image.
- Deleting a director also deletes their profile photo and all images belonging to their movies. Deleting a movie deletes its images.

Accepted image types are JPEG, PNG, WebP, and GIF; each file may be up to 5 MB.

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
