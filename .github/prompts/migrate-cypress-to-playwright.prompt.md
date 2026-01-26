---
name: migrate-cypress-to-playwright
description: "Production-grade Cypress to Playwright migration with POM, fixtures, and type safety"
argument-hint: "Attach Cypress test files, support/commands.*, page objects, and specify target output paths"
agent: agent
tools: ['search', 'usages', 'read', 'edit']
model: gpt-4o
---

# Cypress → Playwright Migration Prompt

You are an expert QA architect migrating Cypress (cypress.io) E2E tests to Playwright TypeScript using @playwright/test.

## Pre-requisites

**You MUST have these files attached** (use `#` in chat to attach):
1. Cypress test file(s): `cypress/e2e/**/*.cy.{js,ts}`
2. Cypress custom commands: `cypress/support/commands.{js,ts}` (contains `Cypress.Commands.add`)
3. Cypress support files: `cypress/support/e2e.{js,ts}`, `cypress/support/index.{js,ts}`
4. Any Cypress page objects or helpers referenced in tests
5. Existing Playwright config (if present): `playwright.config.ts`
6. Target directory structure specification

## Migration Instructions

Follow the **complete** repository instructions at `.github/copilot-instructions.md`.

### Phase 1: Analyze Cypress Custom Commands

**CRITICAL**: Before migrating tests, identify all `Cypress.Commands.add()` calls in attached files.

For **each** custom command, classify it:

#### Type A: UI Workflow Command
- **Indicators**: Uses `cy.visit()`, `cy.get()`, `cy.click()`, `cy.type()`, assertions
- **Migration**: Create Playwright Page Object with `async` method
- **Example**: `cy.login(user, pass)` → `LoginPage.login(user, pass)`

#### Type B: Setup/Auth Command
- **Indicators**: API calls (`cy.request`), session management, data seeding
- **Migration**: Create Playwright fixture or global setup
- **Example**: `cy.loginViaAPI()` → Custom `authenticatedPage` fixture

#### Type C: Utility Helper
- **Indicators**: Pure functions, no DOM interaction
- **Migration**: Standard TypeScript helper function
- **Example**: `cy.generateUID()` → `generateUID()` helper

### Phase 2: Create Playwright Foundation

Before migrating tests, generate:

1. **Page Objects** (for Type A commands)
   - Location: `tests/pages/*.ts`
   - Pattern: Constructor accepts `Page`, locators as getters, actions as `async` methods
   - Use semantic locators: `getByRole` > `getByLabel` > `getByTestId`

2. **Fixtures** (for Type B commands)
   - Location: `tests/fixtures/*.fixture.ts`
   - Pattern: `base.extend()` with setup/teardown logic
   - Support storage state for auth persistence

3. **Helpers** (for Type C commands)
   - Location: `tests/helpers/*.ts`
   - Pattern: Pure TypeScript functions

### Phase 3: Migrate Tests

For each Cypress test file:

1. **Convert structure**:
   ```typescript
   // Cypress
   describe('Login', () => {
     it('allows valid login', () => {
       cy.visit('/login');
       cy.get('#username').type('user@example.com');
       cy.get('#password').type('password123');
       cy.get('button[type="submit"]').click();
       cy.url().should('include', '/dashboard');
     });
   });

   // Playwright
   import { test, expect } from '@playwright/test';
   import { LoginPage } from '../pages/LoginPage';

   test.describe('Login', () => {
     test('allows valid login', async ({ page }) => {
       const loginPage = new LoginPage(page);
       await loginPage.goto();
       await loginPage.login('user@example.com', 'password123');
       await expect(page).toHaveURL(/\/dashboard/);
     });
   });
   ```

2. **Replace selectors** (priority order):
   - `cy.get('#username')` → `page.getByLabel('Username')` (preferred)
   - `cy.get('[data-testid="submit"]')` → `page.getByTestId('submit')`
   - `cy.contains('Login')` → `page.getByRole('button', { name: 'Login' })`

3. **Convert assertions**:
   - `cy.get(sel).should('be.visible')` → `await expect(page.locator(sel)).toBeVisible()`
   - `cy.url().should('include', path)` → `await expect(page).toHaveURL(new RegExp(path))`

4. **Handle network**:
   - Replace `cy.intercept()` with `page.route()`
   - Replace `cy.wait('@alias')` with `page.waitForResponse()`

5. **Handle dialogs**:
   - Add `page.once('dialog', async dialog => await dialog.accept())`
   - **MUST** call `accept()` or `dismiss()` to prevent freeze

### Phase 4: Verify Output

**Every migrated file MUST**:
- Be complete (no placeholders, no `// ...`)
- Have all `cy.*` calls removed
- Have all Playwright actions awaited
- Use semantic locators (getByRole, getByLabel, etc.)
- Pass TypeScript compilation (`npx tsc --noEmit`)

## Output Format

For each migrated file:

```typescript
// File: tests/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get usernameInput(): Locator {
    return this.page.getByLabel('Username');
  }

  get passwordInput(): Locator {
    return this.page.getByLabel('Password');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Log in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

## Final Checklist

After migration, provide:

### Validation Checklist
- [ ] All `cy.*` calls removed
- [ ] All Playwright actions awaited
- [ ] Semantic locators used (getByRole, getByLabel, getByText)
- [ ] No `waitForTimeout()` without justification
- [ ] Dialog handlers included where needed
- [ ] Network interception uses `page.route()`
- [ ] TypeScript compiles without errors
- [ ] All files complete (no placeholders)

### TODO List
Document any items that need user input:
- Ambiguous custom command implementations
- Missing semantic attributes (data-testid needed)
- Unknown business logic in complex assertions
- Environment-specific configuration

## Common Mistakes to Avoid

1. **Don't** create a Playwright "command registry" - use Page Objects
2. **Don't** forget `await` on Playwright actions
3. **Don't** use fragile CSS selectors when semantic locators are available
4. **Don't** use `waitForTimeout()` - use explicit assertions
5. **Don't** leave `cy.*` calls in the output
6. **Don't** output incomplete files with placeholders

## Example Migration

**Input** (Cypress):
```javascript
// cypress/e2e/auth.cy.js
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
});
```

**Output** (Playwright):
```typescript
// tests/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get emailInput(): Locator {
    return this.page.getByTestId('email-input');
  }

  get passwordInput(): Locator {
    return this.page.getByTestId('password-input');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('submit-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully', async ({ page }) => {
    await loginPage.login('test@example.com', 'password123');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
```

## Resources

- Repository Instructions: `.github/copilot-instructions.md`
- Playwright Docs: https://playwright.dev/docs/intro
- Locators Guide: https://playwright.dev/docs/locators
- Fixtures Guide: https://playwright.dev/docs/test-fixtures
