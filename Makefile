# ============================================================================
# Epitrello Makefile
# ============================================================================

.PHONY: help install setup docker-start docker-stop docker-restart \
	docker-backend docker-frontend dev-backend dev-frontend \
	build-backend build-frontend db-up db-down db-reset db-migrate \
	prisma-generate prisma-studio test test-backend test-e2e \
	lint lint-backend lint-frontend format format-backend \
	clean clean-backend clean-frontend

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
BACKEND_DIR = backend
FRONTEND_DIR = frontend
SCRIPTS_DIR = scripts

# Help
help: ## Display available commands
	@echo "Epitrello - Available Commands"
	@echo "=============================="
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup & Installation
install: install-backend install-frontend ## Install all dependencies
install-backend: ## Install backend dependencies
	cd $(BACKEND_DIR) && pnpm install --frozen-lockfile
install-frontend: ## Install frontend dependencies
	cd $(FRONTEND_DIR) && pnpm install --frozen-lockfile
setup: install prisma-generate ## Complete project setup

# Docker Services
docker-start: ## Start all Docker services
	@$(SCRIPTS_DIR)/docker-start-services.sh
docker-stop: ## Stop all Docker services
	@$(SCRIPTS_DIR)/docker-stop-services.sh
docker-restart: ## Restart all Docker services
	@$(SCRIPTS_DIR)/docker-restart-services.sh
docker-logs: ## View logs from all Docker services
	@$(DOCKER_COMPOSE) logs -f
docker-ps: ## Show status of all Docker services
	@$(DOCKER_COMPOSE) ps

# Docker Individual Services
docker-backend: db-up ## Start backend in Docker
	@echo "Starting backend in Docker..."
	@$(DOCKER_COMPOSE) up -d backend
	@echo "Backend is running at http://localhost:4000/graphql"
docker-frontend: ## Start frontend in Docker
	@echo "Starting frontend in Docker..."
	@$(DOCKER_COMPOSE) up -d frontend
	@echo "Frontend is running at http://localhost:3000"

# Development (Local)
dev-backend: ## Start backend in development mode (local)
	cd $(BACKEND_DIR) && pnpm start:dev
dev-frontend: ## Start frontend in development mode (local)
	cd $(FRONTEND_DIR) && pnpm dev

# Build
build-backend: ## Build backend for production
	cd $(BACKEND_DIR) && pnpm build
build-frontend: ## Build frontend for production
	cd $(FRONTEND_DIR) && pnpm build

# Database Operations
db-up: ## Start PostgreSQL database
	@$(DOCKER_COMPOSE_DEV) up -d postgres
db-down: ## Stop PostgreSQL database
	@$(DOCKER_COMPOSE_DEV) down postgres
db-reset: ## Reset database (WARNING: deletes all data)
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		set -a; [ -f .env ] && . .env; set +a; \
		cd $(BACKEND_DIR) && pnpm prisma migrate reset --force; \
	fi
db-migrate: ## Create and apply a new Prisma migration
	@read -p "Migration name: " name; \
	set -a; [ -f .env ] && . .env; set +a; \
	cd $(BACKEND_DIR) && pnpm prisma migrate dev --name $$name

# Prisma
prisma-generate: ## Generate Prisma Client
	@set -a; [ -f .env ] && . .env; set +a; \
	cd $(BACKEND_DIR) && pnpm prisma generate
prisma-studio: ## Open Prisma Studio
	@set -a; [ -f .env ] && . .env; set +a; \
	cd $(BACKEND_DIR) && pnpm prisma studio

# Testing
test: test-backend ## Run all tests
test-backend: ## Run backend unit tests
	cd $(BACKEND_DIR) && pnpm test
test-e2e: ## Run end-to-end tests
	cd $(BACKEND_DIR) && pnpm test:e2e

# Code Quality
lint: lint-backend lint-frontend ## Lint all code
lint-backend: ## Lint backend code
	cd $(BACKEND_DIR) && pnpm lint
lint-frontend: ## Lint frontend code
	cd $(FRONTEND_DIR) && pnpm lint
format: format-backend ## Format all code
format-backend: ## Format backend code
	cd $(BACKEND_DIR) && pnpm format

# Cleanup
clean: clean-backend clean-frontend ## Clean build artifacts
clean-backend: ## Clean backend build artifacts
	rm -rf $(BACKEND_DIR)/dist
clean-frontend: ## Clean frontend build artifacts
	rm -rf $(FRONTEND_DIR)/.next

.DEFAULT_GOAL := help
