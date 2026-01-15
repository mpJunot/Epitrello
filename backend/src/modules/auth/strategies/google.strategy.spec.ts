import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_CLIENT_SECRET: 'google-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:4000/auth/google/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should build a user profile in validate', async () => {
    const strategy = new GoogleStrategy({} as any);
    const done = jest.fn();
    const profile = {
      id: 'google-id',
      name: { givenName: 'Jane', familyName: 'Doe' },
      emails: [{ value: 'jane@example.com' }],
      photos: [{ value: 'https://example.com/avatar.png' }],
    };

    await strategy.validate('access', 'refresh', profile, done);

    expect(done).toHaveBeenCalledWith(null, {
      provider: 'GOOGLE',
      providerId: 'google-id',
      email: 'jane@example.com',
      name: 'Jane Doe',
      avatar: 'https://example.com/avatar.png',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });
});
