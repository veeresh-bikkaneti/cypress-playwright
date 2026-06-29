# Playwright Test Creation

**Slash Command**: `/playwright-create`

## Description
Generate comprehensive Playwright tests following BDD or AAA patterns with support for Playwright 1.38 - 1.48+. Automatically infers unstated requirements (accessibility, security, performance).

## Usage

```
/playwright-create [feature description]
```

### Examples

```
/playwright-create login page with email and password
/playwright-create checkout flow with payment validation
/playwright-create user dashboard with personalization
```

## What This Prompt Does

1. **Analyzes Requirements**: Understands feature and acceptance criteria
2. **Infers Unstated Needs**: Adds accessibility, security, performance tests
3. **Generates Page Objects**: Creates reusable POM classes
4. **Generates Tests**: Creates BDD or AAA formatted test specs
5. **Includes Fixtures**: Sets up authentication and data fixtures if needed
6. **Validates Execution**: Runs tests to verify complete working system

## Template

When you use this slash command, the agent will generate:

### Playwright E2E Test (1.38 - 1.48+)

```typescript
// playwright/e2e/[feature].spec.ts
import { test, expect } from '@playwright/test';
import { [Page]Page } from '../pages/[Page]Page';

test.describe('[Feature Name]', () => {
  let page: [Page]Page;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new [Page]Page(playwrightPage);
    await page.goto();
  });

  test.describe('Happy Path', () => {
    test('[should description]', async ({ page }) => {
      // Arrange
      
      // Act
      
      // Assert
    });
  });

  test.describe('Error Scenarios', () => {
    test('shows validation error for [invalid input]', async ({ page }) => {
      // Test error handling
    });
  });

  test.describe('Accessibility', () => {
    test('supports keyboard navigation', async ({ page }) => {
     // Test keyboard access
    });
  });

  test.describe('Security', () => {
    test('prevents XSS attacks', async ({ page }) => {
      // Test input sanitization
    });
  });
});
```

### Page Object Model

```typescript
// playwright/pages/[Page]Page.ts
import { Page, Locator, expect } from '@playwright/test';

export class [Page]Page {
  constructor(private readonly page: Page) {}

  // Locators
  get element(): Locator {
    return this.page.getByRole('...', { name: '...' });
  }

  // Actions
  async performAction(): Promise<void> {
    // Implementation
  }
}
```

## Configuration

**Supported Playwright Versions**: 1.38, 1.40, 1.44, 1.48+

**Test Patterns**:
- BDD (Given-When-Then with describe blocks)
- AAA (Arrange-Act-Assert)

**Automatic Inclusions**:
- ✅ Accessibility tests (keyboard nav, ARIA, screen reader)
- ✅ Security tests (XSS, CSRF, input validation)
- ✅ Performance checks (page load, Core Web Vitals)
- ✅ Edge cases (empty states, boundary values)
- ✅ Visual regression (screenshot comparisons)

## Mandatory Execution Validation ⭐ NEW

**BEFORE COMPLETION**, agent MUST verify the complete working system:

### 1. Configuration Check
- [ ] `playwright.config.ts` exists with correct `baseURL`
- [ ] `webServer` configured if E2E tests need dev server
- [ ] Server command is valid and server starts
- [ ] All dependencies installed

### 2. Code Validation
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] All imports resolve correctly
- [ ] No syntax or linting errors

### 3. Execution Proof (MANDATORY)
**Agent must run at least 1 generated test**:
```bash
npx playwright test [generated-file].spec.ts --project=chromium
```

Verify:
- [ ] Test starts without errors
- [ ] Server starts (if configured)
- [ ] Test executes all steps
- [ ] Test completes (pass or fail for valid reasons)
- [ ] No runtime errors

### 4. Completion Report
Agent must provide:
- ✅ Terminal output showing test execution
- ✅ Pass/fail status
- ✅ Any errors encountered and resolutions
- ✅ Confirmation of working configuration

**NEVER mark complete without execution proof.**

## Invocation Methods

1. **Slash Command**: `/playwright-create login functionality`
2. **Agent Mention**: `@qa-orchestrator create Playwright tests for login`
3. **Natural Language**: "Generate Playwright tests for the shopping cart"

## Output Files

The agent will create:
- `playwright/e2e/[feature].spec.ts` - Test specification
- `playwright/pages/[Feature]Page.ts` - Page Object Model
- `playwright/fixtures/[feature].fixture.ts` - Custom fixtures (if needed)
- Test execution report (proof of working system)
