#!/bin/bash

# Epitrello Docker Services Startup Script
# This script starts all Docker services (PostgreSQL, Backend, Frontend)

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Epitrello Docker services...${NC}"

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}Please edit .env file with your configuration before continuing.${NC}"
        exit 1
    else
        echo -e "${RED}Error: .env.example file not found!${NC}"
        exit 1
    fi
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed.${NC}"
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Build and start services
echo -e "${GREEN}Building and starting services...${NC}"
$COMPOSE_CMD up -d --build

# Wait for PostgreSQL to be ready
echo -e "${GREEN}Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check if PostgreSQL is healthy
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if $COMPOSE_CMD ps postgres | grep -q "healthy"; then
        echo -e "${GREEN}PostgreSQL is ready!${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}Waiting for PostgreSQL... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}PostgreSQL failed to start.${NC}"
    exit 1
fi

# Load environment variables for display
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Show service status
echo -e "\n${GREEN}Service Status:${NC}"
$COMPOSE_CMD ps

echo -e "\n${GREEN}Epitrello is running!${NC}"
echo -e "${GREEN}Backend: http://localhost:${PORT:-4000}/graphql${NC}"
echo -e "${GREEN}Frontend: http://localhost:${FRONTEND_PORT:-3000}${NC}"
echo -e "\n${YELLOW}To view logs: $COMPOSE_CMD logs -f${NC}"
echo -e "${YELLOW}To stop: ./scripts/docker-stop-services.sh${NC}"

