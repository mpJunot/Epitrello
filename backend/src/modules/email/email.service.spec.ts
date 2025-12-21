import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { Resend } from 'resend';

jest.mock('resend');

describe('EmailService', () => {
  let service: EmailService;
  let mockResend: jest.Mocked<Resend>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        RESEND_API_KEY: 'test-api-key',
        EMAIL_FROM: 'test@example.com',
        FRONTEND_URL: 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    // Set environment variables
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.EMAIL_FROM = 'test@example.com';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    const mockSend = jest.fn();
    mockResend = {
      emails: {
        send: mockSend,
      },
    } as any;

    (Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => mockResend);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Spy on logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const emailData = {
        email: 'user@example.com',
        userName: 'Test User',
        token: 'reset-token-123',
      };

      (mockResend.emails.send as jest.Mock).mockResolvedValue({ id: 'email-id-123' });

      await service.sendPasswordResetEmail(emailData);

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: emailData.email,
          subject: expect.stringContaining('Password'),
        }),
      );
    });

    it('should log warning if RESEND_API_KEY is not set', async () => {
      // Create a new service instance without API key
      process.env.RESEND_API_KEY = '';
      const testModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = testModule.get<EmailService>(EmailService);

      const emailData = {
        email: 'user@example.com',
        userName: 'Test User',
        token: 'reset-token-123',
      };

      await testService.sendPasswordResetEmail(emailData);

      expect(Logger.prototype.warn).toHaveBeenCalled();

      // Restore
      process.env.RESEND_API_KEY = 'test-api-key';
    });

    it('should handle errors when sending email', async () => {
      const emailData = {
        email: 'user@example.com',
        userName: 'Test User',
        token: 'reset-token-123',
      };

      (mockResend.emails.send as jest.Mock).mockRejectedValue(new Error('Send failed'));

      await expect(service.sendPasswordResetEmail(emailData)).rejects.toThrow('Send failed');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('sendWorkspaceInvitationEmail', () => {
    it('should send workspace invitation email successfully', async () => {
      const emailData = {
        invitationId: 'invitation-123',
        inviteeEmail: 'invitee@example.com',
        inviteeName: 'Invitee User',
        inviterName: 'Admin User',
        workspaceName: 'Test Workspace',
        workspaceLogoUrl: 'https://example.com/logo.png',
        role: 'MEMBER',
        expiresAt: new Date('2025-12-31'),
      };

      (mockResend.emails.send as jest.Mock).mockResolvedValue({ id: 'email-id-456' });

      await service.sendWorkspaceInvitationEmail(emailData);

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: emailData.inviteeEmail,
          subject: expect.stringContaining('Test Workspace'),
        }),
      );
    });

    it('should send invitation email without logo', async () => {
      const emailData = {
        invitationId: 'invitation-123',
        inviteeEmail: 'invitee@example.com',
        inviteeName: 'Invitee User',
        inviterName: 'Admin User',
        workspaceName: 'Test Workspace',
        workspaceLogoUrl: undefined,
        role: 'MEMBER',
        expiresAt: new Date('2025-12-31'),
      };

      (mockResend.emails.send as jest.Mock).mockResolvedValue({ id: 'email-id-789' });

      await service.sendWorkspaceInvitationEmail(emailData);

      expect(mockResend.emails.send).toHaveBeenCalled();
    });

    it('should log warning if RESEND_API_KEY is not set', async () => {
      // Create a new service instance without API key
      process.env.RESEND_API_KEY = '';
      const testModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = testModule.get<EmailService>(EmailService);

      const emailData = {
        invitationId: 'invitation-123',
        inviteeEmail: 'invitee@example.com',
        inviteeName: 'Invitee User',
        inviterName: 'Admin User',
        workspaceName: 'Test Workspace',
        workspaceLogoUrl: undefined,
        role: 'MEMBER',
        expiresAt: new Date('2025-12-31'),
      };

      await testService.sendWorkspaceInvitationEmail(emailData);

      expect(Logger.prototype.warn).toHaveBeenCalled();

      // Restore
      process.env.RESEND_API_KEY = 'test-api-key';
    });

    it('should handle errors when sending invitation email', async () => {
      const emailData = {
        invitationId: 'invitation-123',
        inviteeEmail: 'invitee@example.com',
        inviteeName: 'Invitee User',
        inviterName: 'Admin User',
        workspaceName: 'Test Workspace',
        workspaceLogoUrl: undefined,
        role: 'MEMBER',
        expiresAt: new Date('2025-12-31'),
      };

      (mockResend.emails.send as jest.Mock).mockRejectedValue(new Error('Send failed'));

      await expect(service.sendWorkspaceInvitationEmail(emailData)).rejects.toThrow('Send failed');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('sendEmailVerificationEmail', () => {
    it('should send email verification email successfully', async () => {
      const emailData = {
        email: 'newuser@example.com',
        name: 'New User',
        verificationToken: 'verification-token-123',
      };

      (mockResend.emails.send as jest.Mock).mockResolvedValue({ id: 'email-id-verify' });

      await service.sendEmailVerificationEmail(emailData);

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: emailData.email,
          subject: expect.stringContaining('Confirm your email'),
        }),
      );
    });

    it('should log warning if RESEND_API_KEY is not set', async () => {
      process.env.RESEND_API_KEY = '';
      const testModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = testModule.get<EmailService>(EmailService);

      const emailData = {
        email: 'newuser@example.com',
        name: 'New User',
        verificationToken: 'verification-token-123',
      };

      await testService.sendEmailVerificationEmail(emailData);

      expect(Logger.prototype.warn).toHaveBeenCalled();

      process.env.RESEND_API_KEY = 'test-api-key';
    });

    it('should handle errors when sending verification email', async () => {
      const emailData = {
        email: 'newuser@example.com',
        name: 'New User',
        verificationToken: 'verification-token-123',
      };

      (mockResend.emails.send as jest.Mock).mockRejectedValue(new Error('Send failed'));

      await expect(service.sendEmailVerificationEmail(emailData)).rejects.toThrow('Send failed');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const emailData = {
        email: 'welcomeuser@example.com',
        name: 'Welcome User',
      };

      (mockResend.emails.send as jest.Mock).mockResolvedValue({ id: 'email-id-welcome' });

      await service.sendWelcomeEmail(emailData);

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: emailData.email,
          subject: expect.stringContaining('Welcome to Epitrello'),
        }),
      );
    });

    it('should log warning if RESEND_API_KEY is not set', async () => {
      process.env.RESEND_API_KEY = '';
      const testModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = testModule.get<EmailService>(EmailService);

      const emailData = {
        email: 'welcomeuser@example.com',
        name: 'Welcome User',
      };

      await testService.sendWelcomeEmail(emailData);

      expect(Logger.prototype.warn).toHaveBeenCalled();

      process.env.RESEND_API_KEY = 'test-api-key';
    });

    it('should handle errors when sending welcome email', async () => {
      const emailData = {
        email: 'welcomeuser@example.com',
        name: 'Welcome User',
      };

      (mockResend.emails.send as jest.Mock).mockRejectedValue(new Error('Send failed'));

      await expect(service.sendWelcomeEmail(emailData)).rejects.toThrow('Send failed');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});
