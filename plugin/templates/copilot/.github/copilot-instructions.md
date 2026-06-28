---
description: Behavioral guidelines for Cypress-to-Playwright migration. Use when writing, reviewing, or migrating tests.
alwaysApply: true
---

# Cypress → Playwright Migration (Repository Instructions)

## Scope & Goals

Migrate Cypress E2E tests to Playwright TypeScript using @playwright/test.

- **Target**: Production-grade, maintainable, type-safe Playwright tests
- **Do NOT recommend or rely on third-party codemod services/tools**
- **Maintain or improve** test coverage, reliability, and execution speed

## OWASP Security Guidelines

All code and tests must adhere to OWASP Top 10 security best practices.

1. **Input Validation**: Validate and sanitize all inputs in tests and application code.
2. **Authentication**: Use secure authentication flows; avoid hardcoding credentials.
3. **Data Protection**: Never commit sensitive data (tokens, keys, PII). Use environment variables.
4. **Secure Configuration**: Ensure test environment matches securely configured production settings.
5. **Dependencies**: Regularly scan `package.json` for vulnerabilities using `npm audit`.

## Non-Negotiable Quality Rules

- **All Playwright actions/assertions are async and MUST be awaited**
- **Output complete files only** - no placeholders, no ellipses
- **No `cy.*` remains in migrated output** - verify with regex search
- **All TypeScript errors must be resolved** - run `npx tsc --noEmit` before committing
- **Preserve test intent and coverage** - never silently drop test cases or assertions

## Tech Stack

- **Target Framework**: Playwright Test v1.38+
- **Cypress**: v10.x – 15.x (for migration source reference)
- **Node.js**: v20+ required
- **Language**: TypeScript (Strict Mode)
- **Path Aliases**:
  - `@pages/*` → `playwright/pages/*`
  - `@fixtures/*` → `playwright/fixtures/*`
  - `@helpers/*` → `playwright/helpers/*`

## Locator Priority

1. `page.getByRole(role, { name })` - **Preferred**
2. `page.getByLabel(text)` - For form fields
3. `page.getByPlaceholder(text)` - For inputs with placeholders
4. `page.getByText(text)` - For text content
5. `page.getByTestId(id)` - When semantic locators aren't viable
6. `page.locator(css/xpath)` - **Last resort**

## Cypress → Playwright Mapping

| Cypress | Playwright |
|---------|-----------|
| `cy.visit('/page')` | `await page.goto('/page')` |
| `cy.get('[data-testid="x"]')` | `page.getByTestId('x')` |
| `cy.contains('text')` | `page.getByText('text')` |
| `cy.get('button').click()` | `await page.getByRole('button').click()` |
| `cy.get('input').type('text')` | `await page.getByLabel('Input').fill('text')` |
| `cy.intercept('GET', '/api', {})` | `await page.route('**/api', r => r.fulfill({json: {}}))` |
| `cy.wait('@alias')` | `await page.waitForResponse('**/api')` |
| `cy.get('.el').should('be.visible')` | `await expect(page.locator('.el')).toBeVisible()` |

## Validation Checklist

- [ ] All `cy.*` calls removed (regex: `\bcy\.[a-z]`)
- [ ] All Playwright actions have `await`
- [ ] All assertions use `expect()` from `@playwright/test`
- [ ] Locators prefer `getByRole`, `getByLabel`, `getByText` over CSS
- [ ] No `page.waitForTimeout()` without justification
- [ ] Dialog handlers call `accept()` or `dismiss()`
- [ ] Network waits use `waitForResponse()` not fixed delays
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Tests pass in parallel (`npx playwright test --workers=4`)
- [ ] No shared state between tests
