# Cypress → Playwright

Shared project facts for **every** coding agent (GitHub Copilot, Claude Code, Cursor, Grok, OpenAI Codex, Gemini, and anything that reads `AGENTS.md`).

Vendor-specific files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules`, `GEMINI.md`) must not contradict this file. If they do, this file wins.

## Goal

Migrate Cypress E2E tests to Playwright Test (TypeScript). Preserve coverage. Prefer Playwright’s own APIs over Cypress-shaped workarounds.

## Layout

| Path | Role |
| --- | --- |
| `cypress/e2e/tests/*.test.ts` | Source Cypress specs |
| `playwright/e2e/*.spec.ts` | Playwright specs |
| `playwright/pages/` | Page objects |
| `playwright/fixtures/` | Fixtures and test data |
| `app-under-test/` | Express app under test (port 3000) |
| `skills/` | Portable Agent Skills (canonical) |

## Non-negotiables

1. No `cy.*` in `playwright/`.
2. Await every Playwright action and assertion.
3. Never `page.waitForTimeout` — use web-first `expect`.
4. Locator order: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`.
5. Page Object Model when a page has 3+ interactions.
6. Auth via `storageState` or fixtures — do not UI-login in every test.
7. TypeScript strict. No placeholders (`// ... rest of code`).

## Skills (load on demand)

Read the matching `skills/<name>/SKILL.md` when the task matches:

| Skill | Use when |
| --- | --- |
| `cypress-to-playwright-migration` | Converting a Cypress spec/command to Playwright |
| `playwright-testing` | Writing or healing Playwright tests |
| `code-review` | Reviewing a completed migration or feature before merge |
| `webapp-testing` | Planning E2E coverage, not writing a single spec |

Discovery copies of the same skills also live at `.agents/skills/` and `.github/skills/` so Copilot, Codex, and Claude find them.

## Quality gates (before calling work done)

```bash
# No Cypress leftovers in Playwright output (ignore comments if needed)
npx tsc --noEmit
npx playwright test --project=chromium
```

Pin APIs to the versions in `package.json`. Do not invent Cypress or Playwright methods.

## How to invoke (any agent)

Natural language is enough: “migrate `cypress/e2e/tests/login.test.ts`”, “heal `playwright/e2e/smoke.spec.ts`”, “review the last migration”.

Do not assume `@mentions` or slash commands exist. Those are optional adapters:

- Copilot Chat: `@cypress-to-playwright-migration`, `@playwright-healer`
- Claude Code: `/migrate`, `/heal`, `/review`
- Cursor: rules auto-apply on `playwright/**` and `cypress/**`
- Grok / Codex / other `AGENTS.md` clients: this file + `skills/`
