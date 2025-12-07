# Epitrello

![CI](https://github.com/mpJunot/Epitrello/workflows/CI/badge.svg)

Epitrello is an online project management tool inspired by Toyota's Kanban methodology. It enables teams to organize work into boards, lists, and cards, facilitating task tracking and collaboration.

## Overview

Epitrello provides a flexible project management platform where:

- Projects are organized into boards
- Boards contain lists representing workflow stages
- Lists contain cards representing individual tasks
- Cards can be assigned to team members and moved between lists to reflect progress

## Quick Start

### Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js 20+ (for local development)
- pnpm (package manager)

### Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Configure the `.env` file with your settings (see [DOCKER.md](./DOCKER.md) for details)

### Launch the Application

Start all services using Make:

```bash
make docker-start
```

Or using the script directly:

```bash
./scripts/docker-start-services.sh
```

This will:

- Verify Docker is running
- Check and create `.env` file if needed
- Build and start all services (PostgreSQL, Backend, Frontend)
- Wait for services to be ready
- Display service status and URLs

### Common Commands

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `make help`         | Display all available commands                 |
| `make setup`        | Complete project setup (install deps + Prisma) |
| `make docker-start` | Start all Docker services                      |
| `make docker-stop`  | Stop all Docker services                       |
| `make dev-backend`  | Start backend in development mode              |
| `make dev-frontend` | Start frontend in development mode             |
| `make test`         | Run all tests                                  |
| `make lint`         | Lint all code                                  |

For a complete list of commands, run `make help`.

For detailed Docker setup instructions, see [DOCKER.md](./DOCKER.md).

## Project Structure

```
Epitrello/
├── backend/          # NestJS GraphQL API
├── frontend/         # Next.js React application
├── docs/             # Project documentation
├── scripts/          # Utility scripts for Docker management
├── Makefile          # Development commands
├── docker-compose.yml # Docker orchestration
└── .github/          # GitHub Actions workflows
```

## Technology Stack

| Component      | Technologies                             |
| -------------- | ---------------------------------------- |
| Backend        | NestJS, GraphQL, PostgreSQL, Prisma ORM  |
| Frontend       | Next.js, React, TypeScript, Tailwind CSS |
| Infrastructure | Docker, Docker Compose                   |
| CI/CD          | GitHub Actions                           |

## Development

### Local Development Setup

#### Backend

See [backend/README.md](./backend/README.md) for detailed instructions.

#### Frontend

See [frontend/README.md](./frontend/README.md) for detailed instructions.

### Running Services Individually

| Service       | Make Command        | Direct Command                                            |
| ------------- | ------------------- | --------------------------------------------------------- |
| Database only | `make db-up`        | `docker-compose -f docker-compose.dev.yml up -d postgres` |
| Backend only  | `make dev-backend`  | `cd backend && pnpm start:dev`                            |
| Frontend only | `make dev-frontend` | `cd frontend && pnpm dev`                                 |

### Backend Docker + Frontend Local

To run the backend in Docker and frontend locally:

#### 1. Configure Environment Variables

**Root `.env` file:**

```env
# Database URL - Use "postgres" as hostname (Docker service name)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/epitrello?schema=public

# Backend Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# PostgreSQL Configuration
POSTGRES_DB=epitrello
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

**`frontend/.env.local` file:**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

#### 2. Start Services

```bash
# Start backend in Docker (includes PostgreSQL)
make docker-backend

# In another terminal, start frontend locally
make dev-frontend
```

#### Important Configuration Notes

- **DATABASE_URL**: Use `postgres` as hostname (Docker service name), not `localhost`
- **FRONTEND_URL**: Must be `http://localhost:3000` to allow local frontend to connect
- **NEXT_PUBLIC_API_URL**: Use `http://localhost:4000/graphql` (backend exposed on localhost:4000)

The backend will be accessible at `http://localhost:4000/graphql` and the frontend at `http://localhost:3000`.

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

| Workflow     | File                                 | Description                                         |
| ------------ | ------------------------------------ | --------------------------------------------------- |
| CI           | `.github/workflows/ci.yml`           | Runs tests, linting, and builds on every push/PR    |
| Docker Build | `.github/workflows/docker-build.yml` | Builds and pushes Docker images                     |
| Code Quality | `.github/workflows/code-quality.yml` | Checks code formatting and Prisma schema validation |
| Release      | `.github/workflows/release.yml`      | Creates GitHub releases on version tags             |

For more details, see [.github/workflows/README.md](./.github/workflows/README.md).

## Documentation

| Document                                          | Description                               |
| ------------------------------------------------- | ----------------------------------------- |
| [API Documentation](./docs/API.md)                | GraphQL API reference and examples        |
| [Docker Setup](./DOCKER.md)                       | Docker configuration and deployment guide |
| [Development Tasks](./TASKS.md)                   | Prioritized development task list         |
| [Backend Architecture](./backend/ARCHITECTURE.md) | Backend architecture overview             |

## License

This project is private and proprietary.
