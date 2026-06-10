# Getting Started (Developer)

This guide takes you from a fresh clone to a running FamilyHub instance on your machine.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20+ | LTS recommended |
| npm | 10+ | ships with Node |
| Docker + Docker Compose | recent | used to run PostgreSQL locally (and for the full Docker run mode) |
| Git | any recent | |

> **Note:** You don't strictly need Docker — any reachable PostgreSQL 15+ instance works. Just point `DATABASE_URL` at it and skip the `db:up` step.

## Local development setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/your-org/familyhub.git
   cd familyhub
   npm install
   ```

2. **Start PostgreSQL**

   ```bash
   npm run db:up
   ```

   This starts a local Postgres container via Docker Compose (database `family`, user `family`, password `family` on port 5432 — matching `.env.example`).

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   The defaults work for local development. See the table below for details.

4. **Apply database migrations**

   ```bash
   npx prisma migrate dev
   ```

   This creates the schema and generates the Prisma client. Prisma 7 reads its configuration (schema path, migrations path, datasource URL) from `prisma.config.ts`, which loads `.env` via `dotenv` — see [database.md](database.md).

5. **(Optional) Seed demo data**

   ```bash
   npm run db:seed
   ```

   Creates a demo family with two users:

   | Email | Password |
   | --- | --- |
   | `anna@example.com` | `password123` |
   | `max@example.com` | `password123` |

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 — you'll be redirected to the default locale (`/de`). Use `/en` for English.

## Environment variables

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | `postgresql://family:family@localhost:5432/family?schema=public` | PostgreSQL connection string. Used by both the app (via the `@prisma/adapter-pg` driver adapter) and the Prisma CLI (via `prisma.config.ts`). |
| `AUTH_SECRET` | yes | output of `openssl rand -base64 32` | Secret used by NextAuth to sign/encrypt JWT session tokens. **Never use the example value in production.** |
| `AUTH_TRUST_HOST` | yes (in Docker / behind a proxy) | `true` | Tells NextAuth to trust the `Host` header. Required when running behind a reverse proxy or in a container. |
| `CAP_SERVER_URL` | iOS builds only | `https://family.example.com` | URL of the hosted instance the Capacitor iOS app should load. See [ios-app.md](ios-app.md). |

## Common commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on http://localhost:3000 |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:up` | Start the local PostgreSQL container |
| `npm run db:seed` | Seed demo data (demo family, two users) |
| `npx prisma migrate dev` | Create/apply migrations in development and regenerate the client |
| `npx prisma migrate deploy` | Apply pending migrations (production; the Docker entrypoint runs this automatically) |
| `npx prisma studio` | Browse the database in Prisma Studio |
| `npm run ios:sync` | Build the web assets and sync the Capacitor iOS project |
| `npm run ios:open` | Open the iOS project in Xcode |


## Running everything in Docker

If you just want the full app without a local Node setup:

```bash
cp .env.example .env   # set a real AUTH_SECRET
docker compose up --build
```

The app is served on http://localhost:3000; the container entrypoint runs `prisma migrate deploy` on startup, so the database schema is always up to date.

## Troubleshooting

- **`Can't reach database server`** — make sure Postgres is running (`npm run db:up` or `docker compose ps`) and `DATABASE_URL` matches.
- **Login always fails** — verify `AUTH_SECRET` is set; if you changed it, existing sessions are invalidated (expected).
- **Stuck on `/de/login` redirect loops behind a proxy** — set `AUTH_TRUST_HOST=true`.
- **Prisma CLI ignores your env** — Prisma 7 no longer reads `.env` implicitly for all setups; this project loads it in `prisma.config.ts` via `import 'dotenv/config'`. Make sure `.env` exists in the project root.

Next steps: read the [architecture overview](architecture.md) and the [contributing guide](contributing.md).
