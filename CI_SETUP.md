# CI Pipeline Setup Documentation

This document provides the complete GitHub Actions CI pipeline configuration for PCafe 2025 project.

## Overview

The CI pipeline includes:
- **Backend Tests & Linting**: Go code quality checks, static analysis, and unit tests
- **Frontend Tests & Linting**: TypeScript checking, ESLint, and build verification
- **Playwright E2E Tests**: Full end-to-end testing with backend and frontend integration
- **Documentation Linting**: Markdown validation using markdownlint
- **Build Verification**: Complete production build validation

## Implementation Steps

### 1. Create GitHub Workflows Directory

```bash
mkdir -p .github/workflows
```

### 2. Move Workflow File

Move the `ci-workflow.yml` file to the correct location:

```bash
mv ci-workflow.yml .github/workflows/ci.yml
```

### 3. Commit and Push

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add comprehensive CI pipeline with tests and linting"
git push origin <your-branch>
```

## Pipeline Jobs

### Backend Tests Job
- **Database**: PostgreSQL with TimescaleDB extension
- **Go Version**: 1.22 (latest stable)
- **Checks**:
  - Dependency verification
  - Code formatting (`go fmt`)
  - Static analysis (`go vet`)
  - Linting (`golangci-lint`)
  - Unit tests with race detection
  - Coverage report generation

### Frontend Tests Job
- **Package Manager**: Bun (latest)
- **Checks**:
  - TypeScript type checking
  - ESLint linting
  - Build verification
  - Unit tests (when available)

### Playwright E2E Tests Job
- **Dependencies**: Both backend and frontend jobs must pass
- **Services**: Full stack with PostgreSQL database
- **Process**:
  - Starts backend server in background
  - Runs comprehensive Playwright test suite
  - Generates test reports
  - Graceful server shutdown

### Documentation Linting Job
- **Tool**: markdownlint-cli
- **Scope**: All Markdown files in repository
- **Standards**: Enforces consistent documentation formatting

### Build Verification Job
- **Purpose**: Ensures production builds work correctly
- **Output**: Generates build artifacts for verification
- **Dependencies**: Backend and frontend tests must pass

## Environment Variables

The CI pipeline uses these environment variables:

```yaml
# Database (Test Environment)
DB_HOST: localhost
DB_PORT: 5432
DB_NAME: pcafe2025_test
DB_USER: postgres
DB_PASSWORD: password
ENV: test

# Server Configuration
SERVER_PORT: 8080
PLAYWRIGHT_BASE_URL: http://localhost:8080
```

## Triggers

The pipeline runs on:
- **Pull Requests**: Against `develop` and `main` branches
- **Direct Pushes**: To `develop` and `main` branches

## Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

This ensures only one workflow runs per branch/PR, canceling previous runs when new commits are pushed.

## Quality Gates

All jobs must pass for the CI pipeline to succeed:

1. ✅ Backend code formatting and linting
2. ✅ Go static analysis and unit tests
3. ✅ Frontend TypeScript checking and linting
4. ✅ Frontend build verification
5. ✅ Playwright E2E test suite
6. ✅ Documentation formatting
7. ✅ Production build verification

## Test Coverage

- **Backend**: Coverage reports generated and uploaded as artifacts
- **Frontend**: Build verification ensures all TypeScript compiles
- **E2E**: 25+ Playwright test files covering all major functionality
- **Documentation**: All Markdown files validated for consistency

## Performance Optimizations

- **Dependency Caching**: Go modules and Bun dependencies cached
- **Parallel Execution**: Independent jobs run simultaneously
- **Artifact Management**: Test reports and coverage data preserved
- **Resource Efficiency**: Services only started when needed

## Maintenance Notes

- **Go Version**: Update when new stable versions are released
- **Dependencies**: Regular security updates for GitHub Actions
- **Database**: Consider upgrading PostgreSQL/TimescaleDB versions
- **Test Timeouts**: Adjust if tests become longer-running

## Local Development Integration

The CI pipeline uses the same commands available locally:

```bash
# Backend quality checks (matches CI)
make go-lint
make go-vet
make go-test

# Frontend quality checks (matches CI)
make frontend-typecheck
make frontend-lint
make frontend-test-e2e

# Documentation validation (matches CI)
make docs-lint

# Full quality suite (matches CI jobs)
make lint      # All linting
make test      # All tests
make build     # All builds
```

This ensures consistency between local development and CI environments.