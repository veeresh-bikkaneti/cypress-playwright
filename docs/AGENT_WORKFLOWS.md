# AI agent workflows

Vendor syntax is optional. Every workflow below works as **natural language** against `AGENTS.md` + `skills/`. Copilot `@mentions` and Claude `/commands` are adapters.

Full tool matrix: [ENTERPRISE_AGENTS.md](./ENTERPRISE_AGENTS.md).

## Skills (canonical)

| Skill | Use when |
| --- | --- |
| `skills/cypress-to-playwright-migration` | Convert a Cypress spec or custom command |
| `skills/playwright-testing` | Write or heal Playwright tests |
| `skills/webapp-testing` | Plan coverage, not a single spec |
| `skills/code-review` | Isolated review with a git range before merge |

## Workflows

### 1. Migrate a Cypress spec

> Migrate `cypress/e2e/tests/login.test.ts` to Playwright using the Page Object Model.

Copilot: `@cypress-to-playwright-migration …` · Claude: `/migrate cypress/e2e/tests/login.test.ts`

1. Agent reads the Cypress spec and custom commands.
2. Maps UI flows → Page Object, auth/session → fixture / `storageState`.
3. Writes `playwright/pages/…` and `playwright/e2e/….spec.ts`.
4. Runs `npx tsc --noEmit` and `npx playwright test --project=chromium` on the new file.
5. Dispatches `skills/code-review` in a **separate** pass against the Cypress source.

### 2. Plan coverage for a feature

> Plan Playwright coverage for the shopping cart. Do not write specs yet.

Copilot: `@playwright-test-planner …`

Loads `skills/webapp-testing`. Output: flows, files, fixtures. Hand off writing to the generator / `playwright-testing`.

### 3. Generate tests from a plan

> Generate Playwright tests for the shopping cart based on this plan.

Copilot: `@playwright-test-generator …`

Loads `skills/playwright-testing`. Semantic locators first (`getByRole` / `getByLabel`).

### 4. Heal a failure

> Heal `playwright/e2e/cart.spec.ts`. Here are the logs / trace.

Copilot: `@playwright-healer …` · Claude: `/heal playwright/e2e/cart.spec.ts`

Read the error. Update the user-facing locator or wait on a condition. Never `waitForTimeout`. Re-run the spec.

### 5. Review before merge

> Review the last migration. Base is origin/main.

Claude: `/review` · Copilot: new chat or GitHub code review (not the same session that wrote the code).

Loads `skills/code-review`. Reviewer gets a git range + requirements only.

## Routing (when the user does not name a specialist)

`@qa-orchestrator` (Copilot) or any agent reading `AGENTS.md`:

| Ask | Skill |
| --- | --- |
| Convert Cypress | `cypress-to-playwright-migration` |
| New or broken Playwright | `playwright-testing` |
| What should we automate? | `webapp-testing` |
| Is this mergeable? | `code-review` (isolated) |
