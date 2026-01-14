# Epitrello Backend

Epitrello backend API built with NestJS, GraphQL, and Prisma.

## Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
```

## Tests

### Unit Tests

Tests services, resolvers, and utilities in isolation:

```bash
# Run unit tests
pnpm test:unit

# With coverage
pnpm test:unit:cov
```

### Integration Tests

Tests interactions between modules (specific E2E cases):

```bash
pnpm test:integration
```

### E2E Tests

Tests the full application with the database:

```bash
pnpm test:e2e
```

### All Tests

Run all test suites sequentially with a detailed report:

```bash
# Simple run
pnpm test:all

# With formatted report
pnpm test:all:report
```

### Other Test Commands

```bash
# All tests (unit + E2E)
pnpm test

# Tests with coverage
pnpm test:cov

# Watch mode
pnpm test:watch

# Debug mode
pnpm test:debug
```

## Test Coverage

The following modules require a minimum coverage threshold of **80%**:

- **Workspaces** (`workspaces.service.ts`)
- **Invitations** (`invitations.service.ts`)
- **Email** (`email.service.ts`)

Coverage is validated automatically in CI/CD pipelines.

## Development

```bash
# Development mode (watch)
pnpm start:dev

# Debug mode
pnpm start:debug

# Lint and format
pnpm lint
pnpm format

# Build
pnpm build

# Production
pnpm start:prod
```

## Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Create a migration
pnpm prisma:migrate

# Open Prisma Studio
pnpm prisma:studio
```

## Documentation

- [Architecture](./ARCHITECTURE.md) - Project structure
- [API Documentation](https://storage.googleapis.com/epitrello-481814-staging-epitrello-docs/index.html) - Hosted GraphQL reference
- [Local API Reference](../docs/API.md) - Local documentation source
- [Strategies Analysis](./src/modules/auth/STRATEGIES_ANALYSIS.md) - OAuth strategies analysis

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/epitrello"

# JWT
JWT_SECRET="your-secret-key"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@epitrello.com"

# Frontend
FRONTEND_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Docker

```bash
# Start the database
docker-compose up -d postgres

# Start all services
docker-compose up -d
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm start:dev` | Start in development mode |
| `pnpm build` | Build the application |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Unit tests only |
| `pnpm test:unit:cov` | Unit tests with coverage |
| `pnpm test:integration` | Integration tests |
| `pnpm test:e2e` | E2E tests |
| `pnpm test:all:report` | All tests with report |
| `pnpm lint` | Lint the code |
| `pnpm format` | Format the code |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate` | Run migrations |
| `pnpm prisma:studio` | Open Prisma Studio |

## Architecture

```
backend/
├── prisma/              # Prisma schema and migrations
├── scripts/             # Utility scripts
├── src/
│   ├── common/          # Decorators, guards, filters
│   ├── config/          # Configuration (JWT, DB, etc.)
│   ├── modules/
│   │   ├── auth/        # Authentication & OAuth
│   │   ├── boards/      # Boards management
│   │   ├── cards/       # Cards management
│   │   ├── checklists/  # Checklists for cards
│   │   ├── email/       # Email service
│   │   ├── invitations/ # Workspace invitations
│   │   ├── labels/      # Card labels
│   │   ├── lists/       # Lists management
│   │   ├── users/       # Users management
│   │   └── workspaces/  # Workspaces management
│   ├── prisma/          # Prisma module
│   └── graphql/         # Generated GraphQL schema
└── test/                # E2E tests
```

## Technologies

- **Framework**: NestJS
- **API**: GraphQL (Apollo)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + Passport
- **Email**: Resend
- **Tests**: Jest
- **Validation**: class-validator
- **TypeScript**: TypeScript

## Core Modules

### Auth
- Registration and login
- JWT authentication
- OAuth (Google, Microsoft, Apple, Slack)
- Password reset
- Email verification

### Boards
- CRUD operations
- Archive and restore
- Members and role management

### Lists
- CRUD operations
- Reordering and archiving

### Cards
- CRUD operations
- Move and reorder
- Member assignment
- Labels and checklists

### Labels
- Board-level labels
- Assign and remove labels on cards

### Checklists
- Checklist CRUD
- Checklist item CRUD and reorder

### Workspaces
- CRUD operations
- Role management (ADMIN, MEMBER, OBSERVER)
- Role-based permissions

### Invitations
- Invite members
- Accept and reject invitations
- Role assignment
- Invitation emails

### Email
- HTML templates
- Verification email
- Welcome email
- Workspace invitation email
- Password reset email

## Contribution

1. Fork the project
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

[MIT](../LICENSE)
