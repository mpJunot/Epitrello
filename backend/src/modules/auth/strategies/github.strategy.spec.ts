import { GitHubStrategy } from './github.strategy';

describe('GitHubStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GITHUB_CLIENT_ID: 'github-client-id',
      GITHUB_CLIENT_SECRET: 'github-client-secret',
      GITHUB_CALLBACK_URL: 'http://localhost:4000/auth/github/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should build a user profile in validate', async () => {
    const strategy = new GitHubStrategy();
    const profile = {
      id: 'github-123',
      displayName: 'GitHub User',
      username: 'ghuser',
      emails: [{ value: 'github@example.com' }],
      photos: [{ value: 'https://avatars.githubusercontent.com/u/123' }],
    };

    const user = await strategy.validate('access', 'refresh', profile);

    expect(user).toEqual({
      provider: 'GITHUB',
      providerId: 'github-123',
      email: 'github@example.com',
      name: 'GitHub User',
      avatar: 'https://avatars.githubusercontent.com/u/123',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('should fallback to username when displayName missing', async () => {
    const strategy = new GitHubStrategy();
    const profile = {
      id: 'github-456',
      username: 'octocat',
      emails: [{ value: 'octo@example.com' }],
    };

    const user = await strategy.validate('access', 'refresh', profile);

    expect(user.name).toBe('octocat');
    expect(user.email).toBe('octo@example.com');
  });
});
