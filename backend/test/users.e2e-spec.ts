import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/graphql (POST)', () => {
    it('should return GraphQL playground on GET', () => {
      return request(app.getHttpServer())
        .get('/graphql')
        .expect(200);
    });

    it('should handle GraphQL introspection query', () => {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            types {
              name
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: introspectionQuery })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('__schema');
          expect(res.body.data.__schema).toHaveProperty('types');
        });
    });
  });
});
