---
trigger: always_on
description: "Core Playwright testing standards for Cypress-to-Playwright migration"
---

# Playwright Testing Standards

## ⚠️ Version Compatibility

Before generating code, check the user's installed Playwright/Cypress version (`npx playwright --version` or `npx cypress --version`) and fetch the relevant official documentation to ensure API compatibility:

- Playwright: https://playwright.dev/docs
- Cypress: https://docs.cypress.io

## Locator Priority

1. `page.getByRole()` — preferred for interactive elements
2. `page.getByLabel()` — for form fields
3. `page.getByText()` — for text content
4. `page.getByTestId()` — when semantic locators aren't viable
5. `page.locator()` — last resort

## Required Patterns

- All Playwright actions/assertions must be `await`ed
- Never use `waitForTimeout` — use explicit waits
- Use Page Object Models for pages with 3+ interactions
- Each test must run in isolation

## Forbidden Patterns

- `cy.*` calls (Cypress remnants)
- Generic CSS selectors without justification
- Index-based selection without comment
- Shared state between tests

## Cypress → Playwright Quick Reference

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

## Migration Steps

1. Read and understand the Cypress test
2. Create Page Object if needed
3. Convert `cy.*` to `await page.*`
4. Replace selectors with semantic locators
5. Convert hooks to fixtures
6. Verify with `npx tsc --noEmit` and `npx playwright test`

## File Structure

- Tests: `playwright/e2e/**/*.spec.ts`
- Pages: `playwright/pages/*.ts`
- Fixtures: `playwright/fixtures/*.fixture.ts`
