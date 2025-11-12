#!/bin/bash

# Epitrello Restart Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Restarting Epitrello...${NC}"

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Restart services
$COMPOSE_CMD restart

echo -e "${GREEN}Epitrello restarted!${NC}"

