# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PCafe 2025 - A fresh project starting from scratch. The project name suggests it may be related to a cafe or calendar application for 2025.

## Webサイトリプレイス 要件定義書（vFinal）

### 🧭 プロジェクト概要

- **目的**：既存のDjangoベースWebサイトを、Go（バックエンド）＋React（TypeScript）構成へリプレイスし、保守性・拡張性・パフォーマンスを向上。
- **対象ユーザー**：
  - 一般来訪者（IoTに関心のあるエンジニア、見学希望者など）
  - 管理者（1名）

---

### 🎨 デザイン要件

- **コーポレートカラー**：ロゴにある緑色
- **ベースカラー**：ごく薄い青緑（baby blue / light teal）
- **イメージ**：広がりのある・親しみやすい・若々しい印象
- **トップページ**：縦スクロールのランディング形式（セクション構成）
- **レスポンシブ対応**：モバイル・タブレット・PC すべて対応

---

### 🔧 機能要件

#### 1. 一般ユーザー向けページ

| ページ             | 内容                                                                 |
|--------------------|----------------------------------------------------------------------|
| トップページ       | 最新のお知らせ・イベント情報の一覧。縦スクロールで構成。             |
| イベントカレンダー | 予定一覧（自動取得／登録されたもの）を表示。過去イベントは非表示または縮小。 |
| グラフ表示         | IoTデータを時系列にグラフ表示（ズーム・ツールチップ等）。             |
| ブログ             | 記事一覧と詳細ページ。MarkdownまたはHTML形式。                        |
| お問い合わせフォーム | Cloudflare Turnstile によるスパム対策付き。                         |
| 法定情報ページ     | 既存の公開URLと同じ形式で保持。                                      |

---

#### 2. 管理者機能（ログイン必須、管理者は1名）

- **ログイン／セッション管理**：Cookieベースの簡易ログイン（JWT不要）
- **管理画面**：React Adminベース（イベント／ブログなどのCRUD）
- **Swagger UI**：ログイン済みセッションでのみ表示・実行可能（`/docs`）

---

#### 3. データ入力／投稿機能

##### イベント情報入力

- 入力方式：
  - URL貼り付け → メタデータ取得（OpenGraph等）
  - 画像貼り付け or アップロード → OCR解析（クライアント／サーバー）
  - PDF → テキスト抽出
- 入力フィールド（編集可能）：
  - 開催日時または期間
  - タイトル（イベントURL付き）
  - 主催者（名前＋リンク）
  - 内容説明

##### ブログ投稿

- 入力フィールド：
  - タイトル
  - タグ
  - コンテンツ（HTMLまたはMarkdown対応）
- 日時はサーバーで自動記録

##### IoTグラフ表示

- 表示ライブラリ：D3.js（複雑なケース）、Chart.js（シンプルなケース）
- 機能：ズーム／パン／ホバー（ツールチップ）対応

---

### 🧩 技術要件

#### フロントエンド

- React + TypeScript + Vite
- React Router v7
- 状態管理：Redux Toolkit + Redux Saga
- UI：Radix UI
- CSS: CSS Modules
- 管理画面：React Admin（カスタムフォームあり）
- local開発 port 3000q

#### バックエンド（API）

- Go + GORM（ORM）+ PostgreSQL + TimescaleDB（時系列データ、50M+レコード、パーティション必須）
- REST API設計
- セッションベース認証（JWTなし）
- Swagger UI：`/docs` に設置（ログイン必須）

#### CAPTCHA（確定）

- **Cloudflare Turnstile** を利用（無料）
- 他のCloudflareサービス（CDN/DNS等）は使用しない
- サーバー側でtoken検証を行い、スパム対策を実施

---

### ⚙️ デプロイ・運用要件

#### ローカル開発環境

- Docker Compose（Go + DB + Frontend）

#### 本番環境（さくらインターネット VPS）

- Goバイナリを直接実行（Docker不使用）
- Reactは静的ビルド → Goサーバで配信
- HTTPS対応（Let's Encryptを使用予定）

---

---

## Development Setup

### Prerequisites

- **Development Platform**: macOS
- **Production Platform**: Ubuntu 24.04 LTS
- Go 1.22+ (latest stable)
- Node.js 20+ (latest LTS)
  - markdownlint
- Bun 1.0+ (package manager)
- PostgreSQL 15+ with TimescaleDB extension (for 50M+ IoT records)
- Docker & Docker Compose (for local development)

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pcafe2025
DB_USER=postgres
DB_PASSWORD=your_password

# Server
SERVER_PORT=8080
ENV=development

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=your_secret_key
TURNSTILE_SITE_KEY=your_site_key
```

### Development Commands

Use the Makefile for common development tasks:

```bash
# Setup and development
make setup          # Install dependencies (both Go and frontend)
make dev            # Start development servers (backend + frontend)
make build          # Build both backend and frontend
make clean          # Clean build artifacts

# Backend specific
make go-run         # Run Go development server
make go-build       # Build Go binary
make go-test        # Run Go tests
make go-fmt         # Format Go code
make go-lint        # Lint Go code
make swagger        # Generate Swagger docs

# Frontend specific  
make frontend-dev   # Start frontend dev server (bun)
make frontend-build # Build frontend
make frontend-test  # Run frontend tests
make frontend-lint  # Lint frontend code (bun run lint)

# Database
make db-up          # Start PostgreSQL with TimescaleDB via Docker
make db-migrate     # Run database migrations
make db-seed        # Seed database with test data

# Docker
make docker-up      # Start all services
make docker-down    # Stop all services
make docker-logs    # View logs
```

#### Manual Commands (if not using Makefile)

**Backend (Go):**

```bash
go run main.go      # Development server
go build -o bin/server
go test ./...       # Run tests
go fmt ./...        # Format code
go vet ./...        # Static analysis (REQUIRED before git push)
go mod tidy         # Clean up dependencies
```

**Frontend (React with Bun):**

```bash
bun install         # Install dependencies
bun run dev         # Development server
bun run build       # Production build
bun run lint        # Lint code
bun run typecheck   # TypeScript checking
```

**Documentation (Markdown):**

```bash
# Install markdownlint globally (if not already installed)
npm install -g markdownlint-cli

# Validate all markdown files
markdownlint **/*.md

# Validate specific files
markdownlint README.md MIGRATION_GUIDE.md

# Fix common issues automatically (where possible)
markdownlint --fix **/*.md
```

### Project Structure

#### Backend Structure (Go)

```text
backend/
├── main.go                    # Application entry point
├── Makefile                   # Development commands
├── go.mod                     # Go dependencies
├── .env                       # Environment variables
├── config/
│   ├── database.go           # Database configuration
│   ├── server.go             # Server configuration
│   └── env.go                # Environment loading
├── handlers/                  # HTTP request handlers
│   ├── auth.go               # Authentication endpoints
│   ├── events.go             # Event CRUD operations
│   ├── blog.go               # Blog CRUD operations
│   ├── iot.go                # IoT data endpoints (time-series)
│   └── contact.go            # Contact form + Turnstile
├── models/                    # Database models
│   ├── user.go               # User model
│   ├── event.go              # Event model
│   ├── blog.go               # Blog model
│   ├── iot_data.go           # IoT hypertable (TimescaleDB)
│   └── contact.go            # Contact form model
├── services/                  # Business logic
│   ├── auth_service.go       # Session management
│   ├── event_service.go      # Event processing (OCR, metadata)
│   ├── blog_service.go       # Blog content processing
│   ├── iot_service.go        # Time-series data queries
│   └── contact_service.go    # Email + Turnstile validation
├── middleware/
│   ├── auth.go               # Session authentication
│   ├── cors.go               # CORS configuration
│   └── logging.go            # Request logging
├── db/
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Test data
│   └── connection.go         # DB connection + TimescaleDB setup
├── docs/                      # Swagger generated files
└── bin/                       # Built binaries
```

#### Frontend Structure (React + TypeScript + Vite)

```text
frontend/
├── package.json               # Dependencies (Bun preferred)
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS (if used)
├── .env                      # Environment variables
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Generic components (Button, Modal, etc.)
│   │   ├── layout/           # Layout components (Header, Footer, Nav)
│   │   ├── forms/            # Form components (with Turnstile)
│   │   └── charts/           # Chart components (D3.js/Chart.js)
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx      # Landing page
│   │   ├── EventsPage.tsx    # Event calendar
│   │   ├── BlogPage.tsx      # Blog listing/detail
│   │   ├── GraphsPage.tsx    # IoT data visualization
│   │   └── ContactPage.tsx   # Contact form
│   ├── admin/                # React Admin configuration
│   │   ├── AdminApp.tsx      # Admin app root
│   │   ├── resources/        # Admin resource definitions
│   │   └── components/       # Custom admin components
│   ├── store/                # Redux Toolkit + Saga
│   │   ├── index.ts          # Store configuration
│   │   ├── slices/           # Redux slices
│   │   └── sagas/            # Redux Saga effects
│   ├── services/             # API client functions
│   │   ├── api.ts            # Base API configuration
│   │   ├── events.ts         # Event API calls
│   │   ├── blog.ts           # Blog API calls
│   │   └── iot.ts            # IoT data API calls
│   ├── types/                # TypeScript definitions
│   │   ├── api.ts            # API response types
│   │   ├── models.ts         # Domain model types
│   │   └── components.ts     # Component prop types
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   └── styles/               # CSS/styling files
├── public/                   # Static assets
└── dist/                     # Build output (served by Go)
```

### Docker Compose (Simple Local Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: pcafe2025
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Commands: `make docker-up` / `make docker-down` / `make docker-logs`

---

## Quality Assurance & Pre-Commit Practices

### Essential Pre-Commit Checks

Before pushing code to the repository, ALWAYS run these commands to ensure CI will pass:

#### Backend Validation (Go)

```bash
# Format code
go fmt ./...

# Static analysis (catches unused imports, variables, duplicate functions)
go vet ./...

# Type checking and compilation
go build -o bin/test main.go && rm bin/test

# Run tests
go test ./...

# Clean dependencies
go mod tidy
```

#### Frontend Validation (React/TypeScript)

```bash
# Type checking
bun run typecheck

# Linting
bun run lint

# Build verification
bun run build
```

#### Documentation Validation

```bash
# Markdown linting
markdownlint **/*.md

# Auto-fix common issues
markdownlint --fix **/*.md
```

### Common CI Issues and Solutions

#### Backend Issues

- **Duplicate main functions**: Only one `main.go` should exist in the root package
- **Unused imports/variables**: Use `go vet` to catch these before committing
- **Missing dependencies**: Run `go mod tidy` to ensure clean go.mod/go.sum files
- **Import cycles**: Keep package dependencies acyclic

#### Frontend Issues

- **TypeScript errors**: Always run `bun run typecheck` before committing
- **Missing CSS module types**: Ensure `*.module.css` type declarations exist
- **Build failures**: Test with `bun run build` to catch compilation issues
- **Linting errors**: Fix with `bun run lint` and follow established patterns

#### Docker & CI Configuration

- **Cache key mismatches**: Use specific paths like `backend/go.sum` instead of `**/go.sum`
- **Working directory errors**: Ensure CI workflows specify correct `working-directory`
- **Service dependencies**: Verify database services are healthy before running tests

### Recommended Git Workflow

1. **Before starting work**: `git pull origin develop`
2. **During development**: Use `make dev` for unified development environment
3. **Before committing**: Run full quality checks:

   ```bash
   make lint      # All linting
   make test      # All tests  
   make build     # All builds
   ```

4. **Commit with descriptive messages**: Follow conventional commit format
5. **Push and create PR**: Include `close #issue-number` in PR description

### Makefile Quality Commands

The root Makefile includes consolidated quality commands:

```bash
make lint       # Run all linting (Go + Frontend + Markdown)
make test       # Run all tests (Go + Frontend)
make typecheck  # Run TypeScript checking
make fmt        # Format all code
make build      # Build all components
```

Use these before every commit to ensure CI pipeline success.

---

## Documentation Standards

### Markdown Formatting

All markdown files in this project follow strict formatting standards enforced by markdownlint. Key requirements:

**Line Length**: Maximum 80 characters per line for readability
**Headers**: Must have blank lines before and after
**Lists**: Must have blank lines before and after
**Code Blocks**: Must have blank lines before and after
**No Trailing Spaces**: All trailing whitespace must be removed
**Final Newline**: Files must end with exactly one newline character

### Validation Commands

```bash
# Check all markdown files for issues
markdownlint **/*.md

# Check specific files
markdownlint backend/README.md MIGRATION_GUIDE.md

# Auto-fix common formatting issues
markdownlint --fix **/*.md
```

### Common Issues and Fixes

1. **Line too long (MD013)**: Break long lines at logical points
2. **Missing blank lines (MD022/MD031/MD032)**: Add blank lines around headers, code blocks, and lists
3. **Trailing spaces (MD009)**: Remove all trailing whitespace
4. **Missing final newline (MD047)**: Ensure files end with single newline

### Best Practices

- Write clear, concise documentation
- Use consistent formatting throughout
- Include code examples with proper syntax highlighting
- Organize content with logical heading hierarchy
- Validate markdown before committing changes

---

## GitHub Issues and Pull Requests

### Creating Pull Requests for Issues

When creating pull requests that resolve GitHub issues, always include the closing keyword at the **top** of the PR description to ensure proper issue linking:

```markdown
close #28

## Summary
[Your PR description here...]
```

**Important**: Place `close #issue-number` at the very beginning of the PR description, not buried in the content. This ensures GitHub automatically closes the issue when the PR is merged.

Other valid closing keywords:

- `close`, `closes`, `closed`
- `fix`, `fixes`, `fixed`
- `resolve`, `resolves`, `resolved`

### Issue #28 Implementation Notes

**Completed**: Go backend REST API implementation

- ✅ Authentication middleware (session-based with cookies)
- ✅ Blog CRUD endpoints with slug support
- ✅ Event CRUD endpoints with calendar view
- ✅ IoT data endpoints with TimescaleDB optimization
- ✅ Contact form protection with admin middleware
- ✅ Comprehensive input validation and error handling

**API Structure**: All endpoints follow `/api/{resource}` pattern with proper HTTP methods
**Security**: Admin-only endpoints protected by session middleware
**Performance**: TimescaleDB hypertables for IoT time-series data

---

### 📎 今後の設計・開発タスク候補

1. 画面設計（ワイヤーフレーム）
2. DB設計（ER図）
3. ~~API仕様書（OpenAPI定義）~~ **→ Issue #28で実装完了、Swagger UI追加は今後**
4. ~~開発雛形コード（Go＋React/Vite＋React Admin）~~ **→ Issue #28でバックエンド完了**
