import { AppleStrategy } from './apple.strategy';

describe('AppleStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      APPLE_CLIENT_ID: 'apple-client-id',
      APPLE_TEAM_ID: 'apple-team-id',
      APPLE_KEY_ID: 'apple-key-id',
      APPLE_PRIVATE_KEY: 'line1\\nline2',
      APPLE_CALLBACK_URL: 'http://localhost:4000/auth/apple/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should build a user profile in validate', async () => {
    const strategy = new AppleStrategy({} as any);
    const done = jest.fn();
    const profile = {
      id: 'apple-id',
      email: 'apple@example.com',
      name: { firstName: 'Apple', lastName: 'User' },
    };

    await strategy.validate('access', 'refresh', 'id-token', profile, done);

    expect(done).toHaveBeenCalledWith(null, {
      provider: 'APPLE',
      providerId: 'apple-id',
      email: 'apple@example.com',
      name: 'Apple User',
      avatar: null,
      accessToken: 'access',
      refreshToken: 'refresh',
      idToken: 'id-token',
    });
  });

  it('should fallback to default name when profile name missing', async () => {
    const strategy = new AppleStrategy({} as any);
    const done = jest.fn();

    await strategy.validate('access', 'refresh', 'id-token', { email: 'apple@example.com' }, done);

    expect(done).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        name: 'Apple User',
      }),
    );
  });
});
