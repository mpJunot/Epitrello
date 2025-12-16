import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-slack-oauth2';

@Injectable()
export class SlackStrategy extends PassportStrategy(Strategy, 'slack') {
  constructor() {
    const clientID = process.env.SLACK_CLIENT_ID?.trim() || '';
    const clientSecret = process.env.SLACK_CLIENT_SECRET?.trim() || '';
    const callbackURL = process.env.SLACK_CALLBACK_URL?.trim() || 'http://localhost:4000/auth/slack/callback';

    super({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL,
      scope: ['identity.basic', 'identity.email', 'identity.avatar', 'identity.team'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, user, team } = profile;
    const email = user?.email || (id ? `${id}@slack.local` : undefined);
    const name = user?.name || email || 'Slack User';
    const avatar = user?.image_512 || user?.image_192;

    const oauthProfile = {
      provider: 'SLACK',
      providerId: id,
      email,
      name,
      avatar,
      accessToken,
      refreshToken,
      teamId: team?.id,
      teamName: team?.name,
    };

    done(null, oauthProfile);
  }
}

