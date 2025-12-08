import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { AuthService } from '../auth.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:4000/auth/apple/callback',
      scope: ['name', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // Apple profile structure is different
    const user = {
      provider: 'APPLE',
      providerId: profile.id || idToken,
      email: profile.email,
      name: profile.name
        ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
        : 'Apple User',
      avatar: null,
      accessToken,
      refreshToken,
      idToken,
    };

    done(null, user);
  }
}

