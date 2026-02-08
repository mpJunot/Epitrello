import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { SlackStrategy } from './strategies/slack.strategy';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

// Build providers array conditionally based on environment variables
const buildOAuthProviders = () => {
  const logger = new Logger('AuthModule');
  const providers: any[] = [
    AuthService,
    AuthResolver,
    JwtStrategy,
  ];

  // Only add OAuth strategies if credentials are configured (non-empty)
  if (process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()) {
    providers.push(GoogleStrategy);
    logger.log('Google OAuth strategy registered');
  } else {
    logger.warn('Google OAuth disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable');
  }

  if (process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim()) {
    providers.push(GitHubStrategy);
    logger.log('GitHub OAuth strategy registered');
  } else {
    logger.warn('GitHub OAuth disabled: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable');
  }

  if (process.env.MICROSOFT_CLIENT_ID?.trim() && process.env.MICROSOFT_CLIENT_SECRET?.trim()) {
    providers.push(MicrosoftStrategy);
    logger.log('Microsoft OAuth strategy registered');
  }

  if (process.env.SLACK_CLIENT_ID?.trim() && process.env.SLACK_CLIENT_SECRET?.trim()) {
    providers.push(SlackStrategy);
    logger.log('Slack OAuth strategy registered');
  } else {
    logger.warn('Slack OAuth disabled: set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to enable');
  }
  return providers;
};

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('JwtModule');
        const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key';
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';

        logger.log(`JWT configured with expiresIn: ${expiresIn}`);
        if (!configService.get<string>('JWT_SECRET')) {
          logger.warn('JWT_SECRET not configured, using default (insecure!)');
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: buildOAuthProviders(),
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

