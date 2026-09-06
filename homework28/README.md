# Homework 28 — Movies and directors

NestJS + MySQL + TypeORM, following the module/controller/service/DTO/entity structure of `lec21`.

## Run

1. Install dependencies: `npm install`.
2. Create a MySQL database: `CREATE DATABASE homework28 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`.
3. Copy `.env.example` to `.env` and enter your MySQL credentials.
4. Run `npm run start:dev`. The API listens at `http://localhost:3000`.

`SQL_SYNC=true` creates the tables automatically for this homework. Use migrations instead of synchronization in production.

## Routes

| Method | Movies | Directors |
| --- | --- | --- |
| POST | `/movies` | `/directors` |
| GET | `/movies` | `/directors` |
| GET | `/movies/:id` | `/directors/:id` |
| PATCH | `/movies/:id` | `/directors/:id` |
| DELETE | `/movies/:id` | `/directors/:id` |

Create a director first with this JSON body:

```json
{ "name": "Todd Phillips", "nationality": "American", "birthYear": 1970 }
```

Use the returned UUID in a movie's `director` field:

```json
{
  "name": "The Hangover",
  "genre": "comedy",
  "year": 2009,
  "description": "Three friends retrace their steps after a Las Vegas bachelor party.",
  "director": "REPLACE_WITH_DIRECTOR_UUID"
}
```

Movie responses contain a `director` object. Director responses contain a `films` array with all their movies, including when the directors list is paginated. PATCH accepts any subset of the create fields; changing a movie's `director` reassigns it. Films are managed through `/movies`.

Deleting a director also deletes their movies through the SQL foreign key's `ON DELETE CASCADE`. Missing records return 404; invalid bodies, query parameters, UUIDs, reversed year ranges, or nonexistent movie directors return 400.

## Pagination and filters

Both list endpoints accept `page` (default 1) and `limit` (default 10, maximum 100). Results are ordered by name, then UUID for stable pagination.

Movies: `name` (partial match), `genre` (exact match), `yearFrom`, `yearTo`, and `director` (UUID).

Directors: `name` (partial match), `nationality` (exact match), `birthYearFrom`, and `birthYearTo`.

Text filters are case insensitive. Year boundaries are inclusive, and supplied filters are combined with AND.

```text
/movies?genre=comedy&yearFrom=2002&yearTo=2010&name=hang&page=1&limit=5
/directors?name=todd&nationality=American&birthYearFrom=1960&birthYearTo=1980&page=1&limit=5
```

List response:

```json
{ "data": [], "total": 0, "page": 1, "limit": 10, "totalPages": 0 }
```

## Checks

```sh
npm run build
npm run lint
npm run test:e2e
```

The API integration tests use an isolated in-memory SQL.js database with the actual TypeORM entities and repositories; the application itself is configured for MySQL. Tests do not require or change a local MySQL database.

Run `npm run test:mysql` to run the same tests against your installed MySQL using `.env`. This creates a uniquely named temporary database and removes it afterwards; your `homework28` data is preserved. The configured MySQL user needs permission to create and drop that test database.
