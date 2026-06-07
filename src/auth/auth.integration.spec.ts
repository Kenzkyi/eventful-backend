import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { ThrottleExceptionFilter } from '../common/filters/throttle-exception.filter';

describe('Auth Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new ThrottleExceptionFilter());

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(`DELETE FROM users`);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@gmail.com',
          password: 'Test@1234',
          role: 'eventee',
        })
        .expect(201);

      expect(response.body).toHaveProperty('email', 'test@gmail.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 if email already exists', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'Test@1234',
        role: 'eventee',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@gmail.com',
          password: 'Test@1234',
          role: 'eventee',
        })
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });

    it('should return 400 if validation fails', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'T',
          email: 'not-an-email',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'test@gmail.com',
        password: 'Test@123',
        name: 'testing account',
        role: 'eventee',
      });
    });

    it('should login a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'Test@123',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('email', 'test@gmail.com');
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should throw 400 and Invalid credentials if password is incorrect', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'ajsjU@jj33',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should throw 400 and Invalid credentials if email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test1@gmail.com',
          password: 'Test@123',
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should throw 429 after exceeding the rate limit', async () => {
      // exhaust the limit first
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer()).post('/auth/login').send({
          email: 'test@gmail.com',
          password: 'Test@123',
        });
      }

      // this should now be blocked
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'Test@123',
        })
        .expect(429);

      expect(response.body.message).toBe(
        'Too many requests, please slow down and try again later.',
      );
    });
  });
});
