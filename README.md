# AeroShop

Digital CFD learning products and engineering services — local development / demo.

## Stack

| Part             | Tech                                                      |
| ---------------- | --------------------------------------------------------- |
| Monorepo         | pnpm workspaces + Turborepo                               |
| `apps/web`       | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| `apps/api`       | NestJS (modular monolith), REST under `/api/v1`           |
| Database         | PostgreSQL (Docker Compose) + Prisma                      |
| `packages/shared` | Zod schemas, types and constants shared by web and api   |
| `packages/config` | Shared TypeScript base config                            |

## Prerequisites

- Node.js 24 (`.nvmrc`)
- pnpm 12
- Docker Desktop (for PostgreSQL)

## Getting started

```powershell
# 1. Environment files
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local

# 2. Install dependencies (also runs `prisma generate` for the api)
pnpm install

# 3. Start PostgreSQL
pnpm db:up

# 4. Run web + api in watch mode
pnpm dev
```

- Web: <http://localhost:3000>
- API health: <http://localhost:4000/api/v1/health> (also reachable through the web app at `/api/v1/health`)

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Run all apps in watch mode               |
| `pnpm build`       | Build all packages and apps              |
| `pnpm typecheck`   | Type-check everything                    |
| `pnpm lint`        | Lint everything                          |
| `pnpm test`        | Run unit tests                           |
| `pnpm db:up`       | Start PostgreSQL                         |
| `pnpm db:down`     | Stop PostgreSQL                          |
| `pnpm db:migrate`  | Create/apply a Prisma migration (dev)    |
| `pnpm db:generate` | Regenerate the Prisma client             |
| `pnpm db:studio`   | Open Prisma Studio                       |
