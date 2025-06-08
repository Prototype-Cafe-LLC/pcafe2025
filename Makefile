# PCafe 2025 Root Makefile

# Default target
.DEFAULT_GOAL := help

# Help
.PHONY: help
help: ## Show this help message
	@echo "PCafe 2025 - Available commands:"
	@grep -E '^[a-zA-Z_0-9-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup and development
.PHONY: setup
setup: ## Install dependencies (both Go and frontend)
	@echo "Setting up backend dependencies..."
	cd backend && make setup
	@echo "Setting up frontend dependencies..."
	cd frontend && bun install

.PHONY: dev
dev: ## Start development servers (backend + frontend)
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8080"
	@echo "Frontend: http://localhost:3000"
	@echo "Press Ctrl+C to stop"
	@trap 'kill %1 %2' SIGINT; \
	(cd backend && make run) & \
	(cd frontend && bun run dev) & \
	wait

.PHONY: build
build: ## Build both backend and frontend
	@echo "Building backend..."
	cd backend && make build
	@echo "Building frontend..."
	cd frontend && bun run build

.PHONY: clean
clean: ## Clean build artifacts
	@echo "Cleaning backend..."
	cd backend && make clean
	@echo "Cleaning frontend..."
	cd frontend && rm -rf dist node_modules

# Backend specific
.PHONY: go-run
go-run: ## Run Go development server
	cd backend && make run

.PHONY: go-build
go-build: ## Build Go binary
	cd backend && make build

.PHONY: go-test
go-test: ## Run Go tests
	cd backend && make test

.PHONY: go-fmt
go-fmt: ## Format Go code
	cd backend && make fmt

.PHONY: go-vet
go-vet: ## Run Go static analysis
	cd backend && make vet

.PHONY: go-lint
go-lint: ## Lint Go code
	cd backend && make lint

.PHONY: swagger
swagger: ## Generate Swagger docs
	@echo "Swagger docs available at http://localhost:8080/docs (requires login)"

# Frontend specific  
.PHONY: frontend-dev
frontend-dev: ## Start frontend dev server (bun)
	cd frontend && bun run dev

.PHONY: frontend-build
frontend-build: ## Build frontend
	cd frontend && bun run build

.PHONY: frontend-test
frontend-test: ## Run frontend tests
	cd frontend && bun run test

.PHONY: frontend-lint
frontend-lint: ## Lint frontend code (bun run lint)
	cd frontend && bun run lint

.PHONY: frontend-typecheck
frontend-typecheck: ## TypeScript checking
	cd frontend && bun run typecheck

.PHONY: frontend-test-e2e
frontend-test-e2e: ## Run Playwright E2E tests
	cd frontend && bun run test:e2e

.PHONY: frontend-test-e2e-ui
frontend-test-e2e-ui: ## Run Playwright E2E tests with UI
	cd frontend && bun run test:e2e:ui

.PHONY: frontend-test-e2e-debug
frontend-test-e2e-debug: ## Run Playwright E2E tests in debug mode
	cd frontend && bun run test:e2e:debug

# Database
.PHONY: db-up
db-up: ## Start PostgreSQL with TimescaleDB via Docker
	docker-compose up -d postgres

.PHONY: db-migrate
db-migrate: ## Run database migrations
	cd backend && make db-setup

.PHONY: db-seed
db-seed: ## Seed database with test data
	cd backend && make db-seed

.PHONY: db-reset
db-reset: ## Reset database (drop, create, migrate, seed)
	cd backend && make db-reset

# Docker
.PHONY: docker-up
docker-up: ## Start all services
	docker-compose up -d

.PHONY: docker-down
docker-down: ## Stop all services
	docker-compose down

.PHONY: docker-logs
docker-logs: ## View logs
	docker-compose logs -f

.PHONY: docker-clean
docker-clean: ## Clean Docker volumes and images
	docker-compose down -v
	docker system prune -f

# Documentation
.PHONY: docs-lint
docs-lint: ## Validate markdown files
	markdownlint **/*.md

.PHONY: docs-fix
docs-fix: ## Fix markdown formatting issues
	markdownlint --fix **/*.md

# Quality checks
.PHONY: lint
lint: go-lint frontend-lint docs-lint ## Run all linting

.PHONY: vet
vet: go-vet ## Run static analysis

.PHONY: test
test: go-test frontend-test frontend-test-e2e ## Run all tests (unit + E2E)

.PHONY: typecheck
typecheck: frontend-typecheck ## Run TypeScript checks

.PHONY: fmt
fmt: go-fmt ## Format all code

# Production
.PHONY: build-prod
build-prod: ## Build for production
	cd backend && make build-prod
	cd frontend && bun run build