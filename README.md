# AeroShop

Digital CFD learning products and engineering services — local development / demo.

## Stack

| Part             | Tech                                                      |
| ---------------- | --------------------------------------------------------- |
| Monorepo         | pnpm workspaces + Turborepo                               |
| `apps/web`       | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| `apps/api`       | NestJS (modular monolith), REST under `/api/v1`           |
| Database         | PostgreSQL 17 (Docker Compose) + Prisma                   |
| `packages/shared` | Zod schemas, types and constants shared by web and api   |
| `packages/config` | Shared TypeScript base config                            |

## Prerequisites

- Node.js 24 (`.nvmrc`)
- pnpm 12
- Docker Desktop (runs PostgreSQL only; web and api run directly on Windows)

PostgreSQL runs in Docker and is published on `localhost:5432`. The image is pulled
through the ArvanCloud mirror (`docker.arvancloud.ir/library/postgres:17-alpine`),
which does not require a login.

## Getting started

```powershell
# 1. Environment files
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
# then set the same password in POSTGRES_PASSWORD (.env)
# and in DATABASE_URL (apps/api/.env)

# 2. Install dependencies (also runs `prisma generate` for the api)
pnpm install

# 3. Start PostgreSQL (waits until the container is healthy)
pnpm db:up

# 4. Run web + api in watch mode
pnpm dev
```

The password is applied only when the data volume is first created. To change it later,
run `docker compose down -v` (this deletes the local database) and then `pnpm db:up`.

- Web: <http://localhost:3000>
- API health: <http://localhost:4000/api/v1/health> (also reachable through the web app at `/api/v1/health`).
  It returns `"db": "up"` when PostgreSQL is reachable, and `"status": "degraded", "db": "down"` otherwise
  (container stopped, wrong password, or missing database).

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Run all apps in watch mode               |
| `pnpm build`       | Build all packages and apps              |
| `pnpm typecheck`   | Type-check everything                    |
| `pnpm lint`        | Lint everything                          |
| `pnpm test`        | Run unit tests                           |
| `pnpm db:up`       | Start PostgreSQL in Docker               |
| `pnpm db:down`     | Stop PostgreSQL (data volume is kept)    |
| `pnpm db:migrate`  | Create/apply a Prisma migration (dev)    |
| `pnpm db:generate` | Regenerate the Prisma client             |
| `pnpm db:studio`   | Open Prisma Studio                       |
