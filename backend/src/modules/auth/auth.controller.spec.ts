import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    oauthLogin: jest.fn(),
  };

  const mockRequest = (user?: any) =>
    ({
      user,
    }) as unknown as Request;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.redirect = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should return undefined', async () => {
      const result = await controller.googleAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthCallback', () => {
    it('should handle successful OAuth callback', async () => {
      const mockUser = {
        provider: 'google',
        providerId: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const req = mockRequest(mockUser);
      const res = mockResponse();

      mockAuthService.oauthLogin.mockResolvedValue({
        token: 'jwt-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      });

      await controller.googleAuthCallback(req, res);

      expect(authService.oauthLogin).toHaveBeenCalledWith(mockUser);
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/callback?token='),
      );
    });

    it('should handle OAuth callback error when user not found', async () => {
      const req = mockRequest(undefined);
      const res = mockResponse();

      await controller.googleAuthCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/callback?error='),
      );
    });

    it('should handle OAuth callback error from service', async () => {
      const mockUser = {
        provider: 'google',
        providerId: '123',
        email: 'test@example.com',
      };

      const req = mockRequest(mockUser);
      const res = mockResponse();

      mockAuthService.oauthLogin.mockRejectedValue(new Error('OAuth failed'));

      await controller.googleAuthCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/callback?error=OAuth%20failed'),
      );
    });
  });

  describe('githubAuth', () => {
    it('should return undefined', async () => {
      const result = await controller.githubAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('githubAuthCallback', () => {
    it('should handle successful OAuth callback', async () => {
      const mockUser = {
        provider: 'GITHUB',
        providerId: '123',
        email: 'test@example.com',
      };

      const req = mockRequest(mockUser);
      const res = mockResponse();

      mockAuthService.oauthLogin.mockResolvedValue({
        token: 'jwt-token',
        user: { id: '1', email: 'test@example.com' },
      });

      await controller.githubAuthCallback(req, res);

      expect(authService.oauthLogin).toHaveBeenCalledWith(mockUser);
      expect(res.redirect).toHaveBeenCalled();
    });
  });

  describe('microsoftAuth', () => {
    it('should return undefined', async () => {
      const result = await controller.microsoftAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('microsoftAuthCallback', () => {
    it('should handle successful OAuth callback', async () => {
      const mockUser = {
        provider: 'microsoft',
        providerId: '123',
        email: 'test@example.com',
      };

      const req = mockRequest(mockUser);
      const res = mockResponse();

      mockAuthService.oauthLogin.mockResolvedValue({
        token: 'jwt-token',
        user: { id: '1', email: 'test@example.com' },
      });

      await controller.microsoftAuthCallback(req, res);

      expect(authService.oauthLogin).toHaveBeenCalledWith(mockUser);
      expect(res.redirect).toHaveBeenCalled();
    });
  });

  describe('slackAuth', () => {
    it('should return undefined', async () => {
      const result = await controller.slackAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('slackAuthCallback', () => {
    it('should handle successful OAuth callback', async () => {
      const mockUser = {
        provider: 'slack',
        providerId: '123',
        email: 'test@example.com',
      };

      const req = mockRequest(mockUser);
      const res = mockResponse();

      mockAuthService.oauthLogin.mockResolvedValue({
        token: 'jwt-token',
        user: { id: '1', email: 'test@example.com' },
      });

      await controller.slackAuthCallback(req, res);

      expect(authService.oauthLogin).toHaveBeenCalledWith(mockUser);
      expect(res.redirect).toHaveBeenCalled();
    });
  });
});
