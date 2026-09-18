import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './../src/app.module';

process.env.JWT_SECRET = 'e2e-test-secret';
process.env.EMAIL_HOST = 'localhost';
process.env.EMAIL_PORT = '1025';
process.env.EMAIL_USER = 'test';
process.env.EMAIL_PASS = 'test';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue({
        entityMetadatas: [],
        options: { type: 'mysql' },
        getRepository: jest.fn(() => ({})),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
