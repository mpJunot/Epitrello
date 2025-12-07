# Epitrello Scripts

This directory contains utility scripts for managing the Epitrello application.

## Available Scripts

| Script                       | Description                                               |
| ---------------------------- | --------------------------------------------------------- |
| `docker-start-services.sh`   | Start all Docker services (PostgreSQL, Backend, Frontend) |
| `docker-stop-services.sh`    | Stop all Docker services                                  |
| `docker-restart-services.sh` | Restart all Docker services                               |

## Usage

All scripts should be executed from the project root directory:

```bash
# Start all services
./scripts/docker-start-services.sh

# Stop all services
./scripts/docker-stop-services.sh

# Restart all services
./scripts/docker-restart-services.sh
```

## Script Details

### docker-start-services.sh

This script:

- Verifies Docker is running
- Checks for `.env` file (creates from `.env.example` if missing)
- Builds and starts all Docker services
- Waits for PostgreSQL to be healthy
- Displays service status and URLs

### docker-stop-services.sh

This script:

- Stops all running Docker services
- Removes containers (keeps volumes)

### docker-restart-services.sh

This script:

- Restarts all running Docker services
- Useful for applying configuration changes without full rebuild

## Requirements

- Docker >= 20.10
- Docker Compose >= 2.0
- Bash shell

## Permissions

Make sure scripts are executable:

```bash
chmod +x scripts/*.sh
```
