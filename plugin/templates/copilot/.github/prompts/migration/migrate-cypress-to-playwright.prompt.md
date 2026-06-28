# Cypress to Playwright Migration

**Slash Command**: `/migrate-cy-to-pw`

## Description
Automatically migrate Cypress tests to Playwright, transforming `cy.*` commands to `await page.*` patterns while maintaining test intent. Supports Cypress 10.x-15.x → Playwright 1.38-1.61+.

## Usage

```
/migrate-cy-to-pw [cypress test file]
```

### Examples

```
/migrate-cy-to-pw cypress/e2e/login.cy.ts
/migrate-cy-to-pw cypress/e2e/checkout/*.cy.ts
/migrate-cy-to-pw "all API tests"
```

## What This Prompt Does

1. **Analyzes Cypress Test**: Understands test structure and intent
2. **Maps Commands**: Converts `cy.*` to `await page.*` using canonical mappings
3. **Converts Custom Commands**: Migrates to Page Objects or Fixtures
4. **Creates Page Objects**: Extracts reusable page interactions
5. **Updates Assertions**: Converts Chai assertions to Playwright `expect()`
6. **Validates**: Ensures migrated test compiles and runs

## Migration Mapping

### Core Patterns

| Cypress | Playwright |
|---------|------------|
| `cy.visit('/login')` | `await page.goto('/login')` |
| `cy.get('[data-testid="btn"]').click()` | `await page.getByTestId('btn').click()` |
| `cy.contains('Submit').click()` | `await page.getByText('Submit').click()` |
| `cy.get('input').type('text')` | `await page.locator('input').fill('text')` |
| `cy.get(el).should('be.visible')` | `await expect(page.locator(el)).toBeVisible()` |
| `cy.intercept('GET', '/api')` | `await page.route('**/api', route => ...)` |
| `cy.wait('@alias')` | `await page.waitForResponse('**/api')` |

### Custom Commands → Page Objects

**Cypress Custom Command**:
```typescript
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});
```

**Playwright Page Object**:
```typescript
export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/login');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }
}
```

## Supported Features

- ✅ E2E test migration
- ✅ API test migration (`cy.request` → `page.request`)
- ✅ Custom command → Page Object conversion
- ✅ Fixture migration
- ✅ Intercept → Route conversion
- ✅ Visual regression migration

## Framework Versions

- **Source**: Cypress 10.x - 15.x
- **Target**: Playwright 1.38 - 1.61+

## Validation Checklist

Before completing migration:
- [ ] All `cy.*` calls removed
- [ ] All Playwright actions have `await`
- [ ] Selectors use semantic locators (getByRole, getByLabel)
- [ ] TypeScript compiles without errors
- [ ] At least 1 test runs successfully
- [ ] No hard-coded waits (`waitForTimeout`)

## Invocation Methods

1. **Slash Command**: `/migrate-cy-to-pw cypress/e2e/login.cy.ts`
2. **Agent Mention**: `@cypress-to-playwright-migration migrate all auth tests`
3. **Natural Language**: "Convert the Cypress login test to Playwright"

## Output Files

- `playwright/e2e/[feature].spec.ts` - Migrated test
- `playwright/pages/[Page]Page.ts` - Page Objects (if custom commands exist)
- `playwright/fixtures/[feature].fixture.ts` - Fixtures (if needed)
- Migration summary report
