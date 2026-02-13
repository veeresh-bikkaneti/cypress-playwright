# Cypress to Playwright Migration

**Slash Command**: `/migrate-cy-to-pw`

## Description
Automatically migrate Cypress tests to Playwright, transforming `cy.*` commands to `await page.*` patterns while maintaining test intent. Supports Cypress 10.x-13.x → Playwright 1.38-1.48+.

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

### Custom Commands → Page Objects

**Cypress Custom Command**:
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});
```

**Playwright Page Object**:
```typescript
// playwright/pages/LoginPage.ts
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

✅ E2E test migration  
✅ API test migration (`cy.request` → `page.request`)  
✅ Component test migration (experimental)  
✅ Custom command → Page Object conversion  
✅ Fixture migration  
✅ Intercept → Route conversion  
✅ Visual regression migration  
✅ Accessibility test migration

## Framework Versions

- **Source**: Cypress 10.x, 11.x, 12.x, 13.x
- **Target**: Playwright 1.38, 1.40, 1.44, 1.48+

## Quality Assurance

Every migrated test includes:
- Requirements traceability comments
- BDD or AAA structure
- Unstated requirements (a11y, security, performance)
- Self-healing selectors (prefer `getByRole`, `getByLabel`)

## Server Configuration

**CRITICAL**: Playwright tests require proper server configuration in `playwright.config.ts`:

### Required Config

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://127.0.0.1:3000', // Match dev server URL
  },
  
  // If tests need dev server, add webServer config:
  webServer: {
    command: 'npm run dev',           // Or: cd app-dir && npm start
    url: 'http://127.0.0.1:3000',    // Server URL
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,              // 2 minutes for server startup
  },
});
```

### When to Use `webServer`

- ✅ Tests require application running (E2E tests)
- ✅ Dev server needs to start automatically
- ✅ CI/CD needs self-contained test execution
- ❌ Tests use mocked data only (no server needed)
- ❌ Server already running in separate process

### Common Patterns

**Pattern 1: Standalone Server**
```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
}
```

**Pattern 2: Server in Subdirectory**
```typescript
webServer: {
  command: 'cd app-under-test && npm run dev',
  url: 'http://localhost:3000',
}
```

**Pattern 3: Custom Port**
```typescript
webServer: {
  command: 'npm run dev -- --port 8080',
  url: 'http://localhost:8080',
}
```

## Invocation Methods

1. **Slash Command**: `/migrate-cy-to-pw cypress/e2e/login.cy.ts`
2. **Agent Mention**: `@cypress-to-playwright-migration migrate all auth tests`
3. **Natural Language**: "Convert the Cypress login test to Playwright"

## Output Files

The agent will create:
- `playwright/e2e/[feature].spec.ts` - Migrated test
- `playwright/pages/[Page]Page.ts` - Page Objects (if custom commands exist)
- `playwright/fixtures/[feature].fixture.ts` - Fixtures (if needed)
- Migration summary report

## Validation Checklist

Before completing migration, ensures:
- [ ] All `cy.*` calls removed
- [ ] All Playwright actions have `await`
- [ ] Selectors use semantic locators (getByRole, getByLabel)
- [ ] TypeScript compiles without errors
- [ ] **`playwright.config.ts` has correct `baseURL`**
- [ ] **`webServer` configured (if dev server needed)**
- [ ] **Server starts successfully with configured command**
- [ ] **At least 1 test runs successfully**
- [ ] Tests pass in isolation
- [ ] No hard-coded waits (`waitForTimeout`)
