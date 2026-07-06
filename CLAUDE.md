# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoFlow is an open-core workflow automation platform. Users build automations on a visual canvas, pay by execution (not per task step), and can export their workflows anytime. The core differentiators are transparent pricing, zero vendor lock-in, and built-in health monitoring.

## Architecture

```
React Web App (TypeScript, Vite, Tailwind CSS, ReactFlow)
       |
Express API Server (Node.js, TypeScript, Prisma ORM)
       |
  +----+----+
  |         |
PostgreSQL  Go Execution Engine
(metadata)  (workflow DAG execution, parallel goroutines)
```

- **web/** — React 18 SPA. Visual workflow editor using `@xyflow/react`. Pages: Landing, Dashboard, Workflows, Editor, Executions, Settings.
- **server/** — REST API. Express + TypeScript + Prisma (PostgreSQL). Auth via JWT. Request validation via Zod.
- **engine/** — CLI runner in Go. Loads workflow JSON, builds DAG, executes nodes level-by-level with goroutine-based parallelism. Connector plugin architecture.
- **docker/** — Docker Compose for dev (postgres, redis, server) and prod (adds nginx reverse proxy).

## Development Commands

### Frontend (web/)
```bash
cd web
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
```

### Backend (server/)
```bash
cd server
npm install          # Install dependencies
cp .env.example .env # Configure environment
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to PostgreSQL
npm run dev          # Start API dev server (port 3001)
npm run build        # TypeScript compile to dist/
```

### Engine (engine/)
```bash
cd engine
make build           # Build Go binary to bin/runner
make test            # Run all tests with race detection
make check           # Format + vet + test
```

### Infrastructure
```bash
cd docker
docker compose up -d postgres redis   # Start databases
docker compose up -d                  # Start full dev stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d  # Production
```

## Key Conventions

- **TypeScript strict mode** everywhere. No `any` without explicit justification.
- **No emoji** in any source file, comment, or user-facing string. Use lucide-react icons in UI instead.
- **Path aliases**: `@/` maps to `web/src/` (configured in `tsconfig.json` and `vite.config.ts`).
- **CSS**: Tailwind CSS with custom design tokens in `tailwind.config.js`. Colors: primary (indigo), accent (amber), success (emerald), danger (rose), surface (slate).
- **Font**: Inter (body), JetBrains Mono (code). Loaded from Google Fonts in `index.html`.
- **API patterns**: Express routes delegate to service layer. Services use Prisma. Middleware stack: CORS -> JSON parse -> auth -> validate -> handler -> errorHandler.
- **Error handling**: `AppError` class with HTTP status codes. `errorHandler` middleware catches Zod validation errors and AppErrors.
- **Go engine**: Connectors implement the `Connector` interface. Register new connectors in `builtin/registry.go`. Graph operations in `models/graph.go` (topological sort, level-order for parallelism).

## Frontend Component Structure

```
stores/
  authStore      Zustand store: login, register, logout, loadFromStorage, user/token state
components/
  common/        Button, Badge, Card, Skeleton — reusable across all pages
  layout/        AppLayout, Sidebar, TopBar, RequireAuth (route guard)
pages/
  LandingPage    Public landing with hero, features, pricing comparison, CTA
  LoginPage      Email/password login with error handling
  RegisterPage   Name/email/password registration
  DashboardPage  Stats via /api/executions/stats, recent execution feed
  WorkflowsPage  CRUD via /api/workflows, search/filter grid
  WorkflowEditor ReactFlow canvas, load/save/run via API, node palette + config panel
  ExecutionsPage Filterable list via /api/executions, expandable step details
  SettingsPage   Profile from authStore, plan display, token viewer, notifications
```

## Database Schema (Prisma)

- **User** — id, email (unique), passwordHash, name, plan (FREE/MAKER/TEAM/BUSINESS)
- **Workflow** — id, name, description, nodes (JSON), edges (JSON), status (ACTIVE/DRAFT/ERROR), userId (FK)
- **Execution** — id, workflowId (FK), status (RUNNING/SUCCESS/FAILED), startedAt, completedAt?, steps (JSON), errorMessage?
- **ApiKey** — id, name, key (unique), userId (FK), lastUsedAt?

## Engine Internals

- **Graph** (`internal/models/graph.go`): DAG built from nodes/edges. TopologicalSort finds execution order, detects cycles. LevelOrder groups nodes for parallel execution (nodes with no mutual dependencies run concurrently).
- **Executor** (`internal/executor/executor.go`): Executes levels sequentially, nodes within a level in parallel via goroutines + WaitGroup. Collects upstream outputs, skips downstream on failure. Retry logic with exponential backoff.
- **Connectors** (`internal/connector/`): Plugin interface with `Execute(ctx, config, input) -> (output, error)`. Built-ins: webhook, http_request, filter, transform.

## Pricing Model (Business Context)

The key differentiator from Zapier: AutoFlow charges **per workflow execution**, not per task step. A 30-step workflow = 1 execution. This directly addresses the top complaint in r/SaaS research — Zapier customers paying $20K-50K/month just for "moving data around."

Plans: Free (1K exec/mo), Maker $19/mo (10K), Team $79/mo (100K), Business $299/mo (1M).

## Testing

- **Frontend**: No test framework configured yet. When adding, use Vitest + React Testing Library.
- **Backend**: No test framework configured yet. When adding, use Vitest or Jest with Supertest.
- **Engine**: `go test ./... -v` — standard Go testing. Add tests alongside code in `*_test.go` files.

## Git Workflow

- Branch from `main` for features: `feat/short-description`
- PRs trigger CI: lint all, test all, build all (see `.github/workflows/ci.yml`)
- Tags `v*` trigger deploy workflow
- This is a non-git directory currently — initialize with `git init` when ready.
