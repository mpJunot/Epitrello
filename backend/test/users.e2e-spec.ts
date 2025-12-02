import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/graphql (POST)', () => {
    it('should create a user', () => {
      const createUserMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) {
            id
            email
            name
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUserMutation,
          variables: {
            input: {
              email: 'test@example.com',
              name: 'Test User',
              password: 'password123'
            }
          }
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser).toHaveProperty('id');
          expect(res.body.data.createUser.email).toBe('test@example.com');
          expect(res.body.data.createUser.name).toBe('Test User');
        });
    });

    it('should get all users', async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedpassword'
        }
      });

      const getUsersQuery = `
        query GetUsers {
          users {
            id
            email
            name
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getUsersQuery })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.users).toHaveLength(1);
          expect(res.body.data.users[0].email).toBe('test@example.com');
        });
    });
  });
});
