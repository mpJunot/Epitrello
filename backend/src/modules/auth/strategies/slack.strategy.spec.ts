import { SlackStrategy } from './slack.strategy';

describe('SlackStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SLACK_CLIENT_ID: 'slack-client-id',
      SLACK_CLIENT_SECRET: 'slack-client-secret',
      SLACK_CALLBACK_URL: 'http://localhost:4000/auth/slack/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should build a user profile in validate', async () => {
    const strategy = new SlackStrategy();
    const done = jest.fn();
    const profile = {
      id: 'slack-id',
      user: {
        email: 'slack@example.com',
        name: 'Slack User',
        image_512: 'https://example.com/slack-avatar.png',
      },
      team: { id: 'team-1', name: 'Workspace' },
    };

    await strategy.validate('access', 'refresh', profile, done);

    expect(done).toHaveBeenCalledWith(null, {
      provider: 'SLACK',
      providerId: 'slack-id',
      email: 'slack@example.com',
      name: 'Slack User',
      avatar: 'https://example.com/slack-avatar.png',
      accessToken: 'access',
      refreshToken: 'refresh',
      teamId: 'team-1',
      teamName: 'Workspace',
    });
  });

  it('should fallback to derived email when missing', async () => {
    const strategy = new SlackStrategy();
    const done = jest.fn();

    await strategy.validate('access', 'refresh', { id: 'slack-id' }, done);

    expect(done).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        email: 'slack-id@slack.local',
        name: 'slack-id@slack.local',
      }),
    );
  });
});
