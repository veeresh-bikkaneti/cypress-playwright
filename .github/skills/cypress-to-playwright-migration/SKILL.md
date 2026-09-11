---
name: cypress-to-playwright-migration
description: Migrate Cypress E2E tests and custom commands to Playwright Test TypeScript. Use when converting cy.* specs, cypress/support/commands, intercepts, sessions, or origin tests into Playwright.
license: MIT
---

# Cypress → Playwright migration

Follow root `AGENTS.md`. This skill is the procedure.

## Steps

1. Read the Cypress spec and `cypress/support/commands.*`. List custom commands and state (auth, intercepts, clocks).
2. Map each custom command:
   - UI workflow → Page Object method
   - Auth / seed / session → Playwright fixture or `storageState`
   - Pure helper → `playwright/helpers/` function
   - Never recreate a global command registry
3. Write or update the Page Object. Locators: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`.
4. Write the spec under `playwright/e2e/` as `*.spec.ts`. Mirror test intent; do not drop cases.
5. Run `npx tsc --noEmit` then `npx playwright test --project=chromium` on the new file.
6. After it passes, load `skills/code-review` and review against the Cypress source. Only then delete the Cypress spec.

## Command map

| Cypress | Playwright |
| --- | --- |
| `cy.visit(url)` | `await page.goto(url)` |
| `cy.get(sel).click()` | `await page.getByRole(...).click()` |
| `cy.contains(text)` | `page.getByText(text)` |
| `cy.get('input').type(text)` | `await page.getByLabel(...).fill(text)` |
| `cy.intercept(method, url)` | `await page.route(pattern, handler)` |
| `cy.wait('@alias')` | `await page.waitForResponse(pattern)` |
| `cy.get(el).should('be.visible')` | `await expect(locator).toBeVisible()` |
| `cy.session` | `storageState` + setup project |
| `cy.origin` | `page.context().newPage()` or a second `baseURL` project |
| `cy.clock` | `page.clock` |

`fill()` replaces `type()` unless character-by-character delay is required — then `pressSequentially()`.

## Refuse

- `page.waitForTimeout`
- Index locators (`.nth(n)`) without a filter
- Leftover `cy.*`
- Incomplete files with `// ...`

## After the spec passes

Dispatch an isolated code review (`skills/code-review`) with the git range and the Cypress file as requirements. Fix Critical and Important findings before marking the migration done.
