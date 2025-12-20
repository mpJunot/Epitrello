# Epitrello API Documentation

## Base URL

```
http://localhost:4000/graphql
```

The port can be configured via the `PORT` environment variable (default: 4000).

## GraphQL Playground

In development mode, you can access the GraphQL Playground at:

```
http://localhost:4000/graphql
```

The Playground provides:

- Interactive query editor
- Schema documentation
- Query history
- Request/response inspection

## Authentication

Most queries and mutations require authentication. Include the JWT token in the HTTP headers:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Public Endpoints

The following endpoints are public (no authentication required):

- `register` - User registration
- `login` - User login
- `forgotPassword` - Request password reset
- `resetPassword` - Reset password with token
- `verifyEmail` - Verify email address with token

## Mutations

### Authentication

#### Register

Create a new user account. An email verification link will be sent to the provided email address.

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
      avatar
      createdAt
      updatedAt
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123",
    "companyName": "My Company"
  }
}
```

> **Note:** `companyName` is optional - automatically creates a workspace if provided

> **Note:** An email verification link will be sent to the provided email address. The email must be verified before full account access is granted.

**Response:**

```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

**Notes:**

- If `companyName` is provided, a workspace is automatically created
- The user becomes ADMIN of the created workspace
- Token expires in 7 days

#### Login

Authenticate an existing user.

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
      avatar
      createdAt
      updatedAt
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "user@example.com",
    "password": "password123",
    "rememberMe": true
  }
}
```

> **Note:** `rememberMe` is optional - extends token expiration to 30 days if `true`

**Response:**

```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

**Notes:**

- If `rememberMe` is `true`, token expires in 30 days
- If `rememberMe` is `false` or not provided, token expires in 7 days (or `JWT_EXPIRES_IN` env var)

#### OAuth2 Login (Google / Apple / Microsoft / Slack)

Backend (NestJS) endpoints:

- **Start**: `GET /auth/{provider}` (public) — the Passport guard triggers the redirect to the provider.
- **Callback**: `GET /auth/{provider}/callback` (public) — handled by `handleOAuthCallback`.

Callback behavior:

- On success: issues a JWT, sets a httpOnly cookie `token` (7 days, `SameSite=Lax`), then redirects to:
  ```
  {FRONTEND_URL}/auth/callback?token=JWT
  ```
- On error: redirects to:
  ```
  {FRONTEND_URL}/auth/callback?error=encoded_message
  ```

Required env vars (strategy enabled only if non-empty):

```
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...
APPLE_CALLBACK_URL=http://localhost:4000/auth/apple/callback

MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_CALLBACK_URL=http://localhost:4000/auth/microsoft/callback

SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_CALLBACK_URL=http://localhost:4000/auth/slack/callback
```

Notes:

- Register the same callback URL in each provider console (must match backend).
- In production, serve over HTTPS and add `Secure` to the cookie (and `SameSite=None` if frontend/backend are on different domains).
- The frontend page expected by the redirect is `/auth/callback`, which should read `token` or `error` from the querystring and finalize the session client-side if needed.

#### Forgot Password

Request a password reset. A reset token will be generated and sent to the provided email address if the account exists.

```graphql
mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) {
    message
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "user@example.com"
  }
}
```

**Response:**

```json
{
  "data": {
    "forgotPassword": {
      "message": "If an account with that email exists, a password reset link has been sent."
    }
  }
}
```

**Notes:**

- Always returns the same success message to prevent email enumeration attacks
- Reset token expires in 1 hour
- Email is sent via Resend service (if `RESEND_API_KEY` is configured)
- If `RESEND_API_KEY` is not set, the reset token is logged to the console (development mode)
- The reset link is sent to the user's email address automatically

**Error Cases:**

- `BAD_USER_INPUT` (400) - Invalid email format

#### Reset Password

Reset password using a valid reset token received via email.

```graphql
mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    message
  }
}
```

**Variables:**

```json
{
  "input": {
    "token": "reset-token-received-via-email",
    "newPassword": "newpassword123"
  }
}
```

**Response:**

```json
{
  "data": {
    "resetPassword": {
      "message": "Password has been successfully reset. You can now login with your new password."
    }
  }
}
```

**Notes:**

- Token must be valid and not expired (expires after 1 hour)
- Password must be at least 6 characters long
- Token is automatically cleared after successful password reset

**Error Cases:**

- `BAD_USER_INPUT` (400) - Invalid or expired reset token
- `BAD_USER_INPUT` (400) - Password too short (less than 6 characters)
- `BAD_USER_INPUT` (400) - Token is required

#### Verify Email

Verify email address using the verification token received via email. A welcome email will be sent upon successful verification.

```graphql
mutation VerifyEmail($token: String!) {
  verifyEmail(token: $token) {
    message
  }
}
```

**Variables:**

```json
{
  "token": "verification-token-received-via-email"
}
```

**Response:**

```json
{
  "data": {
    "verifyEmail": {
      "message": "Email verified successfully! Welcome to Epitrello."
    }
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation VerifyEmail($token: String!) { verifyEmail(token: $token) { message } }",
    "variables": {
      "token": "verification-token-received-via-email"
    }
  }'
```

**Email Flow:**

1. User registers → Receives verification email
2. User clicks verification link → Email is verified
3. System sends welcome email with onboarding information

**Notes:**

- Token must be valid and not expired (expires after 24 hours)
- Email verification is recommended but not strictly enforced
- Welcome email is automatically sent after successful verification
- Already verified emails will return a success message

**Error Cases:**

- `BAD_USER_INPUT` (400) - Invalid or expired verification token
- `BAD_USER_INPUT` (400) - Token is required

### Users

#### Get Current User

Get the authenticated user's information.

```graphql
query Me {
  me {
    id
    email
    name
    avatar
    createdAt
    updatedAt
  }
}
```

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Users

Get a list of all users (requires authentication).

```graphql
query Users {
  users {
    id
    email
    name
    avatar
    createdAt
    updatedAt
  }
}
```

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get User by ID

Get a specific user by ID.

```graphql
query User($id: ID!) {
  user(id: $id) {
    id
    email
    name
    avatar
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "user-uuid"
}
```

#### Create User

Create a new user (requires authentication).

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    name
    avatar
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "newuser@example.com",
    "name": "New User",
    "password": "password123",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

> **Note:** `avatar` is optional

#### Update User

Update an existing user (requires authentication).

```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    email
    name
    avatar
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "user-uuid",
  "input": {
    "name": "Updated Name",
    "email": "updated@example.com",
    "avatar": "https://example.com/new-avatar.jpg"
  }
}
```

#### Delete User

Delete a user (requires authentication).

```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

**Variables:**

```json
{
  "id": "user-uuid"
}
```

## Error Handling

GraphQL returns errors in a standardized format:

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "UNAUTHENTICATED",
        "statusCode": 401
      }
    }
  ]
}
```

### Common Error Codes

- `UNAUTHENTICATED` (401) - Missing or invalid JWT token
- `FORBIDDEN` (403) - Valid token but insufficient permissions
- `BAD_USER_INPUT` (400) - Invalid input data
- `CONFLICT` (409) - Resource conflict (e.g., email already in use)
- `INTERNAL_SERVER_ERROR` (500) - Server error

### Password Reset Error Messages

- `"Invalid or expired reset token"` - Token is invalid, expired, or already used
- `"Reset token has expired. Please request a new password reset."` - Token has expired
- `"Password must be at least 6 characters long"` - Password validation failed
- `"Token must be a string"` - Invalid token format
- `"Invalid email format"` - Email validation failed

## Types

### User

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### AuthPayload

```graphql
type AuthPayload {
  token: String!
  user: User!
}
```

### RegisterInput

```graphql
input RegisterInput {
  email: String!
  name: String!
  password: String!
  companyName: String
}
```

> **Note:** `companyName` is optional

### LoginInput

```graphql
input LoginInput {
  email: String!
  password: String!
  rememberMe: Boolean
}
```

> **Note:** `rememberMe` is optional, default value: `false`

### ForgotPasswordInput

```graphql
input ForgotPasswordInput {
  email: String!
}
```

### ResetPasswordInput

```graphql
input ResetPasswordInput {
  token: String!
  newPassword: String!
}
```

### MessageResponse

```graphql
type MessageResponse {
  message: String!
}
```

### Workspace

```graphql
type Workspace {
  id: ID!
  name: String!
  logoUrl: String
  visibility: Visibility!
  createdAt: DateTime!
  updatedAt: DateTime!
  memberCount: Float!
  memberships: [WorkspaceMember!]
}
```

### WorkspaceMember

```graphql
type WorkspaceMember {
  id: ID!
  userId: ID!
  role: String!
  joinedAt: DateTime!
}
```

### Visibility

```graphql
enum Visibility {
  PRIVATE
  WORKSPACE
  PUBLIC
}
```

### CreateWorkspaceInput

```graphql
input CreateWorkspaceInput {
  name: String!
  logoUrl: String
  visibility: String
}
```

> **Note:** `logoUrl` is optional
> **Note:** `visibility` is optional, default: `PRIVATE`

### UpdateWorkspaceInput

```graphql
input UpdateWorkspaceInput {
  name: String
  logoUrl: String
  visibility: String
}
```

> **Note:** All fields are optional

## Examples

### Complete Authentication Flow

1. **Register a new user:**

```graphql
mutation {
  register(
    input: {
      email: "user@example.com"
      name: "John Doe"
      password: "password123"
      companyName: "My Company"
    }
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

2. **Use the token for authenticated requests:**

```graphql
query {
  me {
    id
    email
    name
  }
}
```

Headers: `Authorization: Bearer <token_from_register>`

### Workspace Management Flow

1. **Create a workspace:**

```graphql
mutation {
  createWorkspace(
    input: {
      name: "My Team Workspace"
      logoUrl: "https://example.com/logo.png"
      visibility: PRIVATE
    }
  ) {
    id
    name
    memberCount
  }
}
```

2. **Get your workspaces:**

```graphql
query {
  myWorkspaces {
    id
    name
    visibility
    memberCount
  }
}
```

3. **Get workspace details:**

```graphql
query {
  workspace(id: "workspace-uuid") {
    id
    name
    visibility
    memberCount
    memberships {
      userId
      role
      joinedAt
    }
  }
}
```

4. **Update workspace (ADMIN only):**

```graphql
mutation {
  updateWorkspace(
    id: "workspace-uuid"
    input: { name: "Updated Team Name", visibility: WORKSPACE }
  ) {
    id
    name
    visibility
  }
}
```

5. **Delete workspace (ADMIN only):**

```graphql
mutation {
  deleteWorkspace(id: "workspace-uuid")
}
```

### Password Reset Flow

1. **Request password reset:**

```graphql
mutation {
  forgotPassword(input: { email: "user@example.com" }) {
    message
  }
}
```

2. **Check email for reset link** (sent automatically via Resend, or check console logs if `RESEND_API_KEY` is not set)

3. **Reset password with token:**

```graphql
mutation {
  resetPassword(
    input: { token: "reset-token-from-email", newPassword: "newpassword123" }
  ) {
    message
  }
}
```

4. **Login with new password:**

```graphql
mutation {
  login(input: { email: "user@example.com", password: "newpassword123" }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { email: \"user@example.com\", name: \"John Doe\", password: \"password123\" }) { token user { id email name } } }"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"user@example.com\", password: \"password123\" }) { token user { id email name } } }"
  }'
```

**Authenticated Query:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { me { id email name } }"
  }'
```

**Forgot Password:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { forgotPassword(input: { email: \"user@example.com\" }) { message } }"
  }'
```

**Reset Password:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { resetPassword(input: { token: \"reset-token-here\", newPassword: \"newpassword123\" }) { message } }"
  }'
```

**Create Workspace:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation { createWorkspace(input: { name: \"My Workspace\", visibility: \"PRIVATE\" }) { id name memberCount } }"
  }'
```

**Get My Workspaces:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { myWorkspaces { id name visibility memberCount } }"
  }'
```

**Get Workspace by ID:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { workspace(id: \"workspace-uuid\") { id name memberCount memberships { userId role } } }"
  }'
```

**Update Workspace:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation { updateWorkspace(id: \"workspace-uuid\", input: { name: \"Updated Name\" }) { id name } }"
  }'
```

**Delete Workspace:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation { deleteWorkspace(id: \"workspace-uuid\") }"
  }'
```

## Schema Introspection

You can query the schema itself using GraphQL introspection:

```graphql
query {
  __schema {
    types {
      name
      description
    }
  }
}
```

Or get information about a specific type:

```graphql
query {
  __type(name: "User") {
    name
    description
    fields {
      name
      description
      type {
        name
      }
    }
  }
}
```

## Email Service

The API uses [Resend](https://resend.com) for sending emails (e.g., password reset emails).

### Configuration

The following environment variables are required for email functionality:

```env
# Resend API Configuration
RESEND_API_KEY=re_your_api_key_here

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

### Getting Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Copy the key and add it to your `.env` file

### Development Mode

If `RESEND_API_KEY` is not set, the email service will:

- Log the password reset token to the console
- Log the reset link to the console
- Not send actual emails

This allows development without requiring a Resend account.

### Free Tier

Resend offers:

- 3,000 emails/month free
- 100 emails/day free
- Perfect for development and small projects

### Workspaces

#### Create Workspace

Create a new workspace. The creator automatically becomes an ADMIN member.

```graphql
mutation CreateWorkspace($input: CreateWorkspaceInput!) {
  createWorkspace(input: $input) {
    id
    name
    logoUrl
    visibility
    memberCount
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "name": "My Workspace",
    "logoUrl": "https://example.com/logo.png",
    "visibility": "PRIVATE"
  }
}
```

> **Note:** `logoUrl` is optional
> **Note:** `visibility` is optional, default value: `PRIVATE` (options: `PRIVATE`, `WORKSPACE`, `PUBLIC`)

**Response:**

```json
{
  "data": {
    "createWorkspace": {
      "id": "workspace-uuid",
      "name": "My Workspace",
      "logoUrl": "https://example.com/logo.png",
      "visibility": "PRIVATE",
      "memberCount": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Notes:**

- Creator automatically becomes ADMIN
- Requires authentication
- Workspace name is required (max 100 characters)

**Error Cases:**

- `UNAUTHENTICATED` (401) - Missing or invalid JWT token
- `BAD_USER_INPUT` (400) - Invalid input data

#### Get Workspace by ID

Get a specific workspace by ID. User must be a member to access.

```graphql
query Workspace($id: ID!) {
  workspace(id: $id) {
    id
    name
    logoUrl
    visibility
    memberCount
    createdAt
    updatedAt
    memberships {
      id
      userId
      role
      joinedAt
    }
  }
}
```

**Variables:**

```json
{
  "id": "workspace-uuid"
}
```

**Response:**

```json
{
  "data": {
    "workspace": {
      "id": "workspace-uuid",
      "name": "My Workspace",
      "logoUrl": "https://example.com/logo.png",
      "visibility": "PRIVATE",
      "memberCount": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "memberships": [
        {
          "id": "membership-uuid-1",
          "userId": "user-uuid-1",
          "role": "ADMIN",
          "joinedAt": "2024-01-01T00:00:00.000Z"
        },
        {
          "id": "membership-uuid-2",
          "userId": "user-uuid-2",
          "role": "MEMBER",
          "joinedAt": "2024-01-02T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Notes:**

- Requires authentication
- User must be a member of the workspace
- Returns workspace with member details

**Error Cases:**

- `UNAUTHENTICATED` (401) - Missing or invalid JWT token
- `NOT_FOUND` (404) - Workspace not found
- `FORBIDDEN` (403) - User is not a member of the workspace

#### Get My Workspaces

Get all workspaces where the current user is a member.

```graphql
query MyWorkspaces {
  myWorkspaces {
    id
    name
    logoUrl
    visibility
    memberCount
    createdAt
    updatedAt
  }
}
```

**Response:**

```json
{
  "data": {
    "myWorkspaces": [
      {
        "id": "workspace-uuid-1",
        "name": "My Workspace",
        "logoUrl": "https://example.com/logo.png",
        "visibility": "PRIVATE",
        "memberCount": 3,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "workspace-uuid-2",
        "name": "Another Workspace",
        "logoUrl": null,
        "visibility": "WORKSPACE",
        "memberCount": 5,
        "createdAt": "2024-01-05T00:00:00.000Z",
        "updatedAt": "2024-01-05T00:00:00.000Z"
      }
    ]
  }
}
```

**Notes:**

- Requires authentication
- Returns all workspaces where user is a member
- Results ordered by creation date (newest first)

**Error Cases:**

- `UNAUTHENTICATED` (401) - Missing or invalid JWT token

#### Update Workspace

Update an existing workspace. Only ADMIN members can update.

```graphql
mutation UpdateWorkspace($id: ID!, $input: UpdateWorkspaceInput!) {
  updateWorkspace(id: $id, input: $input) {
    id
    name
    logoUrl
    visibility
    memberCount
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "workspace-uuid",
  "input": {
    "name": "Updated Workspace Name",
    "logoUrl": "https://example.com/new-logo.png",
    "visibility": "WORKSPACE"
  }
}
```

> **Note:** All fields are optional - update only the fields you want to change

**Response:**

```json
{
  "data": {
    "updateWorkspace": {
      "id": "workspace-uuid",
      "name": "Updated Workspace Name",
      "logoUrl": "https://example.com/new-logo.png",
      "visibility": "WORKSPACE",
      "memberCount": 3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
  }
}
```

**Notes:**

- Requires authentication
- Only ADMIN members can update
- At least one field must be provided
- Name max length: 100 characters

**Error Cases:**

- `UNAUTHENTICATED` (401) - Missing or invalid JWT token
- `NOT_FOUND` (404) - Workspace not found
- `FORBIDDEN` (403) - User is not an ADMIN
- `BAD_USER_INPUT` (400) - No fields to update or invalid input

#### Delete Workspace

Delete a workspace. Only ADMIN members can delete.

```graphql
mutation DeleteWorkspace($id: ID!) {
  deleteWorkspace(id: $id)
}
```

**Variables:**

```json
{
  "id": "workspace-uuid"
}
```

**Response:**

```json
{
  "data": {
    "deleteWorkspace": true
  }
}
```

**Notes:**

- Requires authentication
- Only ADMIN members can delete
- Deletes workspace and all associated data (boards, lists, cards, etc.)
- This action is irreversible

**Error Cases:**

- `UNAUTHENTICATED` (401) - Missing or invalid JWT token
- `NOT_FOUND` (404) - Workspace not found
- `FORBIDDEN` (403) - User is not an ADMIN

---

## Workspace Member Management

### Invite Member to Workspace

Invite a user to join a workspace by email. Only workspace ADMINs can send invitations.

**Mutation**: `inviteMember`

**GraphQL Query**:

```graphql
mutation InviteMember($input: InviteMemberInput!) {
  inviteMember(input: $input) {
    id
    workspaceId
    inviteeEmail
    role
    status
    expiresAt
    inviterName
    workspaceName
  }
}
```

**Variables**:

```json
{
  "input": {
    "workspaceId": "workspace-uuid",
    "inviteeEmail": "user@example.com",
    "role": "MEMBER"
  }
}
```

> **Note**: `role` is optional and defaults to `MEMBER`. Available roles: `ADMIN`, `MEMBER`, `OBSERVER`.

**Response**:

```json
{
  "data": {
    "inviteMember": {
      "id": "invitation-uuid",
      "workspaceId": "workspace-uuid",
      "inviterId": "admin-uuid",
      "inviteeEmail": "user@example.com",
      "inviteeId": "user-uuid",
      "role": "MEMBER",
      "status": "PENDING",
      "expiresAt": "2025-12-26T12:00:00Z",
      "createdAt": "2025-12-19T12:00:00Z",
      "updatedAt": "2025-12-19T12:00:00Z",
      "inviterName": "Admin User",
      "workspaceName": "My Workspace"
    }
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation InviteMember($input: InviteMemberInput!) { inviteMember(input: $input) { id inviteeEmail role status workspaceName } }",
    "variables": {
      "input": {
        "workspaceId": "workspace-uuid",
        "inviteeEmail": "user@example.com",
        "role": "MEMBER"
      }
    }
  }'
```

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the workspace
- `404 Not Found` - Workspace does not exist
- `409 Conflict` - User is already a member or has a pending invitation

---

### Accept Invitation

Accept a pending workspace invitation.

**Mutation**: `acceptInvitation`

**GraphQL Query**:

```graphql
mutation AcceptInvitation($input: RespondInvitationInput!) {
  acceptInvitation(input: $input) {
    id
    status
    workspaceName
    role
  }
}
```

**Variables**:

```json
{
  "input": {
    "invitationId": "invitation-uuid"
  }
}
```

**Response**:

```json
{
  "data": {
    "acceptInvitation": {
      "id": "invitation-uuid",
      "status": "ACCEPTED",
      "workspaceName": "My Workspace",
      "role": "MEMBER"
    }
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation AcceptInvitation($input: RespondInvitationInput!) { acceptInvitation(input: $input) { id status workspaceName role } }",
    "variables": {
      "input": {
        "invitationId": "invitation-uuid"
      }
    }
  }'
```

**Error Cases**:

- `403 Forbidden` - Invitation is not for the current user
- `404 Not Found` - Invitation does not exist
- `400 Bad Request` - Invitation has expired or is not pending
- `409 Conflict` - User is already a member

---

### Reject Invitation

Reject a pending workspace invitation.

**Mutation**: `rejectInvitation`

**Variables**:

```json
{
  "input": {
    "invitationId": "invitation-uuid"
  }
}
```

**Response**:

```json
{
  "data": {
    "rejectInvitation": {
      "id": "invitation-uuid",
      "status": "REJECTED"
    }
  }
}
```

**Error Cases**:

- `403 Forbidden` - Invitation is not for the current user
- `404 Not Found` - Invitation does not exist
- `400 Bad Request` - Invitation is not pending

---

### Get My Invitations

Get all pending invitations for the current user.

**Query**: `myInvitations`

**GraphQL Query**:

```graphql
query MyInvitations {
  myInvitations {
    id
    workspaceId
    inviteeEmail
    role
    status
    expiresAt
    inviterName
    workspaceName
  }
}
```

**Variables**: None

**Response**:

```json
{
  "data": {
    "myInvitations": [
      {
        "id": "invitation-uuid",
        "workspaceId": "workspace-uuid",
        "inviteeEmail": "user@example.com",
        "role": "MEMBER",
        "status": "PENDING",
        "expiresAt": "2025-12-26T12:00:00Z",
        "inviterName": "Admin User",
        "workspaceName": "My Workspace"
      }
    ]
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query MyInvitations { myInvitations { id workspaceId inviteeEmail role status expiresAt inviterName workspaceName } }"
  }'
```

---

### Get Workspace Members

Get all members of a workspace. User must be a member to view.

**Query**: `workspaceMembers`

**GraphQL Query**:

```graphql
query WorkspaceMembers($workspaceId: ID!) {
  workspaceMembers(workspaceId: $workspaceId) {
    id
    userId
    workspaceId
    role
    joinedAt
    user {
      id
      email
      name
      avatar
    }
  }
}
```

**Variables**:

```json
{
  "workspaceId": "workspace-uuid"
}
```

**Response**:

```json
{
  "data": {
    "workspaceMembers": [
      {
        "id": "member-uuid",
        "userId": "user-uuid",
        "workspaceId": "workspace-uuid",
        "role": "ADMIN",
        "joinedAt": "2025-12-01T12:00:00Z",
        "user": {
          "id": "user-uuid",
          "email": "admin@example.com",
          "name": "Admin User",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ]
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query WorkspaceMembers($workspaceId: ID!) { workspaceMembers(workspaceId: $workspaceId) { id userId role joinedAt user { id email name avatar } } }",
    "variables": {
      "workspaceId": "workspace-uuid"
    }
  }'
```

**Error Cases**:

- `403 Forbidden` - User is not a member of the workspace

---

### Get Workspace Invitations

Get all pending invitations for a workspace. Only ADMINs can view.

**Query**: `workspaceInvitations`

**Variables**:

```json
{
  "workspaceId": "workspace-uuid"
}
```

**Response**:

```json
{
  "data": {
    "workspaceInvitations": [
      {
        "id": "invitation-uuid",
        "inviteeEmail": "user@example.com",
        "role": "MEMBER",
        "status": "PENDING",
        "expiresAt": "2025-12-26T12:00:00Z",
        "createdAt": "2025-12-19T12:00:00Z"
      }
    ]
  }
}
```

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the workspace

---

### Update Member Role

Update a member's role in a workspace. Only ADMINs can update roles.

**Mutation**: `updateMemberRole`

**GraphQL Query**:

```graphql
mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {
  updateMemberRole(input: $input)
}
```

**Variables**:

```json
{
  "input": {
    "workspaceId": "workspace-uuid",
    "userId": "member-uuid",
    "role": "ADMIN"
  }
}
```

**Response**:

```json
{
  "data": {
    "updateMemberRole": true
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation UpdateMemberRole($input: UpdateMemberRoleInput!) { updateMemberRole(input: $input) }",
    "variables": {
      "input": {
        "workspaceId": "workspace-uuid",
        "userId": "member-uuid",
        "role": "ADMIN"
      }
    }
  }'
```

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the workspace
- `404 Not Found` - Target user is not a member
- `400 Bad Request` - Cannot remove the last admin

---

### Remove Member

Remove a member from a workspace. Only ADMINs can remove members.

**Mutation**: `removeMember`

**GraphQL Query**:

```graphql
mutation RemoveMember($input: RemoveMemberInput!) {
  removeMember(input: $input)
}
```

**Variables**:

```json
{
  "input": {
    "workspaceId": "workspace-uuid",
    "userId": "member-uuid"
  }
}
```

**Response**:

```json
{
  "data": {
    "removeMember": true
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation RemoveMember($input: RemoveMemberInput!) { removeMember(input: $input) }",
    "variables": {
      "input": {
        "workspaceId": "workspace-uuid",
        "userId": "member-uuid"
      }
    }
  }'
```

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the workspace
- `404 Not Found` - Target user is not a member
- `400 Bad Request` - Cannot remove the last admin

---

### Leave Workspace

Leave a workspace. Cannot leave if you are the last admin.

**Mutation**: `leaveWorkspace`

**GraphQL Query**:

```graphql
mutation LeaveWorkspace($workspaceId: ID!) {
  leaveWorkspace(workspaceId: $workspaceId)
}
```

**Variables**:

```json
{
  "workspaceId": "workspace-uuid"
}
```

**Response**:

```json
{
  "data": {
    "leaveWorkspace": true
  }
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation LeaveWorkspace($workspaceId: ID!) { leaveWorkspace(workspaceId: $workspaceId) }",
    "variables": {
      "workspaceId": "workspace-uuid"
    }
  }'
```

**Error Cases**:

- `404 Not Found` - User is not a member of the workspace
- `400 Bad Request` - User is the last admin (must assign another admin first)

---

### Cancel Invitation

Cancel a pending invitation. Only the inviter or workspace admin can cancel.

**Mutation**: `cancelInvitation`

**Variables**:

```json
{
  "invitationId": "invitation-uuid"
}
```

**Response**:

```json
{
  "data": {
    "cancelInvitation": true
  }
}
```

**Error Cases**:

- `403 Forbidden` - User is not the inviter or an admin
- `404 Not Found` - Invitation does not exist
- `400 Bad Request` - Invitation is not pending

---

## Role-Based Access Control

### Roles

- **ADMIN**: Full control over workspace (invite, remove, update roles, delete workspace)
- **MEMBER**: Can view and edit workspace content
- **OBSERVER**: Read-only access to workspace

### Permission Matrix

| Action           | ADMIN | MEMBER | OBSERVER |
| ---------------- | ----- | ------ | -------- |
| View workspace   | ✓     | ✓      | ✓        |
| Edit workspace   | ✓     | ✗      | ✗        |
| Delete workspace | ✓     | ✗      | ✗        |
| Invite members   | ✓     | ✗      | ✗        |
| Remove members   | ✓     | ✗      | ✗        |
| Update roles     | ✓     | ✗      | ✗        |
| Leave workspace  | ✓\*   | ✓      | ✓        |

> **Note**: \*ADMINs cannot leave if they are the last admin. They must assign another admin first.

---

## Support

For issues or questions, please refer to:

- [GraphQL Documentation](https://graphql.org/learn/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
