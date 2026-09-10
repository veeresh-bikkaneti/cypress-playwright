# GitHub Copilot adapter

This folder is the **Copilot** adapter. The source of truth for every agent is root [`AGENTS.md`](../AGENTS.md) and [`skills/`](../skills/).

See [docs/ENTERPRISE_AGENTS.md](../docs/ENTERPRISE_AGENTS.md) for Claude, Cursor, Grok, Codex, Gemini, and OpenCode.

## Always-on

| File | Role |
| --- | --- |
| [`copilot-instructions.md`](./copilot-instructions.md) | Short Copilot pointer at `AGENTS.md` |
| [`instructions/playwright.instructions.md`](./instructions/playwright.instructions.md) | Path-scoped: `playwright/**` |
| [`instructions/cypress.instructions.md`](./instructions/cypress.instructions.md) | Path-scoped: `cypress/**` (migration source) |
| [`skills/`](./skills/) | Mirror of root `skills/` (Copilot discovery path) |

## Custom agents (`*.agent.md`)

Thin wrappers. Each loads a skill. `model: inherit`.

| Mention | Skill |
| --- | --- |
| `@qa-orchestrator` | Routes to the right skill |
| `@cypress-to-playwright-migration` | `cypress-to-playwright-migration` |
| `@playwright-healer` | `playwright-testing` (heal) |
| `@playwright-test-generator` | `playwright-testing` (write) |
| `@playwright-test-planner` | `webapp-testing` |

Nested files under `agents/cypress/`, `agents/playwright/`, `agents/qa-roles/` are **legacy**. Prefer the `.agent.md` files at `agents/` root.

Natural language still works: “migrate `cypress/e2e/tests/login.test.ts`”.
