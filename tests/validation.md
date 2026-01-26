# Validation Checklist - Cypress to Playwright Migration

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [During Migration Checklist](#during-migration-checklist)
3. [Post-Migration Validation](#post-migration-validation)
4. [Automated Validation Scripts](#automated-validation-scripts)
5. [Quality Gates](#quality-gates)

---

## Pre-Migration Checklist

Before starting migration, ensure:

- [ ] **Playwright is installed and configured**
  ```bash
  npx playwright --version
  ```

- [ ] **All Cypress tests are passing**
  ```bash
  npm run test:cypress
  ```

- [ ] **Custom commands are documented**
  - List all `Cypress.Commands.add()` calls
  - Classify each as: UI Workflow, Auth/Setup, or Utility

- [ ] **Dependencies are identified**
  - Map which tests use which custom commands
  - Identify shared page objects or helpers
  - Note any third-party Cypress plugins used

- [ ] **Target directory structure is defined**
  ```
  tests/
    ├── pages/      # Page Object Models
    ├── fixtures/   # Custom fixtures
    ├── helpers/    # Utility functions
    └── specs/      # Test files
  ```

---

## During Migration Checklist

For each file being migrated:

### Code Structure

- [ ] **Test structure converted**
  - `describe()` → `test.describe()`
  - `it()` → `test()`
  - `beforeEach()` → `test.beforeEach(async ({ page }) => {})`
  - `afterEach()` → `test.afterEach(async ({ page }) => {})`

- [ ] **All `cy.*` calls removed**
  ```bash
  # Verify no cy.* remains
  grep -r '\bcy\.' tests/ --include="*.ts" --include="*.js"
  ```

- [ ] **All Playwright actions are awaited**
  - Every `page.*` action has `await`
  - Every `locator.*` action has `await`
  - Every `expect()` assertion has `await`

### Locators

- [ ] **Semantic locators used (priority order)**
  1. ✅ `page.getByRole()` - for interactive elements
  2. ✅ `page.getByLabel()` - for form fields
  3. ✅ `page.getByPlaceholder()` - for input placeholders
  4. ✅ `page.getByText()` - for text content
  5. ✅ `page.getByTestId()` - only when semantic locators unavailable
  6. ⚠️ `page.locator()` - last resort, with comment explaining why

- [ ] **Generic CSS selectors avoided**
  - No `.class-name` without justification
  - No `#id` without justification
  - No complex CSS chains without comment

- [ ] **Index-based selection justified**
  - Every `.nth()` has a comment explaining why
  - Consider alternatives (filtering by text, role, etc.)

### Assertions

- [ ] **All assertions use Playwright expect**
  - Import: `import { expect } from '@playwright/test'`
  - Pattern: `await expect(locator).toBeVisible()`
  - No Cypress assertions (`should()`, `and()`) remain

- [ ] **Assertion patterns correct**
  - Element visibility: `toBeVisible()`, `toBeHidden()`
  - Text content: `toHaveText()`, `toContainText()`
  - Form values: `toHaveValue()`
  - URL: `await expect(page).toHaveURL()`
  - Title: `await expect(page).toHaveTitle()`

### Network Handling

- [ ] **Network interception migrated**
  - `cy.intercept()` → `page.route()`
  - Mock responses use `route.fulfill()`
  - Modifications use `route.continue()`

- [ ] **Network waiting correct**
  - `cy.wait('@alias')` → `page.waitForResponse()`
  - Use predicates or regex for flexibility
  - No arbitrary `waitForTimeout()` for network

### Dialogs

- [ ] **Dialog handlers implemented**
  - Every dialog trigger has `page.once('dialog', ...)`
  - Handler calls `dialog.accept()` or `dialog.dismiss()`
  - Dialog type is verified when needed

### File Operations

- [ ] **File uploads migrated**
  - `cy.selectFile()` → `setInputFiles()`

- [ ] **File reads/writes updated**
  - `cy.readFile()` → `fs.promises.readFile()`
  - `cy.writeFile()` → `fs.promises.writeFile()`

### Custom Commands

- [ ] **UI workflow commands → Page Objects**
  - Class with constructor accepting `Page`
  - Locators as getter methods
  - Actions as `async` methods
  - Located in `tests/pages/`

- [ ] **Auth/setup commands → Fixtures**
  - Created using `base.extend()`
  - Proper setup/teardown with `use()`
  - Located in `tests/fixtures/`

- [ ] **Utility commands → Helper functions**
  - Pure TypeScript/JavaScript functions
  - No page interaction
  - Located in `tests/helpers/`

---

## Post-Migration Validation

After migration is complete:

### Automated Checks

Run these commands to verify migration quality:

#### 1. Check for Remaining Cypress Calls

```bash
# Search for any cy.* calls
grep -r '\bcy\.' tests/ --color

# Expected output: (nothing - all cy.* should be removed)
```

#### 2. TypeScript Compilation

```bash
# Verify all TypeScript compiles without errors
npx tsc --noEmit

# Expected output: (no errors)
```

#### 3. ESLint Checks (if configured)

```bash
# Check for missing awaits and other issues
npx eslint tests/ --ext .ts,.js

# Focus on no-floating-promises rule
npx eslint tests/ --rule '@typescript-eslint/no-floating-promises: error'
```

#### 4. Run Playwright Tests

```bash
# Run all tests
npx playwright test

# Run in headed mode to visually verify
npx playwright test --headed

# Run with parallelization
npx playwright test --workers=4

# Run specific test file
npx playwright test tests/specs/login.spec.ts
```

#### 5. Verify Locator Usage

```bash
# Check for semantic locators (should see many)
grep -r 'getByRole\|getByLabel\|getByText' tests/ --color

# Check for generic locators (should see few)
grep -r '\.locator(' tests/ --color

# Flag CSS selectors that need review
grep -r "locator('\." tests/ --color
```

### Manual Review Checklist

- [ ] **Test names are descriptive**
  - Clear intent in test names
  - Grouped logically in describe blocks

- [ ] **Page Objects follow best practices**
  - One class per page/component
  - Locators as getter methods
  - Actions return `Promise<void>` or useful data
  - No assertions in Page Objects (unless part of action verification)

- [ ] **Fixtures are properly isolated**
  - Each fixture cleans up after itself
  - No shared state between tests
  - Proper use of `use()` for teardown

- [ ] **Tests are independent**
  - Each test can run in isolation
  - Tests don't depend on execution order
  - No shared variables between tests

- [ ] **Error messages are clear**
  - Assertions have meaningful failure messages
  - Custom error messages where helpful

- [ ] **No placeholders or incomplete code**
  - Search for `// TODO` and verify all are justified
  - Search for `// ...` or ellipses
  - All functions are complete implementations

### Code Quality Checks

- [ ] **No arbitrary waits**
  ```typescript
  // ❌ Bad
  await page.waitForTimeout(5000);
  
  // ✅ Good
  await expect(locator).toBeVisible();
  ```

- [ ] **Proper error handling**
  - Try/catch where appropriate
  - Meaningful error messages
  - Screenshots on failure (if configured)

- [ ] **DRY principle followed**
  - No duplicate code
  - Common actions in Page Objects
  - Shared setup in fixtures

---

## Automated Validation Scripts

Add these scripts to `package.json` for quick validation:

```json
{
  "scripts": {
    "validate:cy-calls": "grep -r '\\bcy\\.' tests/ && echo 'FAIL: Found cy.* calls' || echo 'PASS: No cy.* calls found'",
    "validate:awaits": "eslint tests/ --rule '@typescript-eslint/no-floating-promises: error'",
    "validate:locators": "grep -rn 'getByRole\\|getByLabel\\|getByText' tests/ | wc -l && echo 'semantic locators found'",
    "validate:typecheck": "tsc --noEmit",
    "validate:test": "playwright test",
    "validate:all": "npm run validate:cy-calls && npm run validate:typecheck && npm run validate:test"
  }
}
```

### Usage

```bash
# Run all validations
npm run validate:all

# Run individual checks
npm run validate:cy-calls
npm run validate:typecheck
npm run validate:test
```

### CI/CD Integration

Add to GitHub Actions or other CI:

```yaml
name: Validation

on: [pull_request]

jobs:
  validate-migration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check for cy.* calls
        run: npm run validate:cy-calls
      
      - name: TypeScript check
        run: npm run validate:typecheck
      
      - name: Run Playwright tests
        run: npm run validate:test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Quality Gates

Tests must meet these criteria before migration is considered complete:

### Level 1: Basic (Required)

- [ ] All Cypress tests migrated or deprecated
- [ ] All `cy.*` calls removed
- [ ] All Playwright actions awaited
- [ ] TypeScript compiles without errors
- [ ] All tests pass in Playwright

### Level 2: Standard (Recommended)

- [ ] Semantic locators used (90%+ of locators)
- [ ] Page Objects created for all pages
- [ ] Fixtures used for auth/setup
- [ ] No `waitForTimeout()` without justification (commented)
- [ ] Tests pass in parallel mode
- [ ] Tests documented with clear descriptions

### Level 3: Excellent (Best Practice)

- [ ] 100% semantic locators (no generic CSS)
- [ ] Component-based Page Objects for reusable UI
- [ ] Global setup for shared auth state
- [ ] Trace viewer configured for debugging
- [ ] Screenshots/videos on failure
- [ ] Integration tests separated from E2E
- [ ] Performance benchmarks in place

---

## Migration Sign-Off Template

Use this template to document completion:

```markdown
## Migration Sign-Off: [Feature/Module Name]

### Files Migrated
- ✅ cypress/e2e/login.cy.ts → tests/specs/auth/login.spec.ts
- ✅ cypress/support/commands.ts → tests/pages/LoginPage.ts (Page Object)

### Validation Results

#### Automated Checks
- [ ] ✅ No cy.* calls found
- [ ] ✅ TypeScript compiles (0 errors)
- [ ] ✅ All tests pass (15/15)
- [ ] ✅ Semantic locators: 98% coverage

#### Manual Review
- [ ] ✅ Page Objects follow best practices
- [ ] ✅ Tests are independent
- [ ] ✅ No placeholders or TODOs
- [ ] ✅ Code review completed

### Notes
- Used `getByRole` for all interactive elements
- Created `AuthFixture` for reusable login state
- Added TODO for third-party date picker (lacks semantic attributes)

### Sign-Off
- **Developer**: [Name] - [Date]
- **Reviewer**: [Name] - [Date]
```

---

## Troubleshooting Common Validation Failures

### Issue: Tests timeout

**Check**:
- Are all actions awaited?
- Is there a dialog handler missing?
- Is network interception blocking?

**Fix**:
```typescript
// Add await
await page.locator('button').click();

// Add dialog handler
page.once('dialog', dialog => dialog.accept());

// Check route isn't blocking
await page.route('**/api/**', route => route.continue());
```

### Issue: Flaky tests

**Check**:
- Are you using `waitForTimeout()`?
- Are selectors robust?
- Are tests isolated?

**Fix**:
```typescript
// Replace timeout with explicit wait
await expect(page.locator('.result')).toBeVisible();

// Use semantic locator
await page.getByRole('button', { name: 'Submit' }).click();

// Ensure test isolation
test.beforeEach(async ({ page }) => {
  // Fresh state for each test
});
```

### Issue: TypeScript errors

**Check**:
- Are all imports correct?
- Are types properly declared?
- Is tsconfig.json configured?

**Fix**:
```typescript
// Correct imports
import { test, expect, Page, Locator } from '@playwright/test';

// Add return types
async login(email: string): Promise<void> {
  // ...
}
```

---

## Resources

- [Repository Instructions](./.github/copilot-instructions.md)
- [Complete Reference](./instructions.md)
- [Locator Strategy](./docs/locator-strategy.md)
- [Examples](./docs/examples.md)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
