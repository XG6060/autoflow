# AutoFlow

> Intelligent Workflow Automation Platform -- "n8n capability + Zapier ease, without punishing your growth"

AutoFlow is an open-core workflow automation platform. Build complex automations on a visual canvas, pay by execution (not per task step), and export your workflows anytime. No vendor lock-in.

## Architecture

```
                    +------------------+
                    |   React Web App  |   TypeScript + Vite + Tailwind
                    +--------+---------+
                             |
                    +--------v---------+
                    |   Express API    |   Node.js + TypeScript + Prisma
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v---------+         +--------v---------+
     |   PostgreSQL      |         |   Go Execution    |
     |   (metadata)      |         |   Engine          |
     +------------------+         |   (workflow runs)  |
                                  +------------------+
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + ReactFlow |
| API Server | Node.js + Express + TypeScript + Prisma |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 + BullMQ |
| Execution Engine | Go 1.22 |
| Infrastructure | Docker + Docker Compose |

## Project Structure

```
autoflow-platform/
|-- web/                     # React frontend
|   |-- src/
|   |   |-- components/      # Reusable UI components
|   |   |   |-- common/      # Button, Badge, Card, Skeleton
|   |   |   |-- layout/      # AppLayout, Sidebar, TopBar
|   |   |-- pages/           # LandingPage, DashboardPage, WorkflowsPage, etc.
|   |   |-- lib/             # API client, utility functions
|   |   |-- types/           # TypeScript type definitions
|   |   |-- styles/          # Global CSS
|   |-- public/images/       # Static assets
|
|-- server/                  # Node.js API server
|   |-- src/
|   |   |-- routes/          # Express route handlers
|   |   |-- services/        # Business logic layer
|   |   |-- middleware/       # Auth, error handling, validation
|   |   |-- validators/      # Zod request validation schemas
|   |-- prisma/              # Database schema & migrations
|
|-- engine/                  # Go execution engine
|   |-- cmd/runner/          # CLI entry point
|   |-- internal/
|   |   |-- models/          # Workflow, Graph, Execution data types
|   |   |-- executor/        # DAG execution with parallelism
|   |   |-- connector/       # Connector interface & built-in implementations
|
|-- docker/                  # Docker Compose & Nginx config
|-- .github/workflows/       # CI/CD pipelines
|-- docs/                    # Project documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- Go 1.22+
- Docker & Docker Compose
- pnpm (or npm)

### Development

```bash
# Start infrastructure
cd docker
docker compose up -d postgres redis

# Start API server
cd server
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev

# Start frontend
cd web
npm install
npm run dev

# Build engine
cd engine
make build
```

### Production

```bash
cd docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Features

- Visual workflow builder with drag-and-drop canvas
- Pay per execution, not per task step (30-step workflow = 1 execution)
- Built-in health monitoring and failure alerts
- One-click workflow export (YAML/JSON)
- Zero vendor lock-in
- Open-format workflow definitions
- Self-hosting support (coming Q2 2026)

## Comparisons

| | AutoFlow | Zapier | Make | n8n |
|---|----------|--------|------|-----|
| Pricing | Per execution | Per task step | Per operation | Per execution |
| Entry price | Free (1K exec) | $19.95/mo | $9/mo | Free (self-host) |
| Mid-tier | $19/mo (10K) | $69/mo (5K tasks) | $29/mo | $65/mo |
| Max for $300 | 1M executions | ~50K tasks | ~200K ops | ~100K+ exec |
| Visual builder | Yes | Yes | Yes | Yes |
| Code nodes | JS/Python | Limited | Limited | JS/Python |
| Export | Yes | No | Limited | Yes |
| Health alerts | Yes | No | No | No |

## License

MIT License - see [LICENSE](LICENSE) for details.
