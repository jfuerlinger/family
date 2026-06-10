# Architecture

FamilyHub is a classic server-rendered Next.js App Router application: server components read data, server actions mutate it, Prisma talks to PostgreSQL. There is no separate REST/GraphQL API layer.

## Request flow

```
Browser request
   │
   ▼
src/middleware.ts (next-intl)
   │  resolves the locale, redirects / → /de (default locale),
   │  rewrites /de/todos → app/[locale]/todos
   ▼
Server Components (src/app/[locale]/…)
   │  call auth() / getCurrentUser() for the session,
   │  read data directly via Prisma, render HTML
   ▼
Client Components (forms, dialogs, React Flow editor)
   │  invoke Server Actions on user interaction
   ▼
Server Actions (src/lib/actions/*.ts)
   │  'use server' — validate input with zod, check session,
   │  resolve the caller's familyId, scope every query to it,
   │  mutate via Prisma, revalidatePath()
   ▼
Prisma 7 (@prisma/adapter-pg driver adapter)
   ▼
PostgreSQL
```

Key properties:

- **Locale first.** Every page lives under `src/app/[locale]/`. The next-intl middleware (`src/middleware.ts`) handles locale detection and prefixing; its matcher skips `/api`, Next internals, and static files.
- **Server components by default.** Pages fetch data directly with Prisma in the RSC tree. Interactive pieces (forms, the mindmap editor) are client components that call server actions.
- **Mutations via server actions.** Each feature has one actions file: `src/lib/actions/{auth,todos,calendar,mindmaps,settings}.ts`. Actions revalidate the affected paths (e.g. `/${locale}/todos` and `/${locale}/dashboard`) so the UI reflects changes immediately.

## Authentication flow (NextAuth v5)

Configuration lives in `src/lib/auth.ts`; the route handler is mounted at `src/app/api/auth/[...nextauth]`.

1. **Register** — a server action (`src/lib/actions/auth.ts`) validates input with zod, hashes the password with **bcrypt**, and creates the `User` row.
2. **Login** — the **Credentials provider** looks up the user by (lowercased, trimmed) email and compares the password with `bcrypt.compare`.
3. **Session** — `strategy: 'jwt'`: no session table, the session lives in a signed/encrypted cookie. The `jwt` callback copies `user.id` into the token; the `session` callback exposes it as `session.user.id` (typed in `src/types/next-auth.d.ts`).
4. **Onboarding** — after registration a user has `familyId = null` and is sent to `/​[locale]/onboarding` to either **create a family** (becomes its first member) or **join one** via invite code. App pages redirect users without a family back to onboarding (`src/lib/session.ts` helpers).

`trustHost: true` (plus `AUTH_TRUST_HOST=true` in the environment) makes auth work behind reverse proxies and in containers.

## Authorization: family scoping is *the* rule

There are no per-record ACLs. The single, central authorization rule is:

> **Every read and every write is scoped to the caller's family.**

Concretely, every server action:

1. resolves the session (`auth()`), bails out if unauthenticated;
2. loads the caller's `familyId` from the database (never trusts client input for it);
3. uses `familyId` in **every** Prisma query — either directly (`where: { id, familyId }`) or through the relation (`where: { id, list: { familyId } }` for todo items);
4. verifies cross-references too: e.g. a todo assignee is only accepted if that user is a member of the same family.

Roles (`ADMIN`/`MEMBER` on `User.role`) exist in the schema and are shown in settings, but are currently **informational only** — they do not gate any action yet.

When adding new queries or actions, treat a missing `familyId` filter as a security bug.

## Directory layout

```
family/
├── prisma/
│   └── schema.prisma          # Models: User, Family, TodoList, TodoItem,
│                              # CalendarEvent, Mindmap; enums FamilyRole, Priority
├── prisma.config.ts           # Prisma 7 config: schema/migrations path, datasource URL
├── messages/                  # i18n messages, split per feature
│   ├── de/{common,todos,calendar,mindmaps}.json
│   └── en/{common,todos,calendar,mindmaps}.json
├── src/
│   ├── middleware.ts          # next-intl locale middleware
│   ├── i18n/
│   │   ├── routing.ts         # locales ['de','en'], defaultLocale 'de'
│   │   ├── request.ts         # merges the per-feature message files per request
│   │   └── navigation.ts      # locale-aware Link/redirect/usePathname/useRouter
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton (pg driver adapter)
│   │   ├── auth.ts            # NextAuth v5 config (credentials, JWT)
│   │   ├── session.ts         # getCurrentUser & friends (server-only)
│   │   ├── utils.ts           # cn() etc.
│   │   └── actions/           # server actions, one file per feature
│   │       ├── auth.ts        # register, create/join family
│   │       ├── todos.ts       # lists + items CRUD, toggle done
│   │       ├── calendar.ts    # event CRUD
│   │       ├── mindmaps.ts    # mindmap CRUD + node/edge persistence
│   │       └── settings.ts    # profile name + language
│   ├── app/
│   │   ├── api/auth/          # NextAuth route handler
│   │   └── [locale]/
│   │       ├── (auth)/        # login, register (centered card layout)
│   │       ├── onboarding/    # create or join a family
│   │       └── (app)/         # authenticated area, wrapped in the app shell
│   │           ├── dashboard/
│   │           ├── todos/
│   │           ├── calendar/
│   │           ├── mindmaps/
│   │           └── settings/
│   ├── components/
│   │   ├── ui/                # button, input, card, dialog, avatar, badge, empty-state
│   │   └── layout/app-shell.tsx  # sidebar (desktop) / bottom tab bar (mobile)
│   └── types/next-auth.d.ts   # session.user.id typing
├── docker-compose.yml         # app + postgres (Docker run mode)
├── capacitor.config.ts        # iOS wrapper (server.url from CAP_SERVER_URL)
└── ios/                       # generated Capacitor Xcode project
```

## Design decisions

### Server actions instead of a REST API

All mutations go through server actions co-located in `src/lib/actions/`. Benefits for an app of this size:

- No API layer to design, version, or secure separately — session checks and family scoping live next to the query.
- End-to-end TypeScript: input types (`z.input<…>`) flow straight into client components.
- Built-in cache invalidation with `revalidatePath`.

Trade-off: there is no public API for third-party clients. The Capacitor iOS app sidesteps this by loading the hosted web app directly (see [ios-app.md](ios-app.md)).

### JWT sessions instead of database sessions

`session: { strategy: 'jwt' }` keeps auth stateless — no `Session` table, no session-store queries on every request, and it works unchanged in serverless environments (Vercel) and multi-container deployments. Trade-off: sessions can't be revoked server-side individually; rotating `AUTH_SECRET` invalidates all of them.

### Per-feature message files

Messages live in `messages/{locale}/{common,todos,calendar,mindmaps}.json` rather than one big file per locale. `src/i18n/request.ts` merges them per request. This keeps feature work (and concurrent agents/PRs) from colliding in a single JSON file and makes it obvious where a new string belongs. See [i18n.md](i18n.md).

### Standalone output + driver adapter

`next.config.ts` sets `output: 'standalone'` so the Docker image is self-contained (no `node_modules` mount). Prisma uses the `@prisma/adapter-pg` driver adapter (plain `pg` pool) instead of the legacy query engine binary, which keeps the image small and is the Prisma 7 way; `@prisma/client` and the adapter are listed in `serverExternalPackages`.
