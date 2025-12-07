# Epitrello Backend

NestJS-based GraphQL API with PostgreSQL database and Prisma ORM.

## Architecture

| Component      | Technology              |
| -------------- | ----------------------- |
| Framework      | NestJS                  |
| API            | GraphQL (Apollo Server) |
| Database       | PostgreSQL              |
| ORM            | Prisma                  |
| Authentication | JWT (Passport.js)       |

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm package manager
- PostgreSQL database (via Docker or local installation)

### Installation

1. Install dependencies:

   ```bash
   cd backend
   pnpm install
   ```

2. Set up the database:

   ```bash
   # Using Docker (recommended)
   docker-compose -f ../docker-compose.dev.yml up -d postgres
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize the database:

   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   pnpm start:dev
   ```

The GraphQL API will be available at `http://localhost:4000/graphql`

## Available Commands

### Development

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm start:dev` | Start development server with hot reload |
| `pnpm start`     | Start production server                  |
| `pnpm build`     | Build the application for production     |

### Testing

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `pnpm test`       | Run unit tests                 |
| `pnpm test:watch` | Run tests in watch mode        |
| `pnpm test:cov`   | Run tests with coverage report |
| `pnpm test:e2e`   | Run end-to-end tests           |

### Database

| Command                      | Description                       |
| ---------------------------- | --------------------------------- |
| `pnpm prisma generate`       | Generate Prisma Client            |
| `pnpm prisma migrate dev`    | Create and apply migrations       |
| `pnpm prisma migrate deploy` | Apply migrations in production    |
| `pnpm prisma studio`         | Open Prisma Studio (database GUI) |

### Code Quality

| Command       | Description               |
| ------------- | ------------------------- |
| `pnpm lint`   | Run ESLint and fix issues |
| `pnpm format` | Format code with Prettier |

## Environment Variables

| Variable         | Description                  | Example                                                   |
| ---------------- | ---------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/epitrello` |
| `PORT`           | Server port                  | `4000`                                                    |
| `NODE_ENV`       | Environment mode             | `development` or `production`                             |
| `JWT_SECRET`     | Secret key for JWT tokens    | `your-secret-key`                                         |
| `JWT_EXPIRES_IN` | Token expiration time        | `7d`                                                      |
| `FRONTEND_URL`   | Frontend URL for CORS        | `http://localhost:3000`                                   |

See `.env.example` for the complete list of environment variables.

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

```bash
# Restart PostgreSQL container
docker-compose -f ../docker-compose.dev.yml restart postgres

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Regenerate Prisma Client
pnpm prisma generate
```

### Port Already in Use

If port 4000 is already in use:

```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9

# Or change the PORT in .env file
```

### Prisma Client Not Generated

If you see "PrismaClient is not generated" errors:

```bash
pnpm prisma generate
```

## API Documentation

- **GraphQL Playground**: http://localhost:4000/graphql (development only)
- **API Reference**: [../docs/API.md](../docs/API.md)
- **Schema Definition**: [prisma/schema.prisma](./prisma/schema.prisma)

## Architecture

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Current Implementation Status

- NestJS framework with GraphQL API
- User authentication with JWT
- User management (CRUD operations)
- PostgreSQL database with Prisma ORM
- GraphQL schema generation
- Testing framework configured
- Code quality tools (ESLint, Prettier)
