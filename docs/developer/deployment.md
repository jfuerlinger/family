# Deployment

FamilyHub is designed to be self-hosted. The production build is a self-contained Next.js **standalone** server; you can run it anywhere a container runs, plus natively on Vercel.

In all setups you need three environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` — unique per deployment, keep it secret |
| `AUTH_TRUST_HOST` | `true` (required behind any reverse proxy / container ingress) |

> **Warning:** Rotating `AUTH_SECRET` logs every user out (JWT sessions). Don't regenerate it on every deploy.

## Option 1: Docker Compose (recommended for home servers / VPS)

```bash
cp .env.example .env
# edit .env: set a real AUTH_SECRET, keep AUTH_TRUST_HOST=true
docker compose up --build -d
```

- The app listens on port **3000**.
- The container entrypoint runs `prisma migrate deploy` on every start, so schema migrations are applied automatically — including on upgrades (`git pull && docker compose up --build -d`).
- Postgres data is stored in a named Docker volume; it survives container rebuilds.

### TLS / reverse proxy

Don't expose port 3000 directly — put a TLS-terminating reverse proxy in front.

**Caddy** (simplest — automatic Let's Encrypt):

```caddyfile
# Caddyfile
family.example.com {
    reverse_proxy localhost:3000
}
```

Or as a compose service:

```yaml
services:
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
volumes:
  caddy_data:
```

**Traefik** (label-based):

```yaml
services:
  app:
    # ... existing app service ...
    labels:
      - traefik.enable=true
      - traefik.http.routers.familyhub.rule=Host(`family.example.com`)
      - traefik.http.routers.familyhub.entrypoints=websecure
      - traefik.http.routers.familyhub.tls.certresolver=letsencrypt
      - traefik.http.services.familyhub.loadbalancer.server.port=3000
```

`AUTH_TRUST_HOST=true` is what makes NextAuth accept the proxied `Host` header — don't remove it.

## Option 2: Generic cloud container hosting

The Docker image is self-contained, so any container host works: **Hetzner** (VPS + compose, cheapest), **Fly.io**, **Railway**, **Render**, etc.

General recipe:

1. **Database**: use the host's managed Postgres (Railway/Render addon, Fly Postgres, Neon, Supabase, …) and set `DATABASE_URL` to its connection string (usually with `?sslmode=require`).
2. **Build/deploy** the Dockerfile via the host's git integration or `docker push`.
3. **Env vars**: set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true` in the host's dashboard.
4. **Migrations**: the entrypoint runs `prisma migrate deploy` at startup, so nothing extra is needed. If your host separates release/start phases (e.g. Fly release commands), you can also run it there.
5. Point the host's HTTPS ingress at container port 3000.

## Option 3: Vercel

FamilyHub is a plain Next.js app, so it deploys natively on Vercel — you just need an external Postgres.

1. **Import the repo** at vercel.com (framework preset: Next.js, no special settings needed).
2. **Provision Postgres** via the Vercel Marketplace (e.g. **Neon**) — this injects `DATABASE_URL` automatically — or bring your own and set `DATABASE_URL` manually.
3. **Set env vars** in Project Settings → Environment Variables: `AUTH_SECRET` (generate one), `AUTH_TRUST_HOST=true`.
4. **Run migrations during build**: override the Build Command to

   ```
   npx prisma migrate deploy && next build
   ```

   (or add a `vercel-build` script with the same content). This applies pending migrations on every production deploy.
5. Deploy. Subsequent pushes to the production branch deploy automatically.

Notes:

- JWT sessions mean no extra session store is needed — serverless-friendly out of the box.
- Use a pooled connection string (Neon's pooler / pgbouncer) to avoid exhausting Postgres connections from serverless functions.

## Backups

Your family's data is only as safe as your Postgres backups. With the bundled compose setup:

```bash
# backup
docker compose exec -T db pg_dump -U family family > familyhub-$(date +%F).sql

# restore
docker compose exec -T db psql -U family family < familyhub-2026-06-10.sql
```

Put the backup line in a cron job and copy the dumps off the machine. Managed Postgres providers (Neon, Railway, etc.) include automatic backups — check their retention settings.

## Upgrade checklist

1. Back up the database (`pg_dump`, see above).
2. `git pull`
3. `docker compose up --build -d` — migrations apply automatically on start.
4. Watch the logs: `docker compose logs -f app`.
