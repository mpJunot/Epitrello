import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:4000/auth/microsoft/callback',
      scope: ['user.read'],
      tenant: 'common',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    const user = {
      provider: 'MICROSOFT',
      providerId: id,
      email: emails[0].value,
      name: displayName,
      avatar: photos[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
