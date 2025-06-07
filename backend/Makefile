# PCafe 2025 Backend Makefile

# Variables
GO_VERSION := 1.22
BINARY_NAME := pcafe2025
BINARY_PATH := bin/$(BINARY_NAME)
DOCKER_COMPOSE_FILE := ../docker-compose.yml

# Go commands
GOCMD := go
GOBUILD := $(GOCMD) build
GOTEST := $(GOCMD) test
GOCLEAN := $(GOCMD) clean
GOMOD := $(GOCMD) mod
GOFMT := $(GOCMD) fmt

# Default target
.DEFAULT_GOAL := help

# Help
.PHONY: help
help: ## Show this help message
	@echo "PCafe 2025 Backend - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup and development
.PHONY: setup
setup: ## Install dependencies
	$(GOMOD) download
	$(GOMOD) tidy

.PHONY: build
build: ## Build the application
	mkdir -p bin
	$(GOBUILD) -o $(BINARY_PATH) .

.PHONY: run
run: ## Run the application
	$(GOCMD) run main.go

.PHONY: run-server
run-server: ## Run the API server
	$(GOCMD) run main.go

.PHONY: dev
dev: ## Run development server with auto-reload (requires air)
	@which air > /dev/null || (echo "Installing air..." && go install github.com/cosmtrek/air@latest)
	air

# Database operations
.PHONY: db-setup
db-setup: ## Setup database (run migrations)
	$(GOCMD) run . migrate

.PHONY: db-seed
db-seed: ## Seed database with development data
	$(GOCMD) run . seed

.PHONY: db-reset
db-reset: db-drop db-setup db-seed ## Reset database (drop, create, migrate, seed)

.PHONY: db-drop
db-drop: ## Drop all database tables (WARNING: destructive)
	@echo "WARNING: This will drop all database tables!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "\nDropping database tables..."; \
		$(GOCMD) run . drop; \
	else \
		echo "\nOperation cancelled."; \
	fi

# Docker operations
.PHONY: docker-up
docker-up: ## Start PostgreSQL with TimescaleDB via Docker
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d postgres

.PHONY: docker-down
docker-down: ## Stop Docker services
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: docker-logs
docker-logs: ## View Docker logs
	docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f postgres

.PHONY: docker-clean
docker-clean: docker-down ## Clean Docker volumes and images
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v
	docker system prune -f

# Code quality
.PHONY: fmt
fmt: ## Format Go code
	$(GOFMT) ./...

.PHONY: vet
vet: ## Run Go static analysis
	$(GOCMD) vet ./...

.PHONY: lint
lint: ## Lint Go code (requires golangci-lint)
	@which golangci-lint > /dev/null || (echo "Installing golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run

.PHONY: test
test: ## Run tests
	$(GOTEST) -v ./...

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	$(GOTEST) -v -race -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Production
.PHONY: build-prod
build-prod: ## Build for production
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -ldflags="-w -s" -o $(BINARY_PATH) .

# Cleanup
.PHONY: clean
clean: ## Clean build artifacts
	$(GOCLEAN)
	rm -rf bin/
	rm -f coverage.out coverage.html

# Django migration
.PHONY: migrate-django
migrate-django: ## Migrate data from Django database (usage: make migrate-django DJANGO_DSN="postgresql://...")
	@if [ -z "$(DJANGO_DSN)" ]; then \
		echo "Error: DJANGO_DSN is required"; \
		echo "Usage: make migrate-django DJANGO_DSN='postgresql://user:pass@host:port/dbname'"; \
		exit 1; \
	fi
	$(GOCMD) run cmd/migrate_django.go "$(DJANGO_DSN)"

.PHONY: migrate-events
migrate-events: ## Migrate events from PCafe website
	$(GOCMD) run cmd/migrate_events.go

# Database connection test
.PHONY: db-test
db-test: ## Test database connection
	@echo "Testing database connection..."
	@$(GOCMD) run main.go

# Generate go.sum
.PHONY: mod-verify
mod-verify: ## Verify module dependencies
	$(GOMOD) verify

.PHONY: mod-update
mod-update: ## Update module dependencies
	$(GOMOD) get -u ./...
	$(GOMOD) tidy