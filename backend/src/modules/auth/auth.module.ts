import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { SlackStrategy } from './strategies/slack.strategy';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

// Build providers array conditionally based on environment variables
const buildOAuthProviders = () => {
  const providers: any[] = [
    AuthService,
    AuthResolver,
    JwtStrategy,
  ];

  // Only add OAuth strategies if credentials are configured (non-empty)
  if (process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()) {
    providers.push(GoogleStrategy);
  }

  if (
    process.env.APPLE_CLIENT_ID?.trim() &&
    process.env.APPLE_TEAM_ID?.trim() &&
    process.env.APPLE_KEY_ID?.trim() &&
    process.env.APPLE_PRIVATE_KEY?.trim()
  ) {
    providers.push(AppleStrategy);
  }

  if (process.env.MICROSOFT_CLIENT_ID?.trim() && process.env.MICROSOFT_CLIENT_SECRET?.trim()) {
    providers.push(MicrosoftStrategy);
  }

  if (process.env.SLACK_CLIENT_ID?.trim() && process.env.SLACK_CLIENT_SECRET?.trim()) {
    providers.push(SlackStrategy);
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
  exports: [AuthService],
})
export class AuthModule {}

