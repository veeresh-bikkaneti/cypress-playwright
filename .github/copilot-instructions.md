# GitHub Copilot adapter

**Source of truth is [`AGENTS.md`](../AGENTS.md).** If this file conflicts with it, `AGENTS.md` wins.

This file is always-on for Copilot (IDE, CLI, coding agent). Keep it short. Procedures live in Agent Skills, not here.

## Skills (load on demand)

| Task | Skill |
| --- | --- |
| Convert Cypress → Playwright | `skills/cypress-to-playwright-migration` (also `.github/skills/`) |
| Write or heal Playwright | `skills/playwright-testing` |
| Plan coverage | `skills/webapp-testing` |
| Review before merge | `skills/code-review` — **isolated** pass with a git range, not this session |

## Optional @mentions

- `@qa-orchestrator` — route when the user has not named a specialist
- `@cypress-to-playwright-migration`
- `@playwright-healer`
- `@playwright-test-generator`
- `@playwright-test-planner`

Do not require `@` syntax. Natural language must work.

## Non-negotiables (same as AGENTS.md)

1. No `cy.*` in `playwright/`.
2. Await every Playwright action and assertion.
3. Never `page.waitForTimeout`.
4. Locators: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`.
5. Auth via `storageState` or fixtures.
6. TypeScript strict. No `// ... rest of code`.

Pin APIs to versions in `package.json`. Do not invent Cypress or Playwright methods.
