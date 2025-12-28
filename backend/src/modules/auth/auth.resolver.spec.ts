import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const result = {
        token: 'jwt-token',
        user: {
          id: '1',
          email: input.email,
          name: input.name,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(result);

      expect(await resolver.register(input)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(input);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = {
        token: 'jwt-token',
        user: {
          id: '1',
          email: input.email,
          name: 'Test User',
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await resolver.login(input)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(input);
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      const input = { email: 'test@example.com' };
      const result = { message: 'Password reset email sent' };

      mockAuthService.forgotPassword.mockResolvedValue(result);

      expect(await resolver.forgotPassword(input)).toEqual(result);
      expect(authService.forgotPassword).toHaveBeenCalledWith(input);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const input = {
        token: 'reset-token',
        newPassword: 'newpassword123',
      };
      const result = { message: 'Password reset successfully' };

      mockAuthService.resetPassword.mockResolvedValue(result);

      expect(await resolver.resetPassword(input)).toEqual(result);
      expect(authService.resetPassword).toHaveBeenCalledWith(input);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const token = 'verification-token';
      const result = { message: 'Email verified successfully' };

      mockAuthService.verifyEmail.mockResolvedValue(result);

      expect(await resolver.verifyEmail(token)).toEqual(result);
      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
    });
  });
});
