# Contributing

Thanks for helping make FamilyHub better! This guide covers code style, the feature-module pattern, and what we expect in a PR.

## Project setup

Follow [getting-started.md](getting-started.md). Before pushing, make sure `npm run lint` and `npm run build` pass.

## Code style

- **TypeScript everywhere**, strict mode. No `any` unless there is truly no alternative (and then with a comment).
- **Formatting/linting**: ESLint with `eslint-config-next` (`npm run lint`). Single quotes, semicolons, 2-space indent — match the surrounding code.
- **Server first**: pages and data fetching are server components. Add `'use client'` only where interactivity demands it (forms, dialogs, the React Flow editor), and keep client components as leaves.
- **Mutations are server actions** in `src/lib/actions/<feature>.ts` with `'use server'`. Every action must:
  1. validate all input with **zod**,
  2. resolve the session and the caller's `familyId` server-side (never trust IDs from the client),
  3. scope **every** query to that `familyId` — this is the app's central authorization rule (see [architecture.md](architecture.md)),
  4. call `revalidatePath` for every route whose data changed (feature page + dashboard).
- **UI**: reuse the primitives in `src/components/ui/` (button, input, card, dialog, avatar, badge, empty-state) before adding new ones. Tailwind v4 utility classes, combined with the `cn()` helper from `src/lib/utils.ts`. Theme tokens live in `src/app/globals.css`.
- **i18n**: no hardcoded user-facing strings — every label goes through next-intl, in **both** `messages/de/` and `messages/en/` (German in du-Form; see [i18n.md](i18n.md)).
- **Navigation**: import `Link`/`redirect`/`useRouter`/`usePathname` from `src/i18n/navigation.ts`, never from `next/link`/`next/navigation` directly in localized UI.
- **Dates** with `date-fns`; **icons** with `lucide-react`.

## Adding a new feature module

Features follow a consistent **page + actions + messages** pattern. To add a feature called `shopping`:

1. **Schema** (if needed): add models to `prisma/schema.prisma`, relate them to `Family` (with `onDelete: Cascade`), run `npx prisma migrate dev --name add_shopping`, commit the migration.
2. **Server actions**: create `src/lib/actions/shopping.ts` (`'use server'`) following the checklist above — `src/lib/actions/todos.ts` is the reference implementation.
3. **Page**: create `src/app/[locale]/(app)/shopping/page.tsx` (server component; fetch via Prisma, scoped to the family) plus client components for interaction in the same folder.
4. **Messages**: add `messages/de/shopping.json` and `messages/en/shopping.json` with a top-level `"shopping"` namespace, and register the file in `NAMESPACE_FILES` in `src/i18n/request.ts`.
5. **Navigation**: add the entry (label in `common.json` → `nav`, icon from lucide) to `src/components/layout/app-shell.tsx` so it appears in the sidebar and the mobile tab bar.
6. **Dashboard** (optional): surface a summary card on the dashboard and revalidate it from your actions.

## Git & PRs

- Branch from `main`: `feature/<short-name>` or `fix/<short-name>`.
- Small, focused PRs with imperative-mood commit messages ("Add shopping list actions").

### PR checklist

- [ ] `npm run lint` and `npm run build` pass
- [ ] All new queries/mutations are scoped to the caller's family
- [ ] All inputs validated with zod; no client-provided `familyId`/foreign IDs trusted
- [ ] All user-facing strings exist in **both** `messages/de/` and `messages/en/` (German du-Form)
- [ ] `revalidatePath` called for every affected route
- [ ] Schema changes include a committed migration (`prisma/migrations/`)
- [ ] Works on mobile viewport (bottom tab bar) and desktop (sidebar)
- [ ] Tested in both locales (`/de/...` and `/en/...`)
- [ ] Docs updated if behavior/setup changed (`docs/`, and user docs in **both** languages)

## Reporting bugs

Open an issue with steps to reproduce, expected vs. actual behavior, and your environment (browser, deployment mode, locale). Screenshots help a lot.
