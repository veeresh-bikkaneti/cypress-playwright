# Enterprise AI coding agents

This repo is a **Cypress → Playwright** migration toolkit that any enterprise coding agent can run. The procedure is not Copilot-shaped. Copilot, Claude, Cursor, and Gemini get thin adapters so their native UI still works.

## Architecture

```text
                    ┌─────────────────────────────────┐
                    │  AGENTS.md   (always-on facts)  │
                    │  skills/*/SKILL.md (procedures) │
                    └─────────────────────────────────┘
                                      │
          ┌──────────────┬────────────┼────────────┬──────────────┐
          ▼              ▼            ▼            ▼              ▼
     GitHub Copilot  Claude Code   Cursor     Gemini        Grok / Codex / OpenCode
     .github/        CLAUDE.md     .cursor/   GEMINI.md     (core only)
                     .claude/      rules
```

| Layer | File | Loaded when | Owned by |
| --- | --- | --- | --- |
| Project contract | `AGENTS.md` | Session start on every supporting agent | Shared |
| Task playbook | `skills/<name>/SKILL.md` | Description matches the user ask | Shared ([Agent Skills spec](https://agentskills.io/specification)) |
| Vendor adapter | see table below | That vendor’s UI | Thin pointer back to the two layers above |

If an adapter contradicts `AGENTS.md`, **`AGENTS.md` wins**.

## Enterprise set (shipped)

| Tool | Why it is in the set | Always-on | Skills discovery | Optional invocation |
| --- | --- | --- | --- | --- |
| **GitHub Copilot** | Default in GitHub-centric orgs | `AGENTS.md` + `.github/copilot-instructions.md` | `.github/skills/` | `@qa-orchestrator`, `@cypress-to-playwright-migration`, … |
| **Claude Code** | Common independent-agent path | `AGENTS.md` + `CLAUDE.md` | `.claude/skills/` + `skills/` | `/migrate` `/heal` `/review` |
| **Cursor** | Common IDE agent (Team/Enterprise rules) | `AGENTS.md` | `.cursor/skills/` | `.cursor/rules/*.mdc` globs |
| **Grok** | xAI coding agents read `AGENTS.md` | `AGENTS.md` | `skills/` | Natural language |
| **OpenAI Codex** | ChatGPT/Codex enterprise | `AGENTS.md` | `.agents/skills/` | Natural language |
| **Gemini** | Code Assist, Antigravity, Jules | `AGENTS.md` + `GEMINI.md` | `skills/` | Natural language |
| **OpenCode** | Reads `AGENTS.md` natively | `AGENTS.md` | `skills/` | Natural language |

Not shipped (hobby / non-enterprise CLIs): Aider, Cline, Continue, Windsurf.

Amazon Q Developer is not shipped yet — it uses `.amazonq/rules/`. Add an adapter when there is a named customer. Until then `AGENTS.md` is still the portable contract if the org also uses a tool that reads it.

## What each vendor actually reads (live docs, 2026)

Sources: [GitHub Copilot custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot), [VS Code custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents), [Claude Code skills](https://code.claude.com/docs/en/skills), [Cursor rules](https://cursor.com/docs/rules), [Cursor skills](https://cursor.com/docs/skills), [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md/), [Codex skills](https://developers.openai.com/codex/skills), [Gemini agent mode](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer), [OpenCode instructions](https://opencode.ai/v2/docs/instructions/), [Agent Skills spec](https://agentskills.io/specification).

### GitHub Copilot

- **Repo instructions:** `.github/copilot-instructions.md` (always).
- **Path instructions:** `.github/instructions/*.instructions.md` with `applyTo`.
- **Agent instructions:** `AGENTS.md` at repo root (and nested).
- **Custom agents:** `.github/agents/*.md` or `*.agent.md` with YAML frontmatter (`name`, `description`, optional `tools`, `model`). VS Code prefers `.agent.md`. GitHub.com also accepts `CUSTOM-AGENT-NAME.md`.
- **Skills:** `.github/skills/<name>/SKILL.md`.

This adapter ships five agents (`qa-orchestrator`, migrator, healer, generator, planner) as **thin wrappers** that load the matching skill. It does not pin a model (`model: inherit`).

### Claude Code

- **Always-on:** `CLAUDE.md` (and `AGENTS.md` when present).
- **Skills:** `.claude/skills/<name>/SKILL.md`. Slash `/skill-name` also works. `.claude/commands/*.md` is still supported; this repo uses it for short aliases (`/migrate`, `/heal`, `/review`).
- **Do not** put the 500-line procedure in `CLAUDE.md`. Point at skills.

### Cursor

- **Always-on:** `AGENTS.md` is a first-class rule type.
- **Project rules:** `.cursor/rules/*.mdc` **must** have YAML frontmatter (`description`, `globs`, `alwaysApply`). A plain `.md` in that folder is ignored.
- **Skills:** `.cursor/skills/<name>/SKILL.md`.

This adapter ships one glob-scoped rule for `playwright/**` and `cypress/**`. It does **not** `alwaysApply: true` — that would duplicate `AGENTS.md`.

### Grok / Codex / OpenCode

No extra files. They read `AGENTS.md`. Codex also scans `.agents/skills/` (the installer always mirrors there). OpenCode also reads nested `AGENTS.md` and optional `opencode.json` `instructions` — we do not pin a model in `opencode.json`.

### Gemini (Code Assist / Antigravity / Jules)

- **VS Code / CLI:** `GEMINI.md` walked from cwd to repo root; `~/.gemini/GEMINI.md` is user-global.
- **IntelliJ:** `GEMINI.md` or `AGENT.md`.
- **Antigravity 1.20.3+:** reads `AGENTS.md` and `GEMINI.md`; `GEMINI.md` wins on conflict. Keep `GEMINI.md` a pointer so it cannot drift.

## How a user talks to the agent

The same English works everywhere. Vendor syntax is optional sugar.

| Intent | Any agent | Copilot | Claude |
| --- | --- | --- | --- |
| Convert a spec | `migrate cypress/e2e/tests/login.test.ts` | `@cypress-to-playwright-migration …` | `/migrate cypress/e2e/tests/login.test.ts` |
| Fix a failure | `heal playwright/e2e/smoke.spec.ts` | `@playwright-healer …` | `/heal playwright/e2e/smoke.spec.ts` |
| Plan coverage | `plan E2E for the dashboard` | `@playwright-test-planner …` | natural language + `webapp-testing` |
| Review | `review the last migration` | Copilot code review / new chat | `/review` |

## Installer

```bash
npx cypress2playwright-setup setup                          # core + detected adapters
npx cypress2playwright-setup setup --tools copilot,claude,cursor
npx cypress2playwright-setup setup --all
```

Always written: `AGENTS.md`, `skills/`, mirrors at `.agents/skills/` and `.github/skills/`.

Written only for that adapter: Copilot `.github/**`, Claude `CLAUDE.md` + `.claude/**`, Cursor `.cursor/**`, Gemini `GEMINI.md`.

## Rules for adding a new enterprise tool

1. If it already reads `AGENTS.md` + Agent Skills → **core only**. Do not invent a config file.
2. If it has a documented always-on file (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules`) → add a **thin** adapter that points at `AGENTS.md`. No duplicated command map.
3. If it has a documented skills path, have the installer **mirror** `skills/` there.
4. Never pin a paid model. Use `model: inherit` or omit.
5. Do not add hobby CLIs to the supported-tools table.

## What we deliberately do not ship

- Nested Copilot personas (`backend-specialist`, `qa-roles/*`, `cypress-healer`) — they are Copilot-only and duplicate skills.
- Aider / Cline / Continue / Windsurf templates.
- Live-doc fetch sections in always-on files (air-gapped orgs; `--no-fetch` strips leftovers).
