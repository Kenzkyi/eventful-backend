import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { UserRepository } from '../users/user.repository';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should throw if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@gmail.com',
      });

      await expect(
        authService.register({
          name: 'Test',
          email: 'test@gmail.com',
          password: 'Test@1234',
          role: 'eventee' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register a new user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        name: 'Test',
        email: 'test@gmail.com',
        role: 'eventee',
        password: 'hashed',
        createdAt: new Date(),
      });

      const result = await authService.register({
        name: 'Test',
        email: 'test@gmail.com',
        password: 'Test@1234',
        role: 'eventee' as any,
      });

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', 'test@gmail.com');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockUserRepository.findByEmail.mockReset();
      mockJwtService.signAsync.mockReset();
    });

    it('throw error if user not found', async () => {
      await expect(
        authService.login({
          email: 'jamb@gmail.com',
          password: 'Test@123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throw error if password is not valid', async () => {
      const hashed = await bcrypt.hash('Test@123', 10);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@gmail.com',
        password: hashed,
      });
      await expect(
        authService.login({
          email: 'test@gmail.com',
          password: 'ashes@123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Successful login', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10);

      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@gmail.com',
        password: hashedPassword,
      });
      mockJwtService.signAsync.mockResolvedValue('token');
      const result = await authService.login({
        email: 'test@gmail.com',
        password: 'Test@1234',
      });

      expect(result).toHaveProperty('accessToken', 'token');
      expect(result).toHaveProperty('data');
      expect(result.data).not.toHaveProperty('password');
    });
  });
});
