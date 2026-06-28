# Playwright Test Creation

**Slash Command**: `/playwright-create`

## Description
Generate comprehensive Playwright tests following BDD or AAA patterns with support for Playwright 1.38 - 1.61+. Automatically infers unstated requirements (accessibility, security, performance).

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
});
```

### Page Object Model

```typescript
// playwright/pages/[Page]Page.ts
import { Page, Locator, expect } from '@playwright/test';

export class [Page]Page {
  constructor(private readonly page: Page) {}

  get element(): Locator {
    return this.page.getByRole('...', { name: '...' });
  }

  async performAction(): Promise<void> {
    // Implementation
  }
}
```

## Configuration

**Supported Playwright Versions**: 1.38 - 1.61+

**Test Patterns**:
- BDD (Given-When-Then with describe blocks)
- AAA (Arrange-Act-Assert)

**Automatic Inclusions**:
- ✅ Accessibility tests (keyboard nav, ARIA, screen reader)
- ✅ Security tests (XSS, CSRF, input validation)
- ✅ Performance checks (page load, Core Web Vitals)
- ✅ Edge cases (empty states, boundary values)

## Invocation Methods

1. **Slash Command**: `/playwright-create login functionality`
2. **Agent Mention**: `@qa-orchestrator create Playwright tests for login`
3. **Natural Language**: "Generate Playwright tests for the shopping cart"

## Output Files

- `playwright/e2e/[feature].spec.ts` - Test specification
- `playwright/pages/[Feature]Page.ts` - Page Object Model
- `playwright/fixtures/[feature].fixture.ts` - Custom fixtures (if needed)
