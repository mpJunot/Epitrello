import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { id?: string; name?: { givenName?: string; familyName?: string }; emails?: Array<{ value?: string }>; photos?: Array<{ value?: string }> },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value ?? '';
    const givenName = profile.name?.givenName ?? '';
    const familyName = profile.name?.familyName ?? '';
    const user = {
      provider: 'GOOGLE',
      providerId: profile.id ?? '',
      email,
      name: [givenName, familyName].filter(Boolean).join(' ') || email || 'Google User',
      avatar: profile.photos?.[0]?.value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}

