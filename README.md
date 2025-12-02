# Epitrello

EpiTrello is an online project management tool, inspired by Toyota's Kanban method.

It is based on the organization of projects into boards listing cards, each representing tasks.
Cards are assignable to users and are movable from one board to another, reflecting their progress.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- `.env` file configured (see `.env.example`)

### Launch the Application

```bash
./start.sh
```

This script will:

- Check if `.env` file exists (create from `.env.example` if needed)
- Verify Docker is running
- Build and start all services (PostgreSQL, Backend, Frontend)
- Wait for PostgreSQL to be ready
- Display service status and URLs

### Other Scripts

- **Stop**: `./stop.sh` - Stop all services
- **Restart**: `./restart.sh` - Restart all services

For more details, see [DOCKER.md](./DOCKER.md).

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

- **CI** (`.github/workflows/ci.yml`) - Runs tests, linting, and builds on every push/PR
- **Docker Build** (`.github/workflows/docker-build.yml`) - Builds and pushes Docker images
- **Code Quality** (`.github/workflows/code-quality.yml`) - Checks code formatting and Prisma schema
- **Release** (`.github/workflows/release.yml`) - Creates GitHub releases on version tags

### Status Badge

![CI](https://github.com/mpJunot/Epitrello/workflows/CI/badge.svg)

For more details, see [.github/workflows/README.md](./.github/workflows/README.md).
