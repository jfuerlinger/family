---
name: context7-cli
description: >
  Use the ctx7 CLI to fetch library documentation, manage AI coding skills, and
  configure Context7 MCP. Activate when the user mentions "ctx7" or "context7",
  needs current docs for any library, wants to install/search/generate skills,
  or needs to set up Context7 for their AI coding agent. Use when the user runs
  /context7-cli.
allowed-tools: Bash(npx:*) Bash(ctx7:*) Bash(npm:*)
---

# ctx7 CLI

Grok copy of the official Upstash `context7-cli` skill. The Context7 CLI does three things: fetches up-to-date library documentation, manages AI coding skills, and sets up Context7 MCP.

Run commands with `npx ctx7@latest` so setup always uses the latest CLI without a global install. Use `run_terminal_command` for every ctx7 invocation.

```bash
npx ctx7@latest <command>
```

Optionally install globally if you prefer a bare `ctx7` command:

```bash
npm install -g ctx7@latest
```

## What this skill covers

- **[Documentation](references/docs.md)** — Fetch current docs for any library. Use when writing code, verifying API signatures, or when training data may be outdated.
- **[Skills management](references/skills.md)** — Install, search, suggest, list, remove, and generate AI coding skills.
- **[Setup](references/setup.md)** — Configure Context7 MCP for Grok (this repo) and other agents.

## Quick Reference

```bash
# Documentation
npx ctx7@latest library <name> <query>           # Step 1: resolve library ID
npx ctx7@latest docs <libraryId> <query>         # Step 2: fetch docs

# Skills — install into this repo's Grok skill dir
npx skills add <owner/repo> --skill <name> -y --agent grok
npx ctx7@latest skills search <keywords>
npx ctx7@latest skills suggest
npx ctx7@latest skills list
npx ctx7@latest skills remove <name>
npx ctx7@latest skills generate

# Setup
npx ctx7@latest login
npx ctx7@latest whoami
```

## Authentication

```bash
npx ctx7@latest login               # Opens browser for OAuth
npx ctx7@latest login --no-browser  # Prints URL instead of opening browser
npx ctx7@latest logout              # Clear stored tokens
npx ctx7@latest whoami              # Show current login status (name + email)
```

Most commands work without login. Exceptions: `skills generate` always requires it; `ctx7 setup` requires it unless `--api-key` or `--oauth` is passed. Login also unlocks higher rate limits on docs commands.

Set an API key via environment variable to skip interactive login entirely:

```bash
export CONTEXT7_API_KEY=your_key
```

## Common Mistakes

- Library IDs require a `/` prefix — `/facebook/react` not `facebook/react`
- Always run `npx ctx7@latest library` first — `npx ctx7@latest docs react "hooks"` will fail without a valid ID
- In this repo, Grok skills live in `.grok/skills/` — use `npx skills add … --agent grok`, not `--claude`
- `skills generate` requires login — run `npx ctx7@latest login` first
