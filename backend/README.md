# Epitrello Backend

NestJS GraphQL API with PostgreSQL and Prisma.

## Setup

### Requirements
- Node.js 20+
- pnpm
- PostgreSQL

### Install
```bash
cd backend
pnpm install
```

### Database
Start PostgreSQL with Docker:
```bash
docker-compose up -d postgres
```

### Configure
Copy environment file:
```bash
cp .env.example .env
```

### Migrate Database
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

### Start
```bash
pnpm start:dev
```

Server runs at http://localhost:4000/graphql

## Commands

### Development
```bash
pnpm start:dev    # Start with hot reload
pnpm start        # Start normally
pnpm build        # Build for production
```

### Testing
```bash
pnpm test         # Run unit tests
pnpm test:e2e     # Run e2e tests
```

### Database
```bash
pnpm prisma generate    # Generate Prisma client
pnpm prisma migrate dev # Run migrations
pnpm prisma studio      # Open database GUI
```

### Code Quality
```bash
pnpm lint         # Fix code issues
pnpm format       # Format code
```

## Environment Variables
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/epitrello"
PORT=4000
NODE_ENV="development"
```

## Troubleshooting

### Database Issues
```bash
docker-compose restart postgres
pnpm prisma migrate reset
```

### Port Conflicts
```bash
lsof -ti:4000 | xargs kill -9
```

## Documentation
- API: http://localhost:4000/graphql (GraphQL Playground)
- Schema: [prisma/schema.prisma](./prisma/schema.prisma)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)

## Current Status
- Basic NestJS + GraphQL setup
- User authentication and management
- PostgreSQL with Prisma ORM
- Testing configured
