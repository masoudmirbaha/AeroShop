# syntax=docker/dockerfile:1
# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t aeroshop-api .

# Docker Hub's official node image, pulled through the ArvanCloud mirror (same as postgres).
ARG NODE_IMAGE=docker.arvancloud.ir/library/node:24-alpine

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/prisma.config.ts apps/api/
# `prisma generate` runs as the api postinstall script and needs the schema.
COPY apps/api/prisma apps/api/prisma
RUN pnpm install --frozen-lockfile --filter @aeroshop/api...

FROM deps AS build
COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter @aeroshop/shared build \
 && pnpm --filter @aeroshop/api build \
 && pnpm --filter @aeroshop/api deploy --prod --ignore-scripts /prod/api

# One-off job: `prisma migrate deploy` needs the Prisma CLI, which is a dev dependency.
FROM build AS migrate
WORKDIR /repo/apps/api
CMD ["pnpm", "db:deploy"]

FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /prod/api/package.json ./
COPY --from=build --chown=node:node /prod/api/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
# LocalStorageProvider reads product files from ./storage; mount a volume here.
RUN mkdir -p storage && chown node:node storage
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/v1/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "dist/main.js"]
