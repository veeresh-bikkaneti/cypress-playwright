# Cypress → Playwright Testing Standards

## ⚠️ Version Check

Before generating code, check installed versions (`npx playwright --version` or `npx cypress --version`) and fetch matching docs from [playwright.dev/docs](https://playwright.dev/docs) or [docs.cypress.io](https://docs.cypress.io) to ensure API compatibility.

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

## Cypress → Playwright Quick Reference

| Cypress | Playwright |
|---------|-----------|
| `cy.visit(url)` | `await page.goto(url)` |
| `cy.get(sel)` | `page.locator(sel)` |
| `cy.contains(text)` | `page.getByText(text)` |
| `cy.get(sel).click()` | `await page.locator(sel).click()` |
| `cy.get(sel).type(text)` | `await page.locator(sel).fill(text)` |
| `cy.intercept(method, url)` | `await page.route(urlPattern, route => ...)` |
| `cy.wait('@alias')` | `await page.waitForResponse(pattern)` |
| `cy.get(sel).should('be.visible')` | `await expect(page.locator(sel)).toBeVisible()` |
| `cy.url().should('include', path)` | `await expect(page).toHaveURL(new RegExp(path))` |
| `cy.title().should('eq', title)` | `await expect(page).toHaveTitle(title)` |

## Forbidden Patterns
- `cy.*` calls (Cypress remnants)
- Generic CSS selectors without justification
- Index-based selection without comment
- Shared state between tests
- `waitForTimeout` — use explicit waits instead

## Migration Steps
1. Read and understand the Cypress test
2. Create a Page Object class if needed
3. Convert `cy.*` calls to `await page.*` equivalents
4. Replace CSS selectors with semantic locators
5. Convert `beforeEach`/`afterEach` to Playwright fixtures
6. Convert `cy.intercept` to `page.route`
7. Convert `cy.wait('@alias')` to `page.waitForResponse`
8. Add proper dialog handlers if needed
9. Verify with `npx tsc --noEmit` and `npx playwright test`

## File Structure
- Tests: `playwright/e2e/**/*.spec.ts`
- Pages: `playwright/pages/*.ts`
- Fixtures: `playwright/fixtures/*.fixture.ts`
- Helpers: `playwright/helpers/*.ts`
