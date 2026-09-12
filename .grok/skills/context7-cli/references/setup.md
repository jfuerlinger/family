# Setup

This repo uses Grok. Prefer Grok-native config over `ctx7 setup --claude`.

## Grok (this repo)

**CLI + Skills** is already installed here as `.grok/skills/context7-cli/`. No extra setup is required for documentation lookups.

**MCP (optional)** — register the hosted Context7 server in project Grok config:

```bash
grok mcp add --scope project context7 --transport http https://mcp.context7.com/mcp
```

If the user has `CONTEXT7_API_KEY` set, pass it as a header instead of committing a secret:

```bash
grok mcp add --scope project context7 --transport http https://mcp.context7.com/mcp \
  --header "Authorization: Bearer ${CONTEXT7_API_KEY}"
```

Then refresh `/mcps`. Do not paste API keys into committed `.grok/config.toml`; use `${CONTEXT7_API_KEY}`.

## ctx7 setup (other agents)

One-time command to configure Context7 for non-Grok agents. Prompts for mode on first run:
- **MCP server** — registers the Context7 MCP server so the agent can call tools natively
- **CLI + Skills** — installs a `find-docs` skill that guides the agent to use `ctx7` CLI commands (no MCP required)

```bash
npx ctx7@latest setup                     # Interactive — prompts for mode, then agent/install target
npx ctx7@latest setup --mcp               # Skip prompt, use MCP server mode
npx ctx7@latest setup --cli               # Skip prompt, use CLI + Skills mode

# MCP mode — target a specific agent
npx ctx7@latest setup --claude            # Claude Code only
npx ctx7@latest setup --cursor            # Cursor only
npx ctx7@latest setup --opencode          # OpenCode only

# CLI + Skills mode — target a specific install location
npx ctx7@latest setup --cli --claude      # Claude Code (~/.claude/skills)
npx ctx7@latest setup --cli --cursor      # Cursor (~/.cursor/skills)
npx ctx7@latest setup --cli --universal   # Universal (~/.agents/skills)
npx ctx7@latest setup --cli --antigravity # Antigravity (~/.config/agent/skills)

npx ctx7@latest setup --project           # Configure current project instead of globally
npx ctx7@latest setup --yes               # Skip confirmation prompts
```

**Authentication options:**
```bash
npx ctx7@latest setup --api-key YOUR_KEY  # Use an existing API key (both MCP and CLI + Skills mode)
npx ctx7@latest setup --oauth             # OAuth endpoint — MCP mode only (IDE handles the auth flow)
```

Without `--api-key` or `--oauth`, setup opens a browser for OAuth login. The device flow returns an API key that setup uses for authentication. `--oauth` is MCP-only.

**What gets written — MCP mode:**
- MCP server entry in the agent's config file (`.mcp.json` for Claude, `.cursor/mcp.json` for Cursor, `.opencode.json` for OpenCode)
- A Context7 rule file instructing the agent to use Context7 for library docs
- A `context7-mcp` skill in the agent's skills directory

**What gets written — CLI + Skills mode:**
- A `find-docs` skill in the chosen agent's skills directory, guiding the agent to use `ctx7 library` and `ctx7 docs` commands
