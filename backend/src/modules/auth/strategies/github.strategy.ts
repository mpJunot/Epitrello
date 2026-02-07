import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID?.trim() ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { id?: string; displayName?: string; username?: string; emails?: Array<{ value?: string }>; photos?: Array<{ value?: string }> },
  ): Promise<{
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatar: string | undefined;
    accessToken: string;
    refreshToken: string;
  }> {
    const email = profile.emails?.[0]?.value ?? '';
    const user = {
      provider: 'GITHUB',
      providerId: profile.id ?? '',
      email,
      name: ((profile.displayName ?? profile.username ?? email) || 'GitHub User').trim() || 'GitHub User',
      avatar: profile.photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    return user;
  }
}
