require('reflect-metadata');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongo = await MongoMemoryServer.create();
  let app;
  try {
    process.env.MONGODB_URI = mongo.getUri('midterm3-e2e');
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    const { AppModule } = require('../dist/app.module');
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(0, '127.0.0.1');
    const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`;
    let count = 0;

    async function gql(query, variables = {}, token) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      assert.ok([200, 400].includes(response.status), `Unexpected HTTP ${response.status}`);
      count++;
      return response.json();
    }

    function success(result, field) {
      assert.equal(result.errors, undefined, JSON.stringify(result.errors));
      assert.ok(result.data?.[field] !== undefined, JSON.stringify(result));
      return result.data[field];
    }

    function failure(result, code) {
      assert.ok(result.errors?.length, `Expected ${code} error: ${JSON.stringify(result)}`);
      if (code) assert.equal(result.errors[0].extensions?.code, code, JSON.stringify(result.errors));
      assert.equal(result.errors[0].extensions?.stacktrace, undefined);
      assert.equal(result.errors[0].extensions?.originalError, undefined);
    }

    const register = 'mutation($input:RegisterInput!){register(input:$input){accessToken user{id name email}}}';
    const login = 'mutation($input:LoginInput!){login(input:$input){accessToken user{id name email}}}';
    failure(await gql(register, { input: {
      name: 'Nino', email: 'invalid', password: 'password123',
    } }), 'BAD_USER_INPUT');
    const first = success(await gql(register, { input: {
      name: 'Nino', email: 'nino@example.com', password: 'password123',
    } }), 'register');
    assert.equal(first.user.email, 'nino@example.com');
    assert.equal(Object.hasOwn(first.user, 'password'), false);
    failure(await gql(register, { input: {
      name: 'Nino', email: 'nino@example.com', password: 'password123',
    } }), 'CONFLICT');
    failure(await gql(login, { input: { email: 'nino@example.com', password: 'wrong' } }), 'UNAUTHENTICATED');
    const signedIn = success(await gql(login, { input: {
      email: 'nino@example.com', password: 'password123',
    } }), 'login');
    assert.ok(signedIn.accessToken);
    const token = signedIn.accessToken;

    const second = success(await gql(register, { input: {
      name: 'Giorgi', email: 'giorgi@example.com', password: 'password123',
    } }), 'register');
    const otherToken = second.accessToken;

    const protectedOperations = [
      'query{me{id}}',
      `query{user(id:"${first.user.id}"){id}}`,
      'query{posts{id}}',
      'query{post(id:"507f1f77bcf86cd799439011"){id}}',
      'mutation{createPost(input:{title:"No",content:"Token"}){id}}',
      'mutation{updatePost(id:"507f1f77bcf86cd799439011",input:{title:"No"}){id}}',
      'mutation{deletePost(id:"507f1f77bcf86cd799439011")}',
    ];
    for (const operation of protectedOperations) {
      failure(await gql(operation), 'UNAUTHENTICATED');
    }
    failure(await gql('query{posts{id}}', {}, 'invalid-token'), 'UNAUTHENTICATED');

    assert.equal(success(await gql('query{me{id name email}}', {}, token), 'me').id, first.user.id);
    assert.equal(success(await gql(`query{user(id:"${second.user.id}"){id name email}}`, {}, token), 'user').id, second.user.id);
    failure(await gql('mutation{createPost(input:{title:"   ",content:"Hello"}){id}}', {}, token), 'BAD_USER_INPUT');
    failure(await gql('query{post(id:"invalid"){id}}', {}, token), 'BAD_USER_INPUT');

    const created = success(await gql('mutation{createPost(input:{title:"First",content:"Hello"}){id title content authorId}}', {}, token), 'createPost');
    assert.equal(created.authorId, first.user.id);
    assert.equal(success(await gql('query{posts{id title content authorId}}', {}, token), 'posts').length, 1);
    assert.equal(success(await gql(`query{post(id:"${created.id}"){id title content authorId}}`, {}, token), 'post').title, 'First');

    failure(await gql(`mutation{updatePost(id:"${created.id}",input:{title:"Hacked"}){id}}`, {}, otherToken), 'FORBIDDEN');
    failure(await gql(`mutation{deletePost(id:"${created.id}")}`, {}, otherToken), 'FORBIDDEN');
    assert.equal(success(await gql(`mutation{updatePost(id:"${created.id}",input:{title:"Edited"}){id title}}`, {}, token), 'updatePost').title, 'Edited');
    assert.equal(success(await gql(`mutation{deletePost(id:"${created.id}")}`, {}, token), 'deletePost'), true);
    failure(await gql(`query{post(id:"${created.id}"){id}}`, {}, token), 'NOT_FOUND');
    assert.equal(success(await gql('query{posts{id}}', {}, token), 'posts').length, 0);

    console.log(`Verified all 9 GraphQL operations and authorization across ${count} HTTP requests.`);
  } finally {
    if (app) await app.close();
    await mongo.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
