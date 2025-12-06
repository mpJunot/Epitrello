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

    it('should return error for invalid GraphQL syntax', () => {
      const invalidQuery = `
        query {
          invalidField {
            nonExistentNestedField
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(Array.isArray(res.body.errors)).toBe(true);
        });
    });

    it('should handle valid GraphQL query with field error', () => {
      const queryWithFieldError = `
        query {
          nonExistentField
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: queryWithFieldError })
        .expect((res) => {
          // GraphQL peut retourner 200 ou 400 selon l'implémentation
          expect([200, 400]).toContain(res.status);
          expect(res.body).toHaveProperty('errors');
        });
    });
  });
});
