# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# deps — install the full dependency tree once
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
# postinstall runs `prisma generate`, which needs the schema + config present.
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src/lib/database-url.ts ./src/lib/database-url.ts
# Dummy URL so prisma.config.ts (which reads DATABASE_URL) evaluates cleanly.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npm install --no-audit --no-fund

# ---------------------------------------------------------------------------
# build — prisma generate + next build (standalone output)
# ---------------------------------------------------------------------------
FROM node:24-alpine AS build
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time dummies; real values are injected at runtime by docker compose.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV AUTH_SECRET="build-time-dummy-secret"
RUN npx prisma generate
RUN npm run build

# ---------------------------------------------------------------------------
# migrate-cli — a self-contained prisma CLI install used only at container
# start to run `prisma migrate deploy`. Kept in its own directory so it never
# interferes with the pruned node_modules of the Next.js standalone output.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS migrate-cli
WORKDIR /opt/prisma
RUN npm install --no-package-lock --omit=dev prisma@^7.8.0 dotenv@^17

# ---------------------------------------------------------------------------
# runner
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# Next.js standalone server + assets
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Prisma CLI + schema/migrations/config for `migrate deploy` on startup.
# prisma.config.ts resolves `prisma/schema.prisma` relative to itself, and the
# CLI + dotenv resolve from /opt/prisma/node_modules.
COPY --from=migrate-cli --chown=nextjs:nodejs /opt/prisma/node_modules /opt/prisma/node_modules
COPY --chown=nextjs:nodejs prisma.config.ts /opt/prisma/prisma.config.ts
COPY --chown=nextjs:nodejs prisma /opt/prisma/prisma
COPY --chown=nextjs:nodejs src/lib/database-url.ts /opt/prisma/src/lib/database-url.ts

COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
