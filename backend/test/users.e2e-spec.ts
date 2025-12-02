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
    it('should handle GraphQL introspection query', () => {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType {
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
          expect(res.body.data.__schema.queryType.name).toBe('Query');
        });
    });

    it('should return error for invalid query', () => {
      const invalidQuery = `
        query {
          invalidField
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toHaveLength(1);
        });
    });
  });
});
