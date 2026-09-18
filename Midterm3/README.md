# Midterm 3 — NestJS GraphQL API

NestJS application with three modules: `auth`, `users`, and `posts`. It uses
GraphQL, MongoDB through Mongoose, and JWT bearer authentication. All post
queries and mutations require a valid token. Only a post's author can update
or delete it.

## Setup

Requires Node.js, npm, and a running MongoDB instance.

```powershell
npm install
Copy-Item .env.example .env
```

Set a long, random `JWT_SECRET` in `.env`, then run:

```powershell
npm run start:dev
```

GraphQL is available at `http://localhost:3000/graphql`. The database defaults
to `mongodb://127.0.0.1:27017/midterm3`; set `MONGODB_URI` to change it.

## GraphQL operations

Register:

```graphql
mutation {
  register(input: { name: "Nino", email: "nino@example.com", password: "password123" }) {
    accessToken
    user { id name email }
  }
}
```

Log in:

```graphql
mutation {
  login(input: { email: "nino@example.com", password: "password123" }) {
    accessToken
    user { id name email }
  }
}
```

Send `Authorization: Bearer <accessToken>` with subsequent requests. For example:

```graphql
query { me { id name email } }
query { user(id: "USER_ID") { id name email } }
query { posts { id title content authorId } }
query { post(id: "POST_ID") { id title content authorId } }

mutation {
  createPost(input: { title: "First post", content: "Hello!" }) {
    id title content authorId
  }
}

mutation {
  updatePost(id: "POST_ID", input: { title: "Updated title" }) {
    id title content
  }
}

mutation { deletePost(id: "POST_ID") }
```

The password is stored as a salted `scrypt` hash and is never returned by the
GraphQL API. Duplicate emails are rejected. Post results are capped at the 100
newest records.

## Verification

```powershell
npm run check:schema
npm run check:routes
```

`check:routes` starts a temporary MongoDB instance, sends real HTTP requests to
`/graphql`, and stops the instance afterward. Its first run may download the
MongoDB test binary. It covers all nine operations, validation, JWT access,
and post ownership.
