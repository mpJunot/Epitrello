export const authConfig = {
  google: {
    authURL: 'https://accounts.google.com/o/oauth2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    userInfoURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  apple: {
    authURL: 'https://appleid.apple.com/auth/authorize',
    tokenURL: 'https://appleid.apple.com/auth/token',
    userInfoURL: 'https://appleid.apple.com/auth/userinfo',
    clientID: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    callbackURL: process.env.APPLE_CALLBACK_URL,
    scope: ['name', 'email'],
  },
  microsoft: {
    authURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoURL: 'https://graph.microsoft.com/v1.0/me',
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    scope: ['user.read'],
  },
  slack: {
    authURL: 'https://slack.com/oauth/v2/authorize',
    tokenURL: 'https://slack.com/api/oauth.v2.access',
    userInfoURL: 'https://slack.com/api/users.info',
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
  },
};
