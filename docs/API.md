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

---

## Boards

### Create Board

Create a new board within a workspace or as a personal board.

**Mutation**: `createBoard`

**Permissions**: User must be ADMIN or MEMBER of the workspace (OBSERVER cannot create boards)

**GraphQL Query**:

```graphql
mutation CreateBoard($input: CreateBoardInput!) {
  createBoard(input: $input) {
    id
    title
    description
    workspaceId
    visibility
    background
    isArchived
    creatorId
    members {
      id
      userId
      role
      joinedAt
      user {
        id
        email
        name
        avatar
      }
    }
    createdAt
    updatedAt
  }
}
```

**Variables**:

```json
{
  "input": {
    "title": "Sprint Planning Q1 2024",
    "description": "Planning board for Q1 sprint",
    "workspaceId": "workspace-uuid",
    "visibility": "WORKSPACE",
    "background": "#0079BF"
  }
}
```

> **Note**: All fields except `title` are optional

**Response**:

```json
{
  "data": {
    "createBoard": {
      "id": "board-uuid",
      "title": "Sprint Planning Q1 2024",
      "description": "Planning board for Q1 sprint",
      "workspaceId": "workspace-uuid",
      "visibility": "WORKSPACE",
      "background": "#0079BF",
      "isArchived": false,
      "creatorId": "user-uuid",
      "members": [
        {
          "id": "member-uuid",
          "userId": "user-uuid",
          "role": "ADMIN",
          "joinedAt": "2024-01-01T00:00:00.000Z",
          "user": {
            "id": "user-uuid",
            "email": "creator@example.com",
            "name": "Creator User",
            "avatar": null
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Notes**:

- Creator automatically becomes ADMIN of the board
- If `workspaceId` is not provided, creates a personal board
- Default visibility is `PRIVATE`
- OBSERVER role cannot create boards

**Error Cases**:

- `403 Forbidden` - User is not a member of the workspace
- `403 Forbidden` - User is an OBSERVER (cannot create boards)
- `404 Not Found` - Workspace not found

---

### Get Board by ID

Get a specific board by ID.

**Query**: `board`

**Permissions**: Based on board visibility

- **PUBLIC**: Anyone can view
- **WORKSPACE**: Workspace members can view
- **PRIVATE**: Only board members can view

**GraphQL Query**:

```graphql
query Board($id: ID!) {
  board(id: $id) {
    id
    title
    description
    workspaceId
    visibility
    background
    isArchived
    creatorId
    members {
      id
      userId
      role
      joinedAt
      user {
        id
        email
        name
        avatar
      }
    }
    createdAt
    updatedAt
  }
}
```

**Variables**:

```json
{
  "id": "board-uuid"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query Board($id: ID!) { board(id: $id) { id title visibility isArchived members { id userId role user { id email name } } } }",
    "variables": {
      "id": "board-uuid"
    }
  }'
```

**Error Cases**:

- `404 Not Found` - Board does not exist
- `403 Forbidden` - User does not have access to this board

---

### List Workspace Boards

Get all non-archived boards in a workspace.

**Query**: `workspaceBoards`

**Permissions**: User must be a member of the workspace

**GraphQL Query**:

```graphql
query WorkspaceBoards($workspaceId: ID!) {
  workspaceBoards(workspaceId: $workspaceId) {
    id
    title
    description
    visibility
    background
    isArchived
    creatorId
    members {
      id
      userId
      role
      joinedAt
      user {
        id
        email
        name
        avatar
      }
    }
    createdAt
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
    "workspaceBoards": [
      {
        "id": "board-uuid-1",
        "title": "Sprint Planning",
        "description": "Q1 2024",
        "visibility": "WORKSPACE",
        "background": "#0079BF",
        "isArchived": false,
        "creatorId": "user-uuid",
        "members": [
          {
            "id": "member-uuid-1",
            "userId": "user-uuid",
            "role": "ADMIN",
            "joinedAt": "2024-01-01T00:00:00.000Z",
            "user": {
              "id": "user-uuid",
              "email": "creator@example.com",
              "name": "Creator User",
              "avatar": null
            }
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Notes**:

- Only returns non-archived boards
- Results ordered by creation date (newest first)
- Requires workspace membership

**Error Cases**:

- `403 Forbidden` - User is not a member of the workspace

---

### Update Board

Update board properties.

**Mutation**: `updateBoard`

**Permissions**: User must be ADMIN or MEMBER of the board (OBSERVER cannot edit)

**GraphQL Query**:

```graphql
mutation UpdateBoard($input: UpdateBoardInput!) {
  updateBoard(input: $input) {
    id
    title
    description
    visibility
    background
    members {
      id
      userId
      role
      user {
        id
        email
        name
      }
    }
    updatedAt
  }
}
```

**Variables**:

```json
{
  "input": {
    "id": "board-uuid",
    "title": "Updated Sprint Planning",
    "description": "Q1 2024 - Updated",
    "visibility": "PUBLIC",
    "background": "#00C2E0"
  }
}
```

> **Note**: All fields except `id` are optional

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation UpdateBoard($input: UpdateBoardInput!) { updateBoard(input: $input) { id title visibility } }",
    "variables": {
      "input": {
        "id": "board-uuid",
        "title": "Updated Title"
      }
    }
  }'
```

**Error Cases**:

- `404 Not Found` - Board does not exist
- `403 Forbidden` - User is not a member of the board
- `403 Forbidden` - User is an OBSERVER (cannot edit)

---

### Delete Board

Permanently delete a board.

**Mutation**: `deleteBoard`

**Permissions**: Only board ADMIN can delete

**GraphQL Query**:

```graphql
mutation DeleteBoard($id: ID!) {
  deleteBoard(id: $id)
}
```

**Variables**:

```json
{
  "id": "board-uuid"
}
```

**Response**:

```json
{
  "data": {
    "deleteBoard": true
  }
}
```

**Notes**:

- Permanently deletes the board and all associated data (lists, cards, comments, etc.)
- This action is irreversible
- Only ADMIN role can delete boards

**Error Cases**:

- `404 Not Found` - Board does not exist
- `403 Forbidden` - User is not an ADMIN of the board

---

### Archive Board

Archive a board (soft delete).

**Mutation**: `archiveBoard`

**Permissions**: User must be ADMIN or MEMBER of the board

**GraphQL Query**:

```graphql
mutation ArchiveBoard($id: ID!) {
  archiveBoard(id: $id) {
    id
    title
    isArchived
    members {
      id
      userId
      role
      user {
        id
        email
        name
      }
    }
    updatedAt
  }
}
```

**Variables**:

```json
{
  "id": "board-uuid"
}
```

**Response**:

```json
{
  "data": {
    "archiveBoard": {
      "id": "board-uuid",
      "title": "Sprint Planning",
      "isArchived": true,
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
  }
}
```

**Notes**:

- Archived boards are hidden from workspace board lists
- Board data is preserved and can be unarchived
- OBSERVER cannot archive boards

**Error Cases**:

- `404 Not Found` - Board does not exist
- `403 Forbidden` - User does not have edit permission

---

### Unarchive Board

Restore an archived board.

**Mutation**: `unarchiveBoard`

**Permissions**: User must be ADMIN or MEMBER of the board

**GraphQL Query**:

```graphql
mutation UnarchiveBoard($id: ID!) {
  unarchiveBoard(id: $id) {
    id
    title
    isArchived
    members {
      id
      userId
      role
      user {
        id
        email
        name
      }
    }
    updatedAt
  }
}
```

**Variables**:

```json
{
  "id": "board-uuid"
}
```

**Response**:

```json
{
  "data": {
    "unarchiveBoard": {
      "id": "board-uuid",
      "title": "Sprint Planning",
      "isArchived": false,
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

**Error Cases**:

- `404 Not Found` - Board does not exist
- `403 Forbidden` - User does not have edit permission

---

### Add Board Member

Add a member to a board.

**Mutation**: `addBoardMember`

**Permissions**: Only board ADMIN can add members

**GraphQL Query**:

```graphql
mutation AddBoardMember($input: AddBoardMemberInput!) {
  addBoardMember(input: $input) {
    id
    boardId
    userId
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
  "input": {
    "boardId": "board-uuid",
    "userId": "user-uuid",
    "role": "MEMBER"
  }
}
```

> **Note**: `role` is optional, defaults to `MEMBER`. Available roles: `ADMIN`, `MEMBER`, `OBSERVER`

**Response**:

```json
{
  "data": {
    "addBoardMember": {
      "id": "member-uuid",
      "boardId": "board-uuid",
      "userId": "user-uuid",
      "role": "MEMBER",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      }
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
    "query": "mutation AddBoardMember($input: AddBoardMemberInput!) { addBoardMember(input: $input) { id userId role user { id email name } } }",
    "variables": {
      "input": {
        "boardId": "board-uuid",
        "userId": "user-uuid",
        "role": "MEMBER"
      }
    }
  }'
```

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the board
- `404 Not Found` - Board or user not found
- `409 Conflict` - User is already a member of the board

---

### Remove Board Member

Remove a member from a board.

**Mutation**: `removeBoardMember`

**Permissions**: Only board ADMIN can remove members

**GraphQL Query**:

```graphql
mutation RemoveBoardMember($boardId: ID!, $userId: ID!) {
  removeBoardMember(boardId: $boardId, userId: $userId)
}
```

**Variables**:

```json
{
  "boardId": "board-uuid",
  "userId": "user-uuid"
}
```

**Response**:

```json
{
  "data": {
    "removeBoardMember": true
  }
}
```

**Notes**:

- Cannot remove the last ADMIN (must assign another admin first)
- Removed member loses all access to the board

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the board
- `404 Not Found` - Board or member not found
- `403 Forbidden` - Cannot remove the last administrator

---

### Update Board Member Role

Update a member's role in a board.

**Mutation**: `updateBoardMemberRole`

**Permissions**: Only board ADMIN can update roles

**GraphQL Query**:

```graphql
mutation UpdateBoardMemberRole($input: UpdateBoardMemberRoleInput!) {
  updateBoardMemberRole(input: $input)
}
```

**Variables**:

```json
{
  "input": {
    "boardId": "board-uuid",
    "userId": "user-uuid",
    "role": "ADMIN"
  }
}
```

**Response**:

```json
{
  "data": {
    "updateBoardMemberRole": true
  }
}
```

**Notes**:

- Cannot change the last ADMIN to another role
- Available roles: `ADMIN`, `MEMBER`, `OBSERVER`

**Error Cases**:

- `403 Forbidden` - User is not an ADMIN of the board
- `404 Not Found` - Board or member not found
- `403 Forbidden` - Cannot change the last administrator role

---

## Board Types

### Board

```graphql
type Board {
  id: ID!
  workspaceId: ID
  title: String!
  description: String
  visibility: Visibility!
  background: String
  isArchived: Boolean!
  creatorId: ID!
  members: [BoardMemberWithUser!]
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

> **Note**: `members` field contains all board members with their user information and roles

### CreateBoardInput

```graphql
input CreateBoardInput {
  title: String!
  description: String
  workspaceId: ID
  visibility: Visibility
  background: String
}
```

### UpdateBoardInput

```graphql
input UpdateBoardInput {
  id: ID!
  title: String
  description: String
  visibility: Visibility
  background: String
}
```

### AddBoardMemberInput

```graphql
input AddBoardMemberInput {
  boardId: ID!
  userId: ID!
  role: String
}
```

> **Note**: `role` is optional, defaults to `MEMBER`

### UpdateBoardMemberRoleInput

```graphql
input UpdateBoardMemberRoleInput {
  boardId: ID!
  userId: ID!
  role: String!
}
```

### BoardMemberWithUser

```graphql
type BoardMemberWithUser {
  id: ID!
  boardId: ID!
  userId: ID!
  role: String!
  joinedAt: DateTime!
  user: MemberUser!
}
```

---

## Role-Based Access Control

### Roles

- **ADMIN**: Full control over workspace/board (invite, remove, update roles, delete)
- **MEMBER**: Can view and edit content, create boards
- **OBSERVER**: Read-only access (cannot create or edit)

### Permission Matrix - Workspaces

| Action           | ADMIN | MEMBER | OBSERVER |
| ---------------- | ----- | ------ | -------- |
| View workspace   | ✓     | ✓      | ✓        |
| Edit workspace   | ✓     | ✗      | ✗        |
| Delete workspace | ✓     | ✗      | ✗        |
| Invite members   | ✓     | ✗      | ✗        |
| Remove members   | ✓     | ✗      | ✗        |
| Update roles     | ✓     | ✗      | ✗        |
| Create boards    | ✓     | ✓      | ✗        |
| Leave workspace  | ✓\*   | ✓      | ✓        |

> **Note**: \*ADMINs cannot leave if they are the last admin. They must assign another admin first.

### Permission Matrix - Boards

| Action             | ADMIN | MEMBER | OBSERVER |
| ------------------ | ----- | ------ | -------- |
| View board         | ✓     | ✓      | ✓        |
| Edit board         | ✓     | ✓      | ✗        |
| Delete board       | ✓     | ✗      | ✗        |
| Archive            | ✓     | ✓      | ✗        |
| Unarchive          | ✓     | ✓      | ✗        |
| Add members        | ✓     | ✗      | ✗        |
| Remove members     | ✓     | ✗      | ✗        |
| Update member role | ✓     | ✗      | ✗        |

### Board Visibility

- **PRIVATE**: Only board members can view
- **WORKSPACE**: All workspace members can view
- **PUBLIC**: Anyone can view (even without authentication)

---

## Board Management Examples

### Complete Board Workflow with Members

1. **Create a board:**

```graphql
mutation {
  createBoard(
    input: {
      title: "Sprint Planning"
      workspaceId: "workspace-uuid"
      visibility: WORKSPACE
    }
  ) {
    id
    title
    members {
      id
      userId
      role
      user {
        id
        email
        name
      }
    }
  }
}
```

2. **Get board with all members:**

```graphql
query {
  board(id: "board-uuid") {
    id
    title
    visibility
    members {
      id
      userId
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
}
```

3. **Add a member to the board:**

```graphql
mutation {
  addBoardMember(
    input: { boardId: "board-uuid", userId: "user-uuid-2", role: MEMBER }
  ) {
    id
    userId
    role
    user {
      id
      email
      name
    }
  }
}
```

4. **Update a member's role:**

```graphql
mutation {
  updateBoardMemberRole(
    input: { boardId: "board-uuid", userId: "user-uuid-2", role: ADMIN }
  )
}
```

5. **List all boards in workspace with members:**

```graphql
query {
  workspaceBoards(workspaceId: "workspace-uuid") {
    id
    title
    members {
      id
      userId
      role
      user {
        id
        email
        name
      }
    }
  }
}
```

---

## Lists

Lists represent columns within a board. They contain cards and can be reordered by position.

### Create List

Create a new list in a board. Position is automatically calculated if not provided.

**Mutation**: `createList`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation CreateList($input: CreateListInput!) {
  createList(input: $input) {
    id
    boardId
    title
    position
    isArchived
    createdAt
    updatedAt
  }
}
```

**Variables**:

```json
{
  "input": {
    "boardId": "board-uuid",
    "title": "To Do",
    "position": 0
  }
}
```

> **Note**: `position` is optional. If not provided, it will be automatically calculated as the next available position.

**Response**:

```json
{
  "data": {
    "createList": {
      "id": "list-uuid",
      "boardId": "board-uuid",
      "title": "To Do",
      "position": 0,
      "isArchived": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Notes**:

- Position is automatically calculated as the maximum position + 1 if not provided
- User must have access to the board (member, workspace member, or board is public)
- Cards are automatically deleted when a list is deleted (cascade delete)

**Error Cases**:

- `403 Forbidden` - User does not have access to the board
- `404 Not Found` - Board does not exist

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation CreateList($input: CreateListInput!) { createList(input: $input) { id title position } }",
    "variables": {
      "input": {
        "boardId": "board-uuid",
        "title": "To Do"
      }
    }
  }'
```

---

### Get List by ID

Get a specific list by ID with its cards.

**Query**: `list`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
query List($id: ID!) {
  list(id: $id) {
    id
    boardId
    title
    position
    isArchived
    createdAt
    updatedAt
  }
}
```

**Variables**:

```json
{
  "id": "list-uuid"
}
```

**Response**:

```json
{
  "data": {
    "list": {
      "id": "list-uuid",
      "boardId": "board-uuid",
      "title": "To Do",
      "position": 0,
      "isArchived": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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
    "query": "query List($id: ID!) { list(id: $id) { id title position isArchived } }",
    "variables": {
      "id": "list-uuid"
    }
  }'
```

**Error Cases**:

- `404 Not Found` - List does not exist
- `403 Forbidden` - User does not have access to the board

---

### Update List

Update a list's title or position.

**Mutation**: `updateList`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation UpdateList($input: UpdateListInput!) {
  updateList(input: $input) {
    id
    boardId
    title
    position
    isArchived
    updatedAt
  }
}
```

**Variables**:

```json
{
  "input": {
    "id": "list-uuid",
    "title": "Updated List Title",
    "position": 1
  }
}
```

> **Note**: All fields except `id` are optional. Update only the fields you want to change.

**Response**:

```json
{
  "data": {
    "updateList": {
      "id": "list-uuid",
      "boardId": "board-uuid",
      "title": "Updated List Title",
      "position": 1,
      "isArchived": false,
      "updatedAt": "2024-01-10T00:00:00.000Z"
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
    "query": "mutation UpdateList($input: UpdateListInput!) { updateList(input: $input) { id title position } }",
    "variables": {
      "input": {
        "id": "list-uuid",
        "title": "Updated Title"
      }
    }
  }'
```

**Error Cases**:

- `404 Not Found` - List does not exist
- `403 Forbidden` - User does not have access to the board

---

### Delete List

Permanently delete a list. All cards in the list are automatically deleted via cascade.

**Mutation**: `deleteList`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation DeleteList($id: ID!) {
  deleteList(id: $id)
}
```

**Variables**:

```json
{
  "id": "list-uuid"
}
```

**Response**:

```json
{
  "data": {
    "deleteList": true
  }
}
```

**Notes**:

- Permanently deletes the list and all associated cards
- This action is irreversible
- Cards are automatically deleted via database cascade

**Error Cases**:

- `404 Not Found` - List does not exist
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation DeleteList($id: ID!) { deleteList(id: $id) }",
    "variables": {
      "id": "list-uuid"
    }
  }'
```

---

### Reorder Lists

Update positions for multiple lists at once. All lists must belong to the same board.

**Mutation**: `reorderLists`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation ReorderLists($input: ReorderListsInput!) {
  reorderLists(input: $input) {
    id
    title
    position
  }
}
```

**Variables**:

```json
{
  "input": {
    "boardId": "board-uuid",
    "listPositions": [
      {
        "id": "list-uuid-1",
        "position": 0
      },
      {
        "id": "list-uuid-2",
        "position": 1
      },
      {
        "id": "list-uuid-3",
        "position": 2
      }
    ]
  }
}
```

**Response**:

```json
{
  "data": {
    "reorderLists": [
      {
        "id": "list-uuid-1",
        "title": "To Do",
        "position": 0
      },
      {
        "id": "list-uuid-2",
        "title": "In Progress",
        "position": 1
      },
      {
        "id": "list-uuid-3",
        "title": "Done",
        "position": 2
      }
    ]
  }
}
```

**Notes**:

- All lists must belong to the same board
- Positions are updated in a single transaction
- Returns lists ordered by position (ascending)

**Error Cases**:

- `404 Not Found` - One or more lists not found
- `400 Bad Request` - Lists belong to different boards
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation ReorderLists($input: ReorderListsInput!) { reorderLists(input: $input) { id position } }",
    "variables": {
      "input": {
        "boardId": "board-uuid",
        "listPositions": [
          { "id": "list-uuid-1", "position": 0 },
          { "id": "list-uuid-2", "position": 1 }
        ]
      }
    }
  }'
```

---

### Archive List

Archive a list (soft delete). Archived lists are hidden but can be restored.

**Mutation**: `archiveList`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation ArchiveList($id: ID!) {
  archiveList(id: $id) {
    id
    title
    position
    isArchived
    updatedAt
  }
}
```

**Variables**:

```json
{
  "id": "list-uuid"
}
```

**Response**:

```json
{
  "data": {
    "archiveList": {
      "id": "list-uuid",
      "title": "To Do",
      "position": 0,
      "isArchived": true,
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
  }
}
```

**Notes**:

- Archived lists are hidden from normal board views
- List data is preserved and can be restored
- Cards in archived lists remain accessible

**Error Cases**:

- `404 Not Found` - List does not exist
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation ArchiveList($id: ID!) { archiveList(id: $id) { id isArchived } }",
    "variables": {
      "id": "list-uuid"
    }
  }'
```

---

## List Types

### List

```graphql
type List {
  id: ID!
  boardId: ID!
  title: String!
  position: Int!
  isArchived: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### CreateListInput

```graphql
input CreateListInput {
  boardId: ID!
  title: String!
  position: Int
}
```

> **Note**: `position` is optional. If not provided, it will be automatically calculated.

### UpdateListInput

```graphql
input UpdateListInput {
  id: ID!
  title: String
  position: Int
}
```

> **Note**: All fields except `id` are optional.

### ReorderListsInput

```graphql
input ReorderListsInput {
  boardId: ID!
  listPositions: [ListPosition!]!
}

input ListPosition {
  id: ID!
  position: Int!
}
```

---

## List Management Examples

### Complete List Workflow

1. **Create a list:**

```graphql
mutation {
  createList(input: { boardId: "board-uuid", title: "To Do" }) {
    id
    title
    position
  }
}
```

2. **Get a list:**

```graphql
query {
  list(id: "list-uuid") {
    id
    title
    position
    isArchived
  }
}
```

3. **Update a list:**

```graphql
mutation {
  updateList(
    input: { id: "list-uuid", title: "Updated List Title", position: 1 }
  ) {
    id
    title
    position
  }
}
```

4. **Reorder multiple lists:**

```graphql
mutation {
  reorderLists(
    input: {
      boardId: "board-uuid"
      listPositions: [
        { id: "list-uuid-1", position: 0 }
        { id: "list-uuid-2", position: 1 }
        { id: "list-uuid-3", position: 2 }
      ]
    }
  ) {
    id
    title
    position
  }
}
```

5. **Archive a list:**

```graphql
mutation {
  archiveList(id: "list-uuid") {
    id
    isArchived
  }
}
```

6. **Delete a list:**

```graphql
mutation {
  deleteList(id: "list-uuid")
}
```

---

## Cards

Cards represent tasks within a list. They can be moved between lists, reordered, and assigned to members.

### Create Card

Create a new card in a list. Position is automatically calculated if not provided.

**Mutation**: `createCard`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation CreateCard($input: CreateCardInput!) {
  createCard(input: $input) {
    id
    listId
    title
    description
    coverUrl
    startDate
    dueDate
    position
    createdAt
    updatedAt
  }
}
```

**Variables**:

```json
{
  "input": {
    "listId": "list-uuid",
    "title": "Implement feature X",
    "description": "# Task Description\n\n**Priority**: High",
    "position": 0
  }
}
```

> **Note**: `position` is optional. If not provided, it will be automatically calculated as the next available position.
> **Note**: `description` supports markdown formatting.

**Response**:

```json
{
  "data": {
    "createCard": {
      "id": "card-uuid",
      "listId": "list-uuid",
      "title": "Implement feature X",
      "description": "# Task Description\n\n**Priority**: High",
      "coverUrl": null,
      "startDate": null,
      "dueDate": null,
      "position": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Notes**:

- Position is automatically calculated as the maximum position + 1 if not provided
- Description supports markdown formatting
- User must have access to the board (member, workspace member, or board is public)

**Error Cases**:

- `403 Forbidden` - User does not have access to the board
- `404 Not Found` - List does not exist

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation CreateCard($input: CreateCardInput!) { createCard(input: $input) { id title position } }",
    "variables": {
      "input": {
        "listId": "list-uuid",
        "title": "New Card"
      }
    }
  }'
```

---

### Get Card by ID

Get a specific card by ID.

**Query**: `card`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
query Card($id: ID!) {
  card(id: $id) {
    id
    listId
    title
    description
    coverUrl
    startDate
    dueDate
    position
    createdAt
    updatedAt
  }
}
```

**Variables**:

```json
{
  "id": "card-uuid"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query Card($id: ID!) { card(id: $id) { id title description position } }",
    "variables": {
      "id": "card-uuid"
    }
  }'
```

**Error Cases**:

- `404 Not Found` - Card does not exist
- `403 Forbidden` - User does not have access to the board

---

### Update Card

Update a card's properties including title, description, dates, and position.

**Mutation**: `updateCard`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation UpdateCard($input: UpdateCardInput!) {
  updateCard(input: $input) {
    id
    title
    description
    coverUrl
    startDate
    dueDate
    position
    updatedAt
  }
}
```

**Variables**:

```json
{
  "input": {
    "id": "card-uuid",
    "title": "Updated Card Title",
    "description": "# Updated Description\n\nWith **markdown** support",
    "dueDate": "2024-12-31T23:59:59Z",
    "position": 1
  }
}
```

> **Note**: All fields except `id` are optional. Update only the fields you want to change.
> **Note**: `description` supports markdown formatting.

**Response**:

```json
{
  "data": {
    "updateCard": {
      "id": "card-uuid",
      "title": "Updated Card Title",
      "description": "# Updated Description\n\nWith **markdown** support",
      "position": 1,
      "updatedAt": "2024-01-10T00:00:00.000Z"
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
    "query": "mutation UpdateCard($input: UpdateCardInput!) { updateCard(input: $input) { id title description } }",
    "variables": {
      "input": {
        "id": "card-uuid",
        "title": "Updated Title"
      }
    }
  }'
```

**Error Cases**:

- `404 Not Found` - Card does not exist
- `403 Forbidden` - User does not have access to the board

---

### Delete Card

Permanently delete a card.

**Mutation**: `deleteCard`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation DeleteCard($id: ID!) {
  deleteCard(id: $id)
}
```

**Variables**:

```json
{
  "id": "card-uuid"
}
```

**Response**:

```json
{
  "data": {
    "deleteCard": true
  }
}
```

**Notes**:

- Permanently deletes the card
- This action is irreversible

**Error Cases**:

- `404 Not Found` - Card does not exist
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation DeleteCard($id: ID!) { deleteCard(id: $id) }",
    "variables": {
      "id": "card-uuid"
    }
  }'
```

---

### Move Card

Move a card to a different list within the same board. Position is automatically calculated if not provided.

**Mutation**: `moveCard`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation MoveCard($input: MoveCardInput!) {
  moveCard(input: $input) {
    id
    listId
    title
    position
  }
}
```

**Variables**:

```json
{
  "input": {
    "cardId": "card-uuid",
    "targetListId": "list-uuid-2",
    "position": 0
  }
}
```

> **Note**: `position` is optional. If not provided, it will be automatically calculated.
> **Note**: Cards can only be moved within the same board.

**Response**:

```json
{
  "data": {
    "moveCard": {
      "id": "card-uuid",
      "listId": "list-uuid-2",
      "title": "Card Title",
      "position": 0
    }
  }
}
```

**Notes**:

- Cards can only be moved between lists within the same board
- Position is automatically calculated as the maximum position + 1 if not provided

**Error Cases**:

- `404 Not Found` - Card or target list does not exist
- `400 Bad Request` - Cannot move card between different boards
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation MoveCard($input: MoveCardInput!) { moveCard(input: $input) { id listId position } }",
    "variables": {
      "input": {
        "cardId": "card-uuid",
        "targetListId": "list-uuid-2"
      }
    }
  }'
```

---

### Reorder Cards

Update positions for multiple cards within the same list. All cards must belong to the same list.

**Mutation**: `reorderCards`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation ReorderCards($input: ReorderCardsInput!) {
  reorderCards(input: $input) {
    id
    title
    position
  }
}
```

**Variables**:

```json
{
  "input": {
    "listId": "list-uuid",
    "cardPositions": [
      {
        "id": "card-uuid-1",
        "position": 0
      },
      {
        "id": "card-uuid-2",
        "position": 1
      },
      {
        "id": "card-uuid-3",
        "position": 2
      }
    ]
  }
}
```

**Response**:

```json
{
  "data": {
    "reorderCards": [
      {
        "id": "card-uuid-1",
        "title": "Card 1",
        "position": 0
      },
      {
        "id": "card-uuid-2",
        "title": "Card 2",
        "position": 1
      },
      {
        "id": "card-uuid-3",
        "title": "Card 3",
        "position": 2
      }
    ]
  }
}
```

**Notes**:

- All cards must belong to the same list
- Positions are updated in a single transaction
- Returns cards ordered by position (ascending)

**Error Cases**:

- `404 Not Found` - One or more cards not found
- `400 Bad Request` - Cards belong to different lists
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation ReorderCards($input: ReorderCardsInput!) { reorderCards(input: $input) { id position } }",
    "variables": {
      "input": {
        "listId": "list-uuid",
        "cardPositions": [
          { "id": "card-uuid-1", "position": 0 },
          { "id": "card-uuid-2", "position": 1 }
        ]
      }
    }
  }'
```

---

### Assign Member to Card

Assign a user to a card. The user will receive notifications related to the card.

**Mutation**: `assignMemberToCard`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation AssignMemberToCard($input: AssignMemberToCardInput!) {
  assignMemberToCard(input: $input) {
    id
    title
    listId
  }
}
```

**Variables**:

```json
{
  "input": {
    "cardId": "card-uuid",
    "userId": "user-uuid"
  }
}
```

**Response**:

```json
{
  "data": {
    "assignMemberToCard": {
      "id": "card-uuid",
      "title": "Card Title",
      "listId": "list-uuid"
    }
  }
}
```

**Notes**:

- User must exist in the system
- User cannot be assigned twice to the same card
- Assigned users can view and interact with the card

**Error Cases**:

- `404 Not Found` - Card or user does not exist
- `409 Conflict` - User is already assigned to this card
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation AssignMemberToCard($input: AssignMemberToCardInput!) { assignMemberToCard(input: $input) { id title } }",
    "variables": {
      "input": {
        "cardId": "card-uuid",
        "userId": "user-uuid"
      }
    }
  }'
```

---

### Unassign Member from Card

Remove a user assignment from a card.

**Mutation**: `unassignMemberFromCard`

**Permissions**: User must have access to the board

**GraphQL Query**:

```graphql
mutation UnassignMemberFromCard($input: UnassignMemberFromCardInput!) {
  unassignMemberFromCard(input: $input) {
    id
    title
    listId
  }
}
```

**Variables**:

```json
{
  "input": {
    "cardId": "card-uuid",
    "userId": "user-uuid"
  }
}
```

**Response**:

```json
{
  "data": {
    "unassignMemberFromCard": {
      "id": "card-uuid",
      "title": "Card Title",
      "listId": "list-uuid"
    }
  }
}
```

**Error Cases**:

- `404 Not Found` - Card does not exist
- `404 Not Found` - User is not assigned to this card
- `403 Forbidden` - User does not have access to the board

**cURL Example**:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation UnassignMemberFromCard($input: UnassignMemberFromCardInput!) { unassignMemberFromCard(input: $input) { id title } }",
    "variables": {
      "input": {
        "cardId": "card-uuid",
        "userId": "user-uuid"
      }
    }
  }'
```

---

## Card Types

### Card

```graphql
type Card {
  id: ID!
  listId: ID!
  title: String!
  description: String
  coverUrl: String
  startDate: DateTime
  dueDate: DateTime
  position: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### CreateCardInput

```graphql
input CreateCardInput {
  listId: ID!
  title: String!
  description: String
  coverUrl: String
  startDate: DateTime
  dueDate: DateTime
  position: Float
}
```

> **Note**: `position` is optional. If not provided, it will be automatically calculated.
> **Note**: `description` supports markdown formatting.

### UpdateCardInput

```graphql
input UpdateCardInput {
  id: ID!
  title: String
  description: String
  coverUrl: String
  startDate: DateTime
  dueDate: DateTime
  position: Float
}
```

> **Note**: All fields except `id` are optional.
> **Note**: `description` supports markdown formatting.

### MoveCardInput

```graphql
input MoveCardInput {
  cardId: ID!
  targetListId: ID!
  position: Float
}
```

> **Note**: `position` is optional. If not provided, it will be automatically calculated.
> **Note**: Cards can only be moved within the same board.

### ReorderCardsInput

```graphql
input ReorderCardsInput {
  listId: ID!
  cardPositions: [CardPosition!]!
}

input CardPosition {
  id: ID!
  position: Float!
}
```

### AssignMemberToCardInput

```graphql
input AssignMemberToCardInput {
  cardId: ID!
  userId: ID!
}
```

### UnassignMemberFromCardInput

```graphql
input UnassignMemberFromCardInput {
  cardId: ID!
  userId: ID!
}
```

---

## Card Management Examples

### Complete Card Workflow

1. **Create a card:**

```graphql
mutation {
  createCard(
    input: {
      listId: "list-uuid"
      title: "Implement feature"
      description: "# Feature Description\n\n**Priority**: High"
    }
  ) {
    id
    title
    position
  }
}
```

2. **Get a card:**

```graphql
query {
  card(id: "card-uuid") {
    id
    title
    description
    position
  }
}
```

3. **Update a card:**

```graphql
mutation {
  updateCard(
    input: {
      id: "card-uuid"
      title: "Updated Card Title"
      description: "# Updated\n\nWith **markdown**"
      dueDate: "2024-12-31T23:59:59Z"
    }
  ) {
    id
    title
    description
  }
}
```

4. **Move a card to another list:**

```graphql
mutation {
  moveCard(input: { cardId: "card-uuid", targetListId: "list-uuid-2" }) {
    id
    listId
    position
  }
}
```

5. **Reorder cards within a list:**

```graphql
mutation {
  reorderCards(
    input: {
      listId: "list-uuid"
      cardPositions: [
        { id: "card-uuid-1", position: 0 }
        { id: "card-uuid-2", position: 1 }
        { id: "card-uuid-3", position: 2 }
      ]
    }
  ) {
    id
    position
  }
}
```

6. **Assign a member to a card:**

```graphql
mutation {
  assignMemberToCard(input: { cardId: "card-uuid", userId: "user-uuid" }) {
    id
    title
  }
}
```

7. **Unassign a member from a card:**

```graphql
mutation {
  unassignMemberFromCard(input: { cardId: "card-uuid", userId: "user-uuid" }) {
    id
    title
  }
}
```

8. **Delete a card:**

```graphql
mutation {
  deleteCard(id: "card-uuid")
}
```

---

## Support

For issues or questions, please refer to:

- [GraphQL Documentation](https://graphql.org/learn/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
