# Cypress2Playwright Using AI

Enterprise Cypress-to-Playwright migration toolkit. One portable core (`AGENTS.md` + Agent Skills) plus thin adapters for **GitHub Copilot, Claude Code, Cursor, Grok, OpenAI Codex, and Gemini**.

[![Playwright](https://img.shields.io/badge/Playwright-v1.58+-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev)
[![Cypress](https://img.shields.io/badge/Cypress-v12+-17202C?style=flat-square&logo=cypress)](https://cypress.io)

## Security

This plugin makes **no network requests**. File copies only. `--no-fetch` strips version-check sections from **files this installer wrote**, not the rest of the consumer repo. Agent configs use `model: inherit`. See [SECURITY.md](./SECURITY.md).

## How it works

```text
AGENTS.md + skills/          ← every agent (Grok, Codex, Copilot, Claude, Cursor, Gemini)
.github/                     ← Copilot adapter
CLAUDE.md + .claude/         ← Claude Code adapter
.cursor/rules/               ← Cursor adapter
GEMINI.md                    ← Gemini adapter
```

Skills follow the [Agent Skills](https://agentskills.io/specification) spec. Copilot also reads `.github/skills/` and `.agents/skills/` (installer mirrors `skills/` there).

### Supported tools

| Tool | Extra files | Invocation |
| --- | --- | --- |
| **All** | `AGENTS.md`, `skills/` | Natural language |
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/agents/*.agent.md` | `@qa-orchestrator`, `@cypress-to-playwright-migration` |
| **Claude Code** | `CLAUDE.md`, `.claude/commands/` | `/migrate`, `/heal`, `/review` |
| **Cursor** | `.cursor/rules/*.mdc` | Auto on `playwright/**`, `cypress/**` |
| **Grok** | (core only) | Reads `AGENTS.md` |
| **OpenAI Codex** | (core only) | Reads `AGENTS.md` + `.agents/skills/` |
| **Gemini** | `GEMINI.md` | Antigravity / Code Assist / Jules |

Not in the enterprise set: Aider, Cline, Continue, Windsurf.

## Quick start

```bash
# Portable core always. Adapters if those tools are already in the repo,
# or pass --tools / --all.
npx cypress2playwright-setup setup
npx cypress2playwright-setup setup --tools copilot,claude,cursor
npx cypress2playwright-setup setup --all
npx cypress2playwright-setup detect
```

```bash
npm install cypress2playwright-using-ai --save-dev
npx cypress2playwright-setup setup --tools copilot,claude
```

Manual: copy `plugin/templates/_shared/` then `plugin/templates/<tool>/` from [veeresh-bikkaneti/cypress-playwright](https://github.com/veeresh-bikkaneti/cypress-playwright).

## What gets installed

| Skill | When to load |
| --- | --- |
| `cypress-to-playwright-migration` | Convert a Cypress spec or custom command |
| `playwright-testing` | Write or heal Playwright tests |
| `code-review` | Isolated review with a git range before merge |
| `webapp-testing` | Plan coverage, not a single spec |

Copilot custom agents (optional): `qa-orchestrator`, `cypress-to-playwright-migration`, `playwright-healer`, `playwright-test-generator`, `playwright-test-planner`.

## Standards (from AGENTS.md)

- Locators: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`
- Await every action/assertion
- No `waitForTimeout`
- Page objects for pages with 3+ interactions
- Auth via `storageState` / fixtures
- TypeScript strict

| Cypress | Playwright |
| --- | --- |
| `cy.visit(url)` | `await page.goto(url)` |
| `cy.get('button').click()` | `await page.getByRole('button', { name }).click()` |
| `cy.contains(text)` | `page.getByText(text)` |
| `cy.get('input').type(text)` | `await page.getByLabel(label).fill(text)` |
| `cy.intercept(method, url)` | `await page.route(pattern, handler)` |
| `cy.session` | `storageState` + setup project |

## CLI

| Flag | Meaning |
| --- | --- |
| `--tools copilot,claude,cursor,grok,codex,gemini` | Vendor adapters |
| `--all` | All adapters (core is always installed) |
| `--target <path>` | Project root |
| `--force` | Overwrite |
| `--no-fetch` | Strip fetch sections from **written** files only |

After setup, **commit `AGENTS.md` and `skills/`** so every agent on the team sees the same rules.

```bash
npm test   # from plugin/ — lists tools and installs into a temp dir
```

