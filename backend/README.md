# Epitrello Backend

Backend API built with NestJS, GraphQL, Prisma, and PostgreSQL.

## Tech Stack

- NestJS - Node.js framework
- GraphQL - API with Apollo Server
- Prisma - ORM for database access
- PostgreSQL - Database
- JWT - Authentication
- TypeScript

## Prerequisites

- Node.js >= 18.x
- pnpm >= 8.x
- Docker and Docker Compose

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/epitrello?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Setup Database

```bash
pnpm prisma:generate
pnpm prisma db push
```

### 5. Start Application

```bash
pnpm start:dev
```

API available at: `http://localhost:4000/graphql`

## Available Scripts

| Script                 | Description              |
| ---------------------- | ------------------------ |
| `pnpm start:dev`       | Start development server |
| `pnpm build`           | Build the application    |
| `pnpm test`            | Run tests                |
| `pnpm lint`            | Lint code                |
| `pnpm prisma:generate` | Generate Prisma Client   |
| `pnpm prisma:studio`   | Open Prisma Studio       |

## GraphQL API

### Authentication

#### Register

```graphql
mutation {
  register(input: { email: "user@example.com", name: "John Doe", password: "password123" }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

#### Login

```graphql
mutation {
  login(input: { email: "user@example.com", password: "password123" }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

### Users

#### Get All Users

```graphql
query {
  users {
    id
    email
    name
    avatar
  }
}
```

#### Get User by ID

```graphql
query {
  user(id: "user-id") {
    id
    email
    name
  }
}
```

#### Create User

```graphql
mutation {
  createUser(input: { email: "new@example.com", name: "New User", password: "password123" }) {
    id
    email
    name
  }
}
```

#### Update User

```graphql
mutation {
  updateUser(id: "user-id", input: { name: "Updated Name" }) {
    id
    email
    name
  }
}
```

#### Delete User

```graphql
mutation {
  deleteUser(id: "user-id")
}
```

## Authentication

Include JWT token in HTTP Headers:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## Environment Variables

| Variable         | Description                  | Default                 |
| ---------------- | ---------------------------- | ----------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | -                       |
| `JWT_SECRET`     | Secret key for JWT signing   | -                       |
| `JWT_EXPIRES_IN` | JWT token expiration time    | `7d`                    |
| `PORT`           | Server port                  | `4000`                  |
| `NODE_ENV`       | Environment                  | `development`           |
| `FRONTEND_URL`   | Frontend URL for CORS        | `http://localhost:3000` |

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres
```
