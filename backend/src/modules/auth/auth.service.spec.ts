
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcryptjs from 'bcryptjs';

jest.mock('bcryptjs');
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-random-token'),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let emailService: EmailService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workspace: {
      create: jest.fn(),
    },
    oAuthAccount: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockEmailService = {
    sendEmailVerificationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    service = new AuthService(
      mockPrismaService as any,
      mockJwtService as any,
      mockEmailService as any,
    );
    prismaService = mockPrismaService as any;
    emailService = mockEmailService as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user without workspace', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockEmailService.sendEmailVerificationEmail.mockResolvedValue(undefined);

      const result = await service.register(input);

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe(input.email);
      expect(result.user.name).toBe(input.name);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(emailService.sendEmailVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      const input = {
        email: 'existing@example.com',
        name: 'Test',
        password: 'password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: input.email });

      await expect(service.register(input)).rejects.toThrow(ConflictException);
      await expect(service.register(input)).rejects.toThrow('Email already in use');
    });

    it('should create workspace if companyName provided', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        companyName: 'Test Company',
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.workspace.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockEmailService.sendEmailVerificationEmail.mockResolvedValue(undefined);

      const result = await service.register(input);

      expect(result.token).toBe('jwt-token');
      expect(prismaService.workspace.create).toHaveBeenCalledWith({
        data: {
          name: input.companyName,
          memberships: {
            create: {
              userId: mockUser.id,
              role: 'ADMIN',
            },
          },
        },
      });
    });

    it('should still register user when verification email fails to send', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: input.name,
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockEmailService.sendEmailVerificationEmail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.register(input);

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe(input.email);
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when create fails with P2002 (unique email)', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.register(input)).rejects.toThrow(ConflictException);
      await expect(service.register(input)).rejects.toThrow('Email already in use');
    });

    it('should rethrow when user create fails with non-P2002 error', async () => {
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockRejectedValue(new Error('Database connection lost'));

      await expect(service.register(input)).rejects.toThrow('Database connection lost');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: 'Test User',
        password: 'hashed-password',
        avatar: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(input);

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe(input.email);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const input = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(input)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        password: 'hashed-password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(input)).rejects.toThrow('Invalid email or password');
    });

    it('should use 30d expiry when rememberMe is true', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: 'Test User',
        password: 'hashed-password',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(input);

      expect(result.token).toBe('jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email },
        { expiresIn: '30d' },
      );
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and send email', async () => {
      const input = { email: 'test@example.com' };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await service.forgotPassword(input);

      expect(result.message).toContain('password reset');
      expect(prismaService.user.update).toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return success even if user not found (security)', async () => {
      const input = { email: 'nonexistent@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(input);

      expect(result.message).toContain('password reset');
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should return success message when reset email is not sent (e.g. RESEND_API_KEY missing)', async () => {
      const input = { email: 'test@example.com' };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(false);

      const result = await service.forgotPassword(input);

      expect(result.message).toContain('password reset');
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const input = {
        token: 'valid-token',
        newPassword: 'newpassword123',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        resetPasswordToken: input.token,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        password: 'old-hash',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.resetPassword(input);

      expect(result.message).toContain('successfully reset');
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      const input = {
        token: 'invalid-token',
        newPassword: 'newpassword123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword(input)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(input)).rejects.toThrow('Invalid or expired');
    });

    it('should throw BadRequestException for expired token', async () => {
      const input = {
        token: 'expired-token',
        newPassword: 'newpassword123',
      };

      const mockUser = {
        id: 'user-1',
        resetPasswordToken: input.token,
        resetPasswordExpires: new Date(Date.now() - 1000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.resetPassword(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-verification-token';

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 3600000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, emailVerified: true });
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.verifyEmail(token);

      expect(result.message).toContain('verified successfully');
      expect(prismaService.user.update).toHaveBeenCalled();
      expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      const token = 'expired-token';

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
      await expect(service.verifyEmail(token)).rejects.toThrow('Invalid or expired');
    });

    it('should handle already verified email', async () => {
      const token = 'valid-token';

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 3600000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.verifyEmail(token);

      expect(result.message).toContain('already verified');
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should still succeed when welcome email fails to send', async () => {
      const token = 'valid-verification-token';

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 3600000),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, emailVerified: true });
      mockEmailService.sendWelcomeEmail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.verifyEmail(token);

      expect(result.message).toContain('verified successfully');
      expect(prismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('oauthLogin', () => {
    it('should handle OAuth login for existing user', async () => {
      const oauthProfile = {
        provider: 'GOOGLE',
        providerId: 'google-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockOAuthAccount = {
        id: 'oauth-1',
        userId: 'user-1',
        provider: 'GOOGLE',
        providerId: 'google-123',
        user: mockUser,
      };

      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue(mockOAuthAccount);
      mockPrismaService.oAuthAccount.update.mockResolvedValue(mockOAuthAccount);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.oauthLogin(oauthProfile);

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(prismaService.oAuthAccount.findUnique).toHaveBeenCalled();
    });

    it('should create new user for new OAuth login', async () => {
      const oauthProfile = {
        provider: 'GOOGLE',
        providerId: 'google-123',
        email: 'newuser@example.com',
        name: 'New User',
      };

      const mockNewUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        name: 'New User',
        avatar: null,
        emailVerified: true,
      };

      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockNewUser);
      mockPrismaService.oAuthAccount.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.oauthLogin(oauthProfile);

      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('newuser@example.com');
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(prismaService.oAuthAccount.create).toHaveBeenCalled();
    });

    it('should use placeholder email when OAuth profile has no email', async () => {
      const oauthProfile = {
        provider: 'SLACK',
        providerId: 'slack-456',
        email: '',
        name: 'Slack User',
      };

      const mockNewUser = {
        id: 'user-oauth',
        email: 'oauth-SLACK-slack-456@epitrello.oauth',
        name: 'Slack User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockNewUser);
      mockPrismaService.oAuthAccount.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.oauthLogin(oauthProfile);

      expect(result.user.email).toBe('oauth-SLACK-slack-456@epitrello.oauth');
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'oauth-SLACK-slack-456@epitrello.oauth',
          }),
        }),
      );
    });

    it('should use email as name when OAuth profile has no name for new user', async () => {
      const oauthProfile = {
        provider: 'GOOGLE',
        providerId: 'google-no-name',
        email: 'noname@example.com',
        name: '',
      };

      const mockNewUser = {
        id: 'user-new',
        email: 'noname@example.com',
        name: 'noname@example.com',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.oAuthAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockNewUser);
      mockPrismaService.oAuthAccount.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.oauthLogin(oauthProfile);

      expect(result.user.name).toBe('noname@example.com');
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'noname@example.com',
          }),
        }),
      );
    });
  });
});
