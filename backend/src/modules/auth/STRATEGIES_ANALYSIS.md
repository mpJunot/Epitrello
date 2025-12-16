# OAuth2 Strategies Analysis

## Implemented Strategies

### 1. Google Strategy (`google.strategy.ts`)

**Package**: `passport-google-oauth20`

**Configuration**:

- Client ID/Secret from environment variables
- Callback URL: `/auth/google/callback`
  -- Scopes: `['email', 'profile']`

**Extracted data**:

- `provider`: `'GOOGLE'`
- `providerId`: Google user ID
- `email`: primary email
- `name`: first + last name
- `avatar`: profile photo
- `accessToken`: access token
- `refreshToken`: refresh token

**Notes**:

- Standardized profile structure
- Proper handling of multiple emails (uses the first)

### 2. Apple Strategy (`apple.strategy.ts`)

**Package**: `passport-apple`

**Configuration**:

- Client ID, Team ID, Key ID, Private Key from environment variables
- Callback URL: `/auth/apple/callback`
- Scopes: `['name', 'email']`
- Private key newline handling (`\n` replacement)

**Extracted data**:

- `provider`: `'APPLE'`
- `providerId`: Apple user ID or idToken
- `email`: can be null on first login
- `name`: can be null on first login
- `avatar`: null (Apple does not provide an avatar)
- `accessToken`: access token
- `refreshToken`: refresh token
- `idToken`: ID token

**Notes**:

- Apple may not provide name/email on first login
- Fallback to `idToken` if `profile.id` is missing
- Handles private key newlines safely

### 3. Microsoft Strategy (`microsoft.strategy.ts`)

**Package**: `passport-microsoft`

**Configuration**:

- Client ID/Secret from environment variables
- Callback URL: `/auth/microsoft/callback` (fixed to port 4000)
- Scope: `['user.read']`
- Tenant: `'common'` (all Microsoft accounts)

**Extracted data**:

- `provider`: `'MICROSOFT'`
- `providerId`: Microsoft user ID
- `email`: primary email
- `name`: display name
- `avatar`: optional profile photo
- `accessToken`: access token
- `refreshToken`: refresh token

**Notes**:

- Callback URL fixed to use port 4000
- Profile structure similar to Google

### 4. Slack Strategy (`slack.strategy.ts`)

**Package**: `passport-slack-oauth2`

**Configuration**:

- Client ID/Secret from environment variables
- Callback URL: `/auth/slack/callback` (fixed to port 4000)
- Scopes: `['identity.basic', 'identity.email', 'identity.avatar']`

**Extracted data**:

- `provider`: `'SLACK'`
- `providerId`: Slack user ID
- `email`: from `profile.user.email`
- `name`: from `profile.user.name`
- `avatar`: prefers `image_512`, falls back to `image_192`
- `accessToken`: access token
- `refreshToken`: refresh token

**Notes**:

- Callback URL fixed to use port 4000
- Profile structure differs (`profile.user` instead of `profile`)

## Required Corrections (addressed)

- Callback URLs for Microsoft and Slack set to `http://localhost:4000/auth/.../callback`
- Providers normalized to enum `OAuthProvider` values: `GOOGLE`, `APPLE`, `MICROSOFT`, `SLACK`

## OAuthAccount Model

The new `OAuthAccount` model enables:

- Multiple OAuth accounts per user (e.g., Google + Microsoft)
- Secure token storage (accessToken, refreshToken, idToken)
- Token expiration tracking (`expiresAt`)
- Additional metadata (`scope`, `tokenType`)
- Cascade relation to `User` (auto-cleanup)

## Next Steps

1. Regenerate Prisma Client:

```bash
pnpm prisma generate
```

2. Create migration:

```bash
pnpm prisma migrate dev --name add_oauth_accounts
```

3. Ensure environment variables are set:

```env
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_CALLBACK_URL=http://localhost:4000/auth/microsoft/callback

SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_CALLBACK_URL=http://localhost:4000/auth/slack/callback
```
