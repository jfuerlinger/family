<p align="center">
  <!-- TODO: replace with real logo -->
  <img src="docs/assets/logo.png" alt="FamilyHub logo" width="120" />
</p>

<h1 align="center">FamilyHub</h1>

<p align="center"><em>Your family life. One place.</em></p>

---

**FamilyHub** is a self-hostable family management app. It brings shared todo lists, a family calendar, and collaborative mindmaps for decision-making together in one fast, mobile-friendly web app. Everyone in the family gets their own account, joins via a simple invite code, and sees the same shared data — on the desktop, on the phone home screen as a PWA, or in the native iOS app. Your data lives in your own PostgreSQL database, on your own server.

## ✨ Features

- ✅ **Shared todo lists** — color-coded lists, tasks with due dates, priorities (low/medium/high), assignees, and notes
- 📅 **Family calendar** — month view with all-day and timed events, locations, descriptions, and colors
- 🧠 **Mindmaps** — visual decision-making with topic, idea, pro, con, and question nodes; auto-saved as you edit
- 🏠 **Dashboard** — open tasks and upcoming events at a glance
- 👨‍👩‍👧‍👦 **Multi-user families** — register, create a family or join via invite code; all data is scoped to your family
- 🌍 **Bilingual** — German (default) and English, switchable per user
- 📱 **Mobile-first** — responsive layout with bottom tab bar, installable PWA, plus an iOS/iPad app via Capacitor
- 🔒 **Self-hosted** — your server, your database, your data

## 📸 Screenshots

<!-- TODO: add screenshots -->
| Dashboard | Tasks | Calendar | Mindmaps |
| --- | --- | --- | --- |
| _coming soon_ | _coming soon_ | _coming soon_ | _coming soon_ |

## 🚀 Quickstart (Docker)

```bash
git clone https://github.com/your-org/familyhub.git && cd familyhub
cp .env.example .env   # then set AUTH_SECRET: openssl rand -base64 32
docker compose up --build
```

Open http://localhost:3000 — database migrations run automatically on container start. For local development without Docker, see the [developer getting-started guide](docs/developer/getting-started.md).

## 🛠 Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, standalone output), React 19, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with a custom theme |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Prisma 7](https://www.prisma.io/) (`@prisma/adapter-pg` driver adapter) |
| Auth | [NextAuth v5](https://authjs.dev/) — credentials provider, bcrypt, JWT sessions |
| i18n | [next-intl v4](https://next-intl.dev/) — locale-prefixed routes `/de`, `/en` |
| Mindmaps | [@xyflow/react v12](https://reactflow.dev/) (React Flow) |
| Validation | [zod](https://zod.dev/) |
| Dates / icons | [date-fns](https://date-fns.org/), [lucide-react](https://lucide.dev/) |
| Mobile | PWA manifest + [Capacitor](https://capacitorjs.com/) iOS wrapper |

## 📚 Documentation

- **[Documentation index](docs/README.md)**
- Developer: [Getting started](docs/developer/getting-started.md) · [Architecture](docs/developer/architecture.md) · [Database](docs/developer/database.md) · [i18n](docs/developer/i18n.md) · [Deployment](docs/developer/deployment.md) · [iOS app](docs/developer/ios-app.md) · [Contributing](docs/developer/contributing.md)
- User guide (English): [Getting started](docs/user/en/getting-started.md) · [Tasks](docs/user/en/tasks.md) · [Calendar](docs/user/en/calendar.md) · [Mindmaps](docs/user/en/mindmaps.md) · [Settings](docs/user/en/settings.md) · [FAQ](docs/user/en/faq.md)
- Benutzerhandbuch (Deutsch): [Erste Schritte](docs/user/de/erste-schritte.md) · [Aufgaben](docs/user/de/aufgaben.md) · [Kalender](docs/user/de/kalender.md) · [Mindmaps](docs/user/de/mindmaps.md) · [Einstellungen](docs/user/de/einstellungen.md) · [FAQ](docs/user/de/faq.md)

## 🤝 Contributing

Contributions are welcome! Please read the [contributing guide](docs/developer/contributing.md) for code style, the feature-module pattern, and the PR checklist.

## 📄 License

MIT
