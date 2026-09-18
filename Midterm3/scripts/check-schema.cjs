require('reflect-metadata');
const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } = require('@nestjs/graphql');
const { GUARDS_METADATA } = require('@nestjs/common/constants');
const { printSchema } = require('graphql');
const { AuthResolver } = require('../dist/auth/auth.resolver');
const { UsersResolver } = require('../dist/users/users.resolver');
const { PostsResolver } = require('../dist/posts/posts.resolver');
const { PostsService } = require('../dist/posts/posts.service');
const { GqlJwtGuard } = require('../dist/auth/gql-jwt.guard');

async function checkGuards() {
  for (const resolver of [UsersResolver, PostsResolver]) {
    assert.ok(Reflect.getMetadata(GUARDS_METADATA, resolver)?.includes(GqlJwtGuard));
  }

  const req = { headers: {} };
  const context = {
    getType: () => 'graphql',
    getArgs: () => [null, {}, { req }, null],
    getClass: () => PostsResolver,
    getHandler: () => PostsResolver.prototype.posts,
  };
  const guard = new GqlJwtGuard(
    { verifyAsync: async (token) => {
      if (token !== 'valid') throw new Error('Bad token');
      return { sub: 'user-id', email: 'nino@example.com' };
    } },
    { findById: async (id) => id === 'user-id' ? { id, email: 'nino@example.com' } : null },
  );
  await assert.rejects(() => guard.canActivate(context), { status: 401 });
  req.headers.authorization = 'Bearer invalid';
  await assert.rejects(() => guard.canActivate(context), { status: 401 });
  req.headers.authorization = 'Bearer valid';
  assert.equal(await guard.canActivate(context), true);
  assert.deepEqual(req.user, { id: 'user-id', email: 'nino@example.com' });
}

async function checkPostOwnership() {
  let deleted = false;
  const post = {
    id: '507f1f77bcf86cd799439011',
    authorId: { toString: () => 'owner-id' },
    title: 'Original',
    content: 'Content',
    save: async () => {},
    deleteOne: async () => { deleted = true; },
  };
  const posts = new PostsService({ findById: () => ({ exec: async () => post }) });
  await assert.rejects(() => posts.update(post.id, { title: 'Changed' }, 'other-id'), { status: 403 });
  assert.equal(post.title, 'Original');
  await assert.rejects(() => posts.remove(post.id, 'other-id'), { status: 403 });
  assert.equal(deleted, false);
  await posts.update(post.id, { title: 'Changed' }, 'owner-id');
  assert.equal(post.title, 'Changed');
  assert.equal(await posts.remove(post.id, 'owner-id'), true);
  assert.equal(deleted, true);
}

async function main() {
  const app = await NestFactory.createApplicationContext(GraphQLSchemaBuilderModule, { logger: false });
  try {
    const factory = app.get(GraphQLSchemaFactory);
    const schema = await factory.create([AuthResolver, UsersResolver, PostsResolver]);
    const sdl = printSchema(schema);
    for (const operation of ['register', 'login', 'me', 'user', 'posts', 'post', 'createPost', 'updatePost', 'deletePost']) {
      assert.match(sdl, new RegExp(`\\b${operation}\\b`));
    }
    await checkGuards();
    await checkPostOwnership();
    console.log('GraphQL schema, JWT guards, and post ownership verified.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
