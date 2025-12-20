import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth-payload.type';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';

interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    this.logger.log(`Registration attempt for email: ${input.email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: Email already in use (${input.email})`);
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcryptjs.hash(input.password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User registered successfully: ${user.email} (ID: ${user.id})`);

      // Send email verification email
      try {
        await this.emailService.sendEmailVerificationEmail({
          email: user.email,
          name: user.name,
          verificationToken,
        });
        this.logger.log(`Email verification sent to: ${user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to send verification email to ${user.email}: ${error.message}`);
        // Don't fail registration if email fails
      }

      // we create a workspace if companyName is provided
      if (input.companyName) {
        this.logger.debug(`Creating workspace "${input.companyName}" for user ${user.email}`);
        await this.prisma.workspace.create({
          data: {
            name: input.companyName,
            memberships: {
              create: {
                userId: user.id,
                role: 'ADMIN',
              },
            },
          },
        });
      }

      const token = this.jwtService.sign(
        { userId: user.id, email: user.email },
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      );

      this.logger.log(`JWT token generated for user: ${user.email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error.code === 'P2002') {
        this.logger.warn(`Registration failed: Email already in use (${input.email})`);
        throw new ConflictException('Email already in use');
      }
      this.logger.error(`Registration failed for ${input.email}:`, error);
      throw error;
    }
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    this.logger.log(`Login attempt for email: ${input.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      this.logger.warn(`Login failed: User not found (${input.email})`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcryptjs.compare(input.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for ${input.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const expiresIn = input.rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d';

    const token = this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn },
    );

    this.logger.log(`Login successful for user: ${user.email} (rememberMe: ${input.rememberMe})`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    this.logger.log(`Password reset requested for email: ${input.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    // If user does not exist, return success message
    if (!user) {
      this.logger.debug(`Password reset requested for non-existent email: ${input.email}`);
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    this.logger.log(`Password reset token generated for user: ${user.email}`);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      token: resetToken,
      userName: user.name,
    });

    this.logger.log(`Password reset email sent to: ${user.email}`);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    this.logger.log(`Password reset attempt with token`);

    // Check if token is valid and not expired
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: input.token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      this.logger.warn(`Password reset failed: Invalid or expired token`);
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      this.logger.warn(`Password reset failed: Token expired for user ${user.email}`);
      throw new BadRequestException('Reset token has expired. Please request a new password reset.');
    }

    const hashedPassword = await bcryptjs.hash(input.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    this.logger.log(`Password reset successful for user: ${user.email}`);

    return {
      message: 'Password has been successfully reset. You can now login with your new password.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    this.logger.log(`Email verification attempt with token`);

    // Find user with this verification token
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      this.logger.warn(`Email verification failed: Invalid or expired token`);
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.emailVerified) {
      this.logger.debug(`Email already verified for user: ${user.email}`);
      return {
        message: 'Email is already verified. You can login now.',
      };
    }

    // Update user to mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    this.logger.log(`Email verified successfully for user: ${user.email}`);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
      this.logger.log(`Welcome email sent to: ${user.email}`);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${user.email}: ${error.message}`);
      // Don't fail verification if welcome email fails
    }

    return {
      message: 'Email verified successfully! Welcome to Epitrello.',
    };
  }

  async oauthLogin(oauthProfile: OAuthProfile): Promise<AuthPayload> {
    const { provider, providerId, email, name, avatar, accessToken, refreshToken, idToken } = oauthProfile;

    this.logger.log(`OAuth login attempt via ${provider} for email: ${email}`);

    // Find existing OAuth account
    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: provider as any,
          providerId,
        },
      },
      include: { user: true },
    });

    let user;

    if (oauthAccount) {
      // Update existing OAuth account tokens
      this.logger.debug(`Updating existing OAuth account for ${email}`);
      oauthAccount = await this.prisma.oAuthAccount.update({
        where: { id: oauthAccount.id },
        data: {
          accessToken,
          refreshToken,
          idToken,
          updatedAt: new Date(),
        },
        include: { user: true },
      });
      user = oauthAccount.user;
    } else {
      this.logger.debug(`No existing OAuth account found, checking for user by email`);
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.log(`Creating new user via OAuth (${provider}): ${email}`);
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            password: crypto.randomBytes(32).toString('hex'),
            avatar,
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }

      // Create OAuth account
      this.logger.debug(`Linking OAuth account (${provider}) to user ${email}`);
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: provider as any,
          providerId,
          accessToken,
          refreshToken,
          idToken,
        },
      });
    }

    // Generate JWT token
    const token = this.jwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    this.logger.log(`OAuth login successful for user: ${user.email} via ${provider}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
