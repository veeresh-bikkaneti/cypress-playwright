# Cypress → Playwright Testing Conventions

## ⚠️ Version Compatibility

Before generating code, check the user's installed Playwright/Cypress version (`npx playwright --version` or `npx cypress --version`) and fetch the relevant official documentation to ensure API compatibility:

- Playwright: https://playwright.dev/docs
- Cypress: https://docs.cypress.io

## Project Overview

This project demonstrates Cypress-to-Playwright migration patterns with AI-assisted test automation.

## Tech Stack

- **Primary Framework**: Playwright Test v1.38+ (TypeScript)
- **Legacy Framework**: Cypress v10.x – 15.x
- **Node.js**: v20+ required

## Coding Standards

### TypeScript

- Strict mode enabled
- All functions must have explicit return types
- No `any` type — use proper types
- All imports must be used

### Playwright Patterns

- All actions/assertions MUST be `await`ed
- Prefer semantic locators: `getByRole` > `getByLabel` > `getByText` > `getByTestId`
- Never use `waitForTimeout` — use explicit waits
- Use Page Object Models for pages with 3+ interactions
- Each test must run in isolation

### Cypress → Playwright Mapping

| Cypress                            | Playwright                                      |
| ---------------------------------- | ----------------------------------------------- |
| `cy.visit(url)`                    | `await page.goto(url)`                          |
| `cy.get(sel)`                      | `page.locator(sel)`                             |
| `cy.contains(text)`                | `page.getByText(text)`                          |
| `cy.get(sel).click()`              | `await page.locator(sel).click()`               |
| `cy.get(sel).type(text)`           | `await page.locator(sel).fill(text)`            |
| `cy.intercept(method, url)`        | `await page.route(urlPattern, route => ...)`    |
| `cy.wait('@alias')`                | `await page.waitForResponse(pattern)`           |
| `cy.get(sel).should('be.visible')` | `await expect(page.locator(sel)).toBeVisible()` |

### File Structure

- Tests: `playwright/e2e/**/*.spec.ts`
- Pages: `playwright/pages/*.ts`
- Fixtures: `playwright/fixtures/*.fixture.ts`
- Helpers: `playwright/helpers/*.ts`

### Forbidden Patterns

- `cy.*` calls in Playwright output
- Generic CSS selectors without justification
- Index-based selection without comment
- Shared state between tests
- `waitForTimeout` — use explicit waits instead

## Commands

- `npx playwright test` — Run all tests
- `npx playwright test --project=chromium` — Chromium only
- `npx tsc --noEmit` — Type check
- `npm run lint` — ESLint
- `npm run validate` — Full validation
