# syntax=docker/dockerfile:1
# Build from the repository root:
#   docker build -f apps/web/Dockerfile --build-arg API_URL=http://api:4000 -t aeroshop-web .

# Docker Hub's official node image, pulled through the ArvanCloud mirror (same as postgres).
ARG NODE_IMAGE=docker.arvancloud.ir/library/node:24-alpine

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter @aeroshop/web...

FROM deps AS build
# The /api/* rewrite target is serialized into the build output.
ARG API_URL=http://api:4000
ENV API_URL=${API_URL} NEXT_OUTPUT=standalone
COPY packages packages
COPY apps/web apps/web
RUN mkdir -p apps/web/public \
 && pnpm --filter @aeroshop/shared build \
 && pnpm --filter @aeroshop/web build

FROM ${NODE_IMAGE} AS runner
ARG API_URL=http://api:4000
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 API_URL=${API_URL}
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/favicon.ico').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
