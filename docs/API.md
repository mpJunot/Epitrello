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

## Mutations

### Authentication

#### Register

Create a new user account.

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
    "avatar": "https://example.com/avatar.jpg" // Optional
  }
}
```

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
- `INTERNAL_SERVER_ERROR` (500) - Server error

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
  companyName: String # Optional
}
```

### LoginInput

```graphql
input LoginInput {
  email: String!
  password: String!
  rememberMe: Boolean # Optional, default: false
}
```

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

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

## Best Practices

1. **Always use variables** instead of string interpolation in queries
2. **Store tokens securely** (never in localStorage for sensitive apps)
3. **Handle token expiration** - implement token refresh logic
4. **Use error handling** - check for errors in responses
5. **Validate inputs** - client-side validation before sending requests

## Support

For issues or questions, please refer to:

- [GraphQL Documentation](https://graphql.org/learn/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
