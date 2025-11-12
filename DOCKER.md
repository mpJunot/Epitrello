# Docker Setup for Epitrello

This document explains how to build and run the Epitrello application using Docker.

## Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

## Project Structure

```
Epitrello/
├── docker-compose.yml      # Main orchestration file
├── backend/
│   ├── Dockerfile         # Backend container definition
│   └── .dockerignore      # Files to exclude from build
└── frontend/
    ├── Dockerfile         # Frontend container definition
    └── .dockerignore      # Files to exclude from build
```

## Quick Start

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration values.

### 2. Build and Start All Services

From the root directory:

```bash
docker-compose up -d --build
```

This will:

- Build the backend image
- Build the frontend image
- Start PostgreSQL database
- Start backend service
- Start frontend service

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Stop Services

```bash
docker-compose down
```

### 5. Stop and Remove Volumes

```bash
docker-compose down -v
```

## Services

### PostgreSQL

- **Port**: Configured via `POSTGRES_PORT` in `.env`
- **Database**: Configured via `POSTGRES_DB` in `.env`
- **User**: Configured via `POSTGRES_USER` in `.env`
- **Password**: Configured via `POSTGRES_PASSWORD` in `.env`
- **Volume**: postgres_data (persistent)

### Backend

- **Port**: Configured via `PORT` in `.env`
- **URL**: http://localhost:${PORT}
- **GraphQL**: http://localhost:${PORT}/graphql
- **Environment**: Configured via `NODE_ENV` in `.env`
- **Depends on**: PostgreSQL

### Frontend

- **Port**: Configured via `FRONTEND_PORT` in `.env`
- **URL**: http://localhost:${FRONTEND_PORT}
- **Environment**: Configured via `NODE_ENV` in `.env`
- **Depends on**: Backend

## Environment Variables

All services use the `.env` file from the root directory. Create a `.env` file at the root of the project with the following content:

```env
# PostgreSQL Configuration
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=dbname
POSTGRES_PORT=5432

# Database URL
# For Docker: use 'postgres' as hostname
# For local development: use 'localhost' as hostname
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# JWT Configuration (SENSITIVE - Change in production!)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Backend Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

**Important**:

- All variables must be defined in the `.env` file (no default values in docker-compose.yml)
- The `DATABASE_URL` must use `postgres` as the hostname (not `localhost`) to connect to the PostgreSQL service within Docker
- For local development (outside Docker), use `localhost` instead of `postgres` in the `DATABASE_URL`
- All sensitive information (passwords, secrets) should be in the `.env` file, never hardcoded
- Copy `.env.example` to `.env` and update with your values

The docker-compose.yml will:

- Load all variables from `.env` (root directory) via `env_file` for each service
- Use variables directly without default values (variables must be defined)

## Development vs Production

### Development

For development, it's recommended to run services locally:

```bash
# Backend
cd backend
pnpm install
pnpm start:dev

# Frontend
cd frontend
pnpm install
pnpm dev

# Database
docker-compose up -d postgres
```

### Production

Use Docker Compose for production:

```bash
docker-compose up -d --build
```

## Database Migrations

When starting the backend for the first time, you need to run migrations:

```bash
# Enter backend container
docker-compose exec backend sh

# Run migrations
pnpm prisma migrate deploy
# Or for development
pnpm prisma db push
```

## Troubleshooting

### Backend can't connect to database

Check that PostgreSQL is healthy:

```bash
docker-compose ps postgres
```

Wait for the health check to pass before starting the backend.

### Port already in use

If ports are already in use, modify the port values in your `.env` file:

```env
POSTGRES_PORT=5433
PORT=4001
FRONTEND_PORT=3001
```

Then restart the services:

```bash
docker-compose down
docker-compose up -d
```

### Rebuild after code changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose up -d --build
```

### View container status

```bash
docker-compose ps
```

### Access container shell

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U postgres -d epitrello
```

## Clean Up

Remove all containers, networks, and volumes:

```bash
docker-compose down -v --rmi all
```

## Security

### Scanning for Vulnerabilities

Scan your Docker images for security vulnerabilities:

```bash
# Using Docker Scout (recommended)
docker scout cves epitrello-backend
docker scout cves epitrello-frontend

# Using Trivy
trivy image epitrello-backend
trivy image epitrello-frontend

# Using Grype
grype epitrello-backend
grype epitrello-frontend
```

### Security Best Practices

- All sensitive data in `.env` file (never hardcoded)
- `.env` file is in `.gitignore` (never committed)
- Use strong passwords and secrets in production
- Regularly update dependencies
- Scan images for vulnerabilities

### Updating Dependencies

Regularly update dependencies to fix vulnerabilities:

```bash
# Backend
cd backend
pnpm update
pnpm audit fix

# Frontend
cd frontend
pnpm update
pnpm audit fix
```

### Rebuilding After Updates

After updating dependencies, rebuild images:

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production deployment:

1. Set strong `JWT_SECRET` in environment
2. Use production database credentials
3. Configure proper CORS settings
4. Set `NODE_ENV=production`
5. Use reverse proxy (nginx) for SSL/TLS
6. Configure proper logging
7. Set up monitoring and health checks
8. Regularly scan and update images for security vulnerabilities
9. Use Docker content trust for image verification
10. Implement network policies and firewall rules
