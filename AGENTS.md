<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FamilyHub

Self-hostable family management app: shared todo lists, family calendar, decision-making mindmaps. Multi-user (families with invite codes), i18n (de default + en), mobile-first.

## Stack
Next.js 16 (App Router, standalone output, `src/proxy.ts` for next-intl routing), TypeScript, Tailwind CSS v4 (theme tokens in `src/app/globals.css`), Prisma 7 (`prisma.config.ts` + `@prisma/adapter-pg`), PostgreSQL, NextAuth v5 (credentials/JWT), next-intl v4, @xyflow/react v12.

## Commands
- `npm run db:up` then `npx prisma migrate dev` then `npm run dev` — local development
- `npm run db:seed` — demo data (anna@example.com / max@example.com, password `password123`)
- `docker compose up --build` — full stack; entrypoint runs `prisma migrate deploy` automatically
- `npm run ios:sync` / `ios:open` — Capacitor iOS app (server-URL mode via `CAP_SERVER_URL`)

## Conventions
- Every page/server action gets the user via `requireFamilyUser()` (`src/lib/session.ts`) and must scope all queries by `familyId` — this is the central authorization rule.
- Server actions per feature in `src/lib/actions/<feature>.ts`; pages under `src/app/[locale]/(app)/<feature>/`.
- All UI strings via next-intl; messages split per feature in `messages/{de,en}/{common,todos,calendar,mindmaps}.json` (merged in `src/i18n/request.ts`). German uses du-Form.
- In-app links use `Link`/`useRouter` from `@/i18n/navigation`, never next/link directly.
- Shared UI kit in `src/components/ui/` (button, input, card, dialog, avatar, badge, empty-state).

## Docs
Developer docs: `docs/developer/`. End-user docs: `docs/user/{de,en}/`.
