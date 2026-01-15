import { MicrosoftStrategy } from './microsoft.strategy';

describe('MicrosoftStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      MICROSOFT_CLIENT_ID: 'ms-client-id',
      MICROSOFT_CLIENT_SECRET: 'ms-client-secret',
      MICROSOFT_CALLBACK_URL: 'http://localhost:4000/auth/microsoft/callback',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should build a user profile in validate', async () => {
    const strategy = new MicrosoftStrategy();
    const done = jest.fn();
    const profile = {
      id: 'ms-id',
      displayName: 'Microsoft User',
      emails: [{ value: 'ms@example.com' }],
      photos: [{ value: 'https://example.com/ms-avatar.png' }],
    };

    await strategy.validate('access', 'refresh', profile, done);

    expect(done).toHaveBeenCalledWith(null, {
      provider: 'MICROSOFT',
      providerId: 'ms-id',
      email: 'ms@example.com',
      name: 'Microsoft User',
      avatar: 'https://example.com/ms-avatar.png',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });
});
