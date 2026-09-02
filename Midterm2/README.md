# Homework 27

Fresh NestJS project with MongoDB user CRUD, a 150,000-user Faker seed,
request-duration logging, cached reads, indexed age filtering, regex name search,
and bounded pagination.

## Setup

```bash
npm install
copy .env.example .env
npm run seed:users
npm run start:dev
```

Environment variables:

```env
MONGO_URL=mongodb://127.0.0.1:27017
MONGO_DB_NAME=homework27
PORT=3000
```

The seed is resumable. It checks the existing user count and inserts only the
missing records in batches of 5,000 until the database contains 150,000 users.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/users` | Create a user |
| GET | `/users?page=1&limit=20` | Paginated users |
| GET | `/users/filter` | Filter/search users with pagination |
| GET | `/total-users` | Return the total user count |
| GET | `/users/:id` | Return one user |
| PATCH | `/users/:id` | Update one user |
| DELETE | `/users/:id` | Delete one user |

Filter examples:

```text
/users/filter?age=30
/users/filter?ageFrom=25&ageTo=35
/users/filter?ageFrom=25&ageTo=35&gender=m
/users/filter?name=John&page=2&limit=10
```

`age` cannot be combined with `ageFrom`/`ageTo`. `limit` must be between 1 and
100, and `page` must be at least 1.

## Folder and file guide

### Project configuration

- `package.json` contains the Nest scripts and the additional `seed:users`
  command, plus Mongoose, cache-manager, validation, and Faker dependencies.
- `.env.example` documents the MongoDB connection, isolated database name, and
  application port.
- `.gitignore` excludes dependencies, builds, coverage, logs, and the real
  `.env` file.
- `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `.prettierrc`, and
  `eslint.config.mjs` are the fresh Nest project compiler/tooling configuration.

### `src/`

- `main.ts` creates the application, installs a global validation pipe, and
  starts the HTTP server.
- `app.module.ts` loads environment configuration, connects Mongoose to the
  isolated `homework27` database, enables the global in-memory cache, imports
  `UsersModule`, and applies request timing middleware to every route.
- `app.controller.ts` and `app.service.ts` provide the starter root health route.

### `src/common/`

- `dto/object-id-param.dto.ts` validates MongoDB IDs before CRUD methods run.
- `middleware/request-timing.middleware.ts` starts a high-resolution timer for
  every request and logs method, URL, status code, and elapsed milliseconds when
  the response finishes.

### `src/users/`

- `schemas/user.schema.ts` defines `fullName`, unique `email`, `age`, `gender`,
  timestamps, and the MongoDB ascending index on `age`.
- `dto/create-user.dto.ts` validates new users.
- `dto/update-user.dto.ts` makes create fields optional for PATCH requests.
- `dto/pagination.dto.ts` transforms and validates `page` and `limit`, including
  the 1–100 limit boundary.
- `dto/filter-users.dto.ts` adds exact age, age range, gender, and name filters.
- `users.controller.ts` maps all CRUD, filtering, pagination, and `/total-users`
  HTTP endpoints.
- `users.service.ts` performs MongoDB queries with `find().skip().limit()`,
  creates safe regex filters, counts matching records, caches reads for one
  minute, and invalidates cached generations after writes.
- `users.module.ts` registers the schema and exposes the user service and seeder.

### `src/database/`

- `user-seeder.service.ts` creates realistic users with Faker and inserts them
  in 5,000-record batches using `insertMany()`.
- `seed-users.ts` creates a Nest application context, runs the 150,000-user seed,
  prints the result, and closes the database connection cleanly.

### `test/`

- `app.e2e-spec.ts` and `jest-e2e.json` are the fresh Nest end-to-end test setup.
- `src/app.controller.spec.ts` checks the starter controller.

## Validation commands

```bash
npm run lint
npm run build
npm test -- --runInBand
```
