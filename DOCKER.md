# Docker Setup for Epitrello

This guide explains how to run the Epitrello application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd Epitrello
```

2. Configure environment variables (one-time):
```bash
cp .env.example .env
# edit .env and set secure values (especially passwords and JWT_SECRET)
```

3. Start all services:
```bash
docker compose up --build
```

4. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:4000
   - **MongoDB**: localhost:27017

## Services

### Frontend (Next.js)
- **Port**: 3000
- **Technology**: Next.js 15 with App Router
- **Build**: Multi-stage Docker build for optimal image size
- **Security**: Runs as non-root user (`node`)

### Backend (Node.js + Express)
- **Port**: 4000
- **Technology**: Node.js with Express and TypeScript
- **Build**: Compiled TypeScript to JavaScript
- **Security**: CORS configured for frontend access

### MongoDB
- **Port**: 27017
- **Version**: 7.0
- **Credentials**: Provided via environment variables in your `.env` file (see `.env.example`)
- **Data Persistence**: Data persists in Docker volume `mongodb_data`

⚠️ **Important**: Use strong credentials in `.env` before deploying to production!

## Docker Commands

### Start Services
```bash
# Start in foreground (see logs)
docker compose up

# Start in background (detached mode)
docker compose up -d

# Build and start
docker compose up --build
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes database data!)
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Rebuild Services
```bash
# Rebuild all
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache backend
docker compose up -d backend
```

### Check Service Status
```bash
# List running containers
docker compose ps

# Check health
docker compose exec mongodb mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin
```

## Development Workflow

### Making Changes

1. **Backend changes**:
```bash
# Edit files in backend/src/
docker compose build backend --no-cache
docker compose up -d backend
```

2. **Frontend changes**:
```bash
# Edit files in frontend/app/
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Accessing Container Shell
```bash
# Backend shell
docker compose exec backend sh

# Frontend shell
docker compose exec frontend sh

# MongoDB shell
docker compose exec mongodb mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin
```

## Environment Variables

Copy `.env.example` to `.env` and set values. The `docker-compose.yml` file reads variables from `.env`.

### MongoDB Configuration
- `MONGO_INITDB_ROOT_USERNAME`: MongoDB root username (default: admin)
- `MONGO_INITDB_ROOT_PASSWORD`: MongoDB root password (default: password123)
- `MONGO_INITDB_DATABASE`: Initial database name (default: epitrello)

### Backend Configuration
- `NODE_ENV`: Node environment (default: production)
- `PORT`: Backend server port (default: 4000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens

### Frontend Configuration
- `NODE_ENV`: Node environment (default: production)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:4000)

## Troubleshooting

### Port Already in Use
If you see "port is already allocated":
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :4000
sudo lsof -i :27017

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs for errors
docker compose logs <service-name>

# Remove all containers and volumes, start fresh
docker compose down -v
docker compose up --build
```

### Database Connection Fails
```bash
# Verify MongoDB is healthy
docker compose ps

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker compose exec mongodb mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin --eval "db.adminCommand({ ping: 1 })"
```

### Build Fails
```bash
# Clean build without cache
docker compose down
docker compose build --no-cache
docker compose up
```

### Frontend Shows Blank Page
```bash
# Check frontend logs
docker compose logs frontend

# Verify build was successful
docker compose exec frontend ls -la .next/standalone
```

## Production Deployment

Before deploying to production:

1. **Set strong credentials** in your `.env` file:
```yaml
MONGO_INITDB_ROOT_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-secret-min-32-chars>
```

2. **Generate secure values**:
```bash
# Generate random password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

3. **Update CORS origins** in `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

4. **Use environment-specific compose files**:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    HOST MACHINE                  │
│                                                  │
│  Browser → http://localhost:3000                │
│         → http://localhost:4000                  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │      Docker Network: epitrello-network    │  │
│  │                                           │  │
│  │  ┌──────────┐    ┌──────────┐            │  │
│  │  │ Frontend │◄───┤ Backend  │            │  │
│  │  │ Next.js  │    │ Node.js  │            │  │
│  │  │  :3000   │    │  :4000   │            │  │
│  │  └──────────┘    └────┬─────┘            │  │
│  │                       │                   │  │
│  │                       ▼                   │  │
│  │                  ┌──────────┐            │  │
│  │                  │ MongoDB  │            │  │
│  │                  │  :27017  │            │  │
│  │                  └──────────┘            │  │
│  │                       │                   │  │
│  │                       ▼                   │  │
│  │              [Persistent Volume]          │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Clean Up

To completely remove all Docker resources:

```bash
# Stop and remove containers, networks
docker compose down

# Remove volumes (⚠️ deletes all data)
docker compose down -v

# Remove images
docker compose down --rmi all

# Complete cleanup
docker system prune -a --volumes
```

## Support

For issues or questions:
- Check the [GitHub Issues](../../issues)
- Review logs: `docker compose logs -f`
- Verify all services are running: `docker compose ps`

## License

This project is open source and available under the [MIT License](../LICENSE).
