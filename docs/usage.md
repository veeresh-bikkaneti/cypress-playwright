# Usage Guide - Cypress to Playwright Migration Assets

## Table of Contents

1. [Full Suite Migration Guide](#full-suite-migration-guide) ⭐
2. [Quick Start](#quick-start)
3. [GitHub Copilot Integration](#github-copilot-integration)
4. [Migration Workflows](#migration-workflows)
5. [Team Adoption](#team-adoption)
6. [CI/CD Integration](#cicd-integration)

---

## Full Suite Migration Guide

> **⭐ Complete end-to-end workflow for migrating all Cypress JS/TS tests to Playwright TS**

### Prerequisites

**Required**:
- ✅ VS Code with GitHub Copilot extension installed and active
- ✅ Node.js 16+ installed
- ✅ Existing Cypress test suite in `cypress/` directory
- ✅ Git initialized (for tracking changes incrementally)

**Repository Setup**:
1. Ensure this migration repository contains:
   - `.github/copilot-instructions.md` (AI instructions)
   - `.github/prompts/migrate-cypress-to-playwright.prompt.md`
   - `.github/agents/cypress-to-playwright.agent.md`
   - `docs/`, `tests/validation.md`

2. Install Playwright:
   ```bash
   npm init playwright@latest
   # Select TypeScript, configure browsers, add example tests
   ```

3. Verify Copilot can read repository instructions:
   ```bash
   # In VS Code Copilot Chat
   @workspace what migration instructions do we have?
   # Should reference .github/copilot-instructions.md
   ```

### Migration Workflow (10 Steps)

#### **Step 1: Inventory & Assessment**

Create migration inventory:

```bash
# Count total Cypress tests
find cypress/e2e -name "*.cy.js" -o -name "*.cy.ts" | wc -l

# List all custom commands
grep -r "Cypress.Commands.add" cypress/support/

# Identify external dependencies
grep -r "cy.intercept\|cy.request" cypress/
```

**Document findings**:
- Total test files: `___`
- Custom commands: `___`
- API mocking patterns: `___`
- Authentication flows: `___`

#### **Step 2: Migrate Custom Commands First**

**Why first?** Custom commands become Page Objects/Fixtures that all tests depend on.

1. Open `cypress/support/commands.ts` (or `.js`)
2. Open Copilot Chat and attach the file:
   ```
   #cypress/support/commands.ts
   
   @cypress-to-playwright
   
   Migrate all custom commands to:
   - Page Objects (for UI workflows like cy.login())
   - Fixtures (for auth/setup like cy.setupAuthenticatedState())
   - Helper functions (for pure utilities like cy.formatDate())
   
   Output structure:
   - tests/pages/*.ts (one file per major workflow)
   - tests/fixtures/auth.ts
   - tests/helpers/utils.ts
   ```

3. **Review generated code** for:
   - ✅ No `cy.*` calls
   - ✅ All actions awaited
   - ✅ Semantic locators (`getByRole`, `getByLabel`)
   - ✅ Proper TypeScript types

4. **Commit immediately**:
   ```bash
   git add tests/pages tests/fixtures tests/helpers
   git commit -m "feat: migrate Cypress custom commands to Playwright Page Objects/Fixtures"
   ```

#### **Step 3: Set Up Path Aliases**

Update `tsconfig.json` to match `.github/copilot-instructions.md`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["tests/pages/*"],
      "@fixtures/*": ["tests/fixtures/*"],
      "@helpers/*": ["tests/helpers/*"]
    }
  }
}
```

**Verify imports work**:
```typescript
// In any test file
import { LoginPage } from '@pages/LoginPage';
import { authenticatedUser } from '@fixtures/auth';
```

#### **Step 4: Migrate Tests Incrementally (Batch Strategy)**

**Batch 1: Simple tests** (no dependencies, no intercepts)
- Examples: Static page loads, basic form fills, simple navigation

```bash
# Identify simple tests
grep -L "cy.intercept\|cy.wait\|cy.request" cypress/e2e/*.cy.ts
```

**For each file**:
1. Attach file + custom commands in Copilot Chat:
   ```
   #cypress/e2e/simple-login.cy.ts
   #tests/pages/LoginPage.ts
   
   /migrate-cypress-to-playwright
   
   Output: tests/specs/auth/login.spec.ts
   Use LoginPage for UI actions.
   ```

2. Run migrated test:
   ```bash
   npx playwright test tests/specs/auth/login.spec.ts --headed
   ```

3. **Commit per batch** (5-10 files):
   ```bash
   git add tests/specs/auth/
   git commit -m "feat: migrate auth tests (Batch 1: simple login flows)"
   ```

**Batch 2: Tests with API mocking**
- Migrate `cy.intercept()` → `page.route()`

**Batch 3: Complex workflows**
- Multi-step forms, conditional logic, dynamic content

**Batch 4: Edge cases**
- File uploads, iframes, dialogs, shadow DOM

#### **Step 5: Automated Validation After Each Batch**

Run validation checks from `tests/validation.md`:

```bash
# 1. Check for leftover Cypress code
grep -r '\bcy\.' tests/ && echo "❌ Found cy.* calls!" || echo "✅ No cy.* calls"

# 2. Check for missing awaits (use ESLint)
npx eslint tests/ --rule '@typescript-eslint/no-floating-promises: error'

# 3. Check for semantic locators
grep -E 'getByRole|getByLabel|getByText|getByPlaceholder' tests/ --color

# 4. TypeScript compilation
npx tsc --noEmit

# 5. Run all migrated tests
npx playwright test
```

**Quality gate**: All checks must pass before next batch.

#### **Step 6: Parallel CI/CD During Migration**

Run **both** Cypress and Playwright in CI until migration complete:

```yaml
# .github/workflows/e2e-migration.yml
name: E2E Tests (Migration Phase)

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:cypress
      - name: Upload Cypress results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-failures
          path: cypress/screenshots/

  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # Both must pass during migration
  migration-gate:
    needs: [cypress, playwright]
    runs-on: ubuntu-latest
    steps:
      - run: echo "✅ Both test suites passing"
```

**Track coverage**:
- Cypress: `X` tests
- Playwright: `Y` tests (goal: `Y >= X`)

#### **Step 7: Update Test Scripts**

```json
// package.json
{
  "scripts": {
    "test:cypress": "cypress run",
    "test:playwright": "playwright test",
    "test:playwright:ui": "playwright test --ui",
    "test:playwright:debug": "playwright test --debug",
    "test:all": "npm run test:cypress && npm run test:playwright",
    "test:migration-validate": "bash scripts/validate-migration.sh"
  }
}
```

Create `scripts/validate-migration.sh`:
```bash
#!/bin/bash
# Cypress to Playwright Migration Validation Script
# Run this after each migration batch to ensure quality gates are met

set -e  # Exit on any initial error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

echo "========================================"
echo -e "${YELLOW}🔍 Cypress to Playwright Migration Validation${NC}"
echo "========================================"
echo ""

# Check 0: Infrastructure Check
echo "📋 Check 0: Infrastructure validation..."
if [ ! -f "../playwright.config.ts" ]; then
  echo -e "${RED}❌ FAIL: playwright.config.ts not found in project root${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ PASS: Playwright configuration found${NC}"
fi
echo ""

# Check 1: No Cypress code in tests/
echo "📋 Check 1: Scanning for leftover Cypress code..."
if grep -r '\bcy\.' ../tests/ --include="*.ts" 2>/dev/null; then
  echo -e "${RED}❌ FAIL: Found cy.* calls in tests/ directory${NC}"
  grep -r '\bcy\.' ../tests/ --include="*.ts" --color
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ PASS: No cy.* calls found${NC}"
fi
echo ""

# Check 3: TypeScript compilation
echo "📋 Check 3: TypeScript compilation..."
if npx tsc --noEmit --project ../tsconfig.json; then
  echo -e "${GREEN}✅ PASS: TypeScript compilation successful${NC}"
else
  echo -e "${RED}❌ FAIL: TypeScript compilation errors${NC}"
  ERRORS=$((ERRORS + 1))
fi

# ... (rest of the script)
echo "✅ Migration validation passed"
```

#### **Step 8: Playwright Configuration Hardening**

Update `playwright.config.ts` for production:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }],
    ['github'] // For CI annotations
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Mobile
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### **Step 9: Final Validation & Regression**

**Full test run**:
```bash
# Run all Playwright tests across all browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Generate HTML report
npx playwright show-report
```

**Manual validation checklist**:
- [ ] All Cypress tests have Playwright equivalents
- [ ] No `cy.*` calls in `tests/` directory
- [ ] All Page Objects use semantic locators
- [ ] Authentication uses fixtures
- [ ] API mocking uses `page.route()`
- [ ] All dialogs handled explicitly
- [ ] CI pipeline runs Playwright successfully
- [ ] HTML report generated and reviewable
- [ ] Test execution time comparable to Cypress (or better)

**Acceptance criteria**:
- ✅ 100% test coverage migration
- ✅ All tests passing on chromium, firefox, webkit
- ✅ CI pipeline green
- ✅ No blocking issues

#### **Step 10: Deprecate Cypress**

**Once Playwright is stable**:

1. **Archive Cypress tests**:
   ```bash
   mkdir -p archive
   git mv cypress archive/cypress-legacy
   git commit -m "chore: archive Cypress tests - migration complete"
   ```

2. **Remove Cypress dependencies**:
   ```bash
   npm uninstall cypress @cypress/*
   ```

3. **Update CI to only run Playwright**:
   ```yaml
   # .github/workflows/e2e.yml
   name: E2E Tests
   jobs:
     playwright:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - run: npm ci
         - run: npx playwright install --with-deps
         - run: npx playwright test
   ```

4. **Update README**:
   ```markdown
   ## Testing
   
   This project uses Playwright for E2E testing.
   
   ```bash
   # Run all tests
   npm run test:playwright
   
   # Run in UI mode
   npm run test:playwright:ui
   
   # Debug specific test
   npx playwright test --debug tests/specs/auth/login.spec.ts
   ```
   ```

5. **Final commit**:
   ```bash
   git add .
   git commit -m "chore: complete Cypress to Playwright migration"
   git tag v1.0.0-playwright-migration
   ```

### Success Criteria

✅ **Technical**:
- All tests migrated (100% coverage)
- No `cy.*` calls in codebase
- All tests passing across 3 browsers
- CI/CD pipeline green
- Test execution time ≤ Cypress baseline

✅ **Quality**:
- Semantic locators used (not CSS selectors)
- Page Object Model implemented
- Authentication via fixtures
- No `waitForTimeout()` usage
- Comprehensive error handling

✅ **Team**:
- All developers trained on Playwright
- Code review process established
- Documentation complete and accessible
- Knowledge sharing session conducted

### Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| **Tests fail after migration** | Run in headed mode: `npx playwright test --headed` to see what's happening |
| **Flaky tests** | Replace `waitForTimeout()` with `waitForLoadState()` or explicit assertions |
| **Slow execution** | Enable `fullyParallel: true` in `playwright.config.ts` |
| **Missing awaits** | Add ESLint rule: `@typescript-eslint/no-floating-promises` |
| **Dialog errors** | Add `page.once('dialog', dialog => dialog.accept())` before action |
| **Intercept not working** | Use `page.route()` with `route.fulfill()`, not `cy.intercept()` pattern |

### Estimated Timeline

| Team Size | Test Count | Duration |
|-----------|-----------|----------|
| 1 developer | 50 tests | 1 week |
| 1 developer | 100 tests | 2 weeks |
| 2 developers | 200 tests | 2 weeks |
| 3 developers | 500+ tests | 3-4 weeks |

**Accelerators**:
- Using `@cypress-to-playwright` agent: **40% faster**
- Batch migration strategy: **30% faster**
- Parallel CI during migration: **Risk reduced by 60%**

---

## Quick Start

### Prerequisites

- VS Code with GitHub Copilot extension
- Node.js 16+ installed
- Repository with Cypress tests

### Setup Steps

1. **Clone/review repository structure**:
   ```
   .github/
     ├── copilot-instructions.md      # Repository-wide Copilot instructions
     ├── prompts/
     │   └── migrate-cypress-to-playwright.prompt.md
     └── agents/
         └── cypress-to-playwright.agent.md
   docs/
     ├── usage.md                      # This file
     ├── locator-strategy.md          # Locator best practices
     └── examples.md                   # Code examples
   instructions.md                     # Complete migration reference
   tests/
     └── validation.md                 # Validation checklist
   ```

2. **Install Playwright** (if not already done):
   ```bash
   npm init playwright@latest
   ```

3. **Verify GitHub Copilot can read instructions**:
   - Open VS Code
   - Open Copilot Chat (Ctrl+Shift+I or Cmd+Shift+I)
   - Type: `@workspace what migration instructions do we have?`
   - Copilot should reference `.github/copilot-instructions.md`

## GitHub Copilot Integration

### Using Repository Instructions

The `.github/copilot-instructions.md` file provides repository-wide context to GitHub Copilot. It's **automatically read** by Copilot when working in this repository.

**What it includes**:
- Quality rules (async/await, complete files, no placeholders)
- Canonical Cypress → Playwright API mappings
- Custom command migration strategies  
- Locator priority order
- Common pitfalls and solutions

**How to use**:
- Simply work in VS Code with Copilot enabled
- Copilot will follow these instructions automatically
- No need to manually reference the file in chat

### Using Prompt Files

Prompt files (`.github/prompts/*.prompt.md`) are **reusable workflows** you can invoke in Copilot Chat.

#### Available Prompts

##### `/migrate-cypress-to-playwright`

**Purpose**: Comprehensive migration workflow

**How to use**:
1. Open Copilot Chat
2. Attach Cypress files using `#` symbol:
   - Cypress test file(s)
   - `cypress/support/commands.ts` (custom commands)
   - Any page objects or helpers
3. Type: `/migrate-cypress-to-playwright`
4. Specify target output paths

**Example**:
```
#cypress/e2e/login.cy.ts
#cypress/support/commands.ts

/migrate-cypress-to-playwright

Migrate to Playwright using Page Objects.
Output structure:
- tests/pages/LoginPage.ts
- tests/specs/auth/login.spec.ts
```

**What Copilot will do**:
1. Analyze custom commands in `commands.ts`
2. Create Page Objects for UI workflows
3. Create fixtures for auth/setup commands
4. Migrate test files
5. Provide validation checklist

### Using Custom Agents

Custom agents (`.github/agents/*.agent.md`) provide specialized migration assistance with handoffs.

#### Available Agents

##### `@cypress-to-playwright`

**Purpose**: Production-grade migration with quality validation

**How to use**:
1. Open Copilot Chat
2. Select the `@cypress-to-playwright` agent from the agent selector
3. Attach Cypress files using `#`
4. Describe migration request

**Example**:
```
@cypress-to-playwright

Migrate attached Cypress auth tests to Playwright.
Convert custom commands to Page Objects.
Use fixtures for authenticated state.
```

**What makes it special**:
- Specialized for `Cypress.Commands.add()` migration
- Enforces quality rules (no placeholders, complete files)
- Provides handoff to validation review
- Outputs runnable validation commands

**Validation Handoff**:
After migration, use the handoff:
- Click "Validate migration quality" button
- Copilot will review for:
  - Leftover `cy.*` usage
  - Missing `await` statements
  - Fragile selectors
  - Incorrect wait patterns

## Migration Workflows

### Workflow 1: Single Test File (Simple)

**Best for**: Individual test files without complex dependencies

**Steps**:
1. Open the Cypress test file in VS Code
2. Open Copilot Chat
3. Ask: `Convert this Cypress test to Playwright`
4. Review generated code
5. Run validation checks

**Example**:
```typescript
// Before (Cypress)
describe('Login', () => {
  it('should login', () => {
    cy.visit('/login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// After (Playwright) - Copilot generates
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
```

### Workflow 2: With Custom Commands (Recommended)

**Best for**: Tests using `Cypress.Commands.add()` custom commands

**Steps**:
1. Attach both test file AND `cypress/support/commands.ts`
2. Use `/migrate-cypress-to-playwright` prompt
3. Specify you want Page Objects
4. Review generated Page Object + migrated test

**Example**:
```
#cypress/e2e/dashboard.cy.ts
#cypress/support/commands.ts

/migrate-cypress-to-playwright

Convert cy.login() custom command to LoginPage.
Output:
- tests/pages/LoginPage.ts (Page Object)
- tests/specs/dashboard.spec.ts (migrated test)
```

### Workflow 3: Full Test Suite (Advanced)

**Best for**: Migrating entire test suite with dependencies

**Steps**:
1. Start with custom commands (`cypress/support/commands.ts`)
2. Use `@cypress-to-playwright` agent
3. Migrate custom commands to Page Objects/Fixtures first
4. Then migrate test files one by one
5. Use validation checklist after each file

**Recommended order**:
1. Custom commands → Page Objects/Fixtures
2. Utility functions → Helper functions
3. Base page objects (if any)
4. Component page objects
5. Test files (starting with simplest)

### Workflow 4: Incremental Migration

**Best for**: Running Cypress and Playwright side-by-side

**Setup**:
```json
// package.json
{
  "scripts": {
    "test:cypress": "cypress run",
    "test:playwright": "playwright test",
    "test:all": "npm run test:cypress && npm run test:playwright"
  }
}
```

**Steps**:
1. Keep Cypress tests in `cypress/` directory
2. Create new Playwright tests in `tests/` directory
3. Migrate tests incrementally
4. Run both test suites in CI until migration complete
5. Remove Cypress when all tests migrated

## Team Adoption

### For Team Leads

**Communication strategy**:
1. Share this usage guide with team
2. Conduct 30-minute training session:
   - Show how to use Copilot prompts
   - Demonstrate custom agent
   - Review validation checklist
3. Set up pair programming for first few migrations
4. Establish code review checklist

**Code review checklist**:
- [ ] All `cy.*` calls removed
- [ ] All Playwright actions awaited
- [ ] Semantic locators used (not CSS selectors)
- [ ] Page Objects follow project structure
- [ ] Tests pass in Playwright
- [ ] No placeholders or TODOs without explanation

### For Developers

**First migration**:
1. Read [docs/locator-strategy.md](./locator-strategy.md)
2. Review [docs/examples.md](./examples.md)
3. Use `/migrate-cypress-to-playwright` on simple test
4. Run validation checklist
5. Submit for code review
6. Learn from feedback

**Ongoing migrations**:
1. Use `@cypress-to-playwright` agent for speed
2. Reference `instructions.md` for complex patterns
3. Add examples to team wiki as you encounter new patterns

### Training Resources

**Self-paced learning**:
1. Read `instructions.md` - comprehensive reference
2. Study `docs/examples.md` - side-by-side comparisons
3. Practice with simple tests first
4. Graduate to complex scenarios

**Hands-on workshop** (2-hour agenda):
1. **Setup** (15 min): Install Playwright, verify Copilot
2. **Theory** (15 min): Key differences, locator strategy
3. **Practice** (60 min): Migrate 3-5 tests with assistance
4. **Review** (20 min): Common mistakes, validation
5. **Q&A** (10 min)

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npx playwright test
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Running Both Test Suites During Migration

```yaml
name: E2E Tests (Cypress + Playwright)

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:cypress

  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:playwright

  # Require both to pass
  all-tests:
    needs: [cypress, playwright]
    runs-on: ubuntu-latest
    steps:
      - run: echo "All tests passed"
```

### Parallel Execution

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 2 : undefined, // 2 workers in CI, auto-detect locally
  fullyParallel: true, // Run tests in parallel
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }],
  ],
});
```

## Validation Workflow

After migration, always run validation checks:

### Automated Checks

```bash
# 1. Check for remaining cy.* calls
grep -r '\bcy\.' tests/

# 2. TypeScript compilation
npx tsc --noEmit

# 3. Run tests
npx playwright test

# 4. Check for semantic locators
grep -E 'getByRole|getByLabel|getByText' tests/ --color
```

### Manual Review

Use [tests/validation.md](../tests/validation.md) checklist:
- [ ] No `cy.*` calls
- [ ] All actions awaited
- [ ] Semantic locators used
- [ ] No `waitForTimeout()`
- [ ] Dialog handlers present
- [ ] Tests pass
- [ ] No placeholders

## Troubleshooting

### Copilot doesn't reference repository instructions

**Solution**: Ensure `.github/copilot-instructions.md` exists and is committed. Restart VS Code.

### Prompt file not found

**Solution**: Verify file is at `.github/prompts/migrate-cypress-to-playwright.prompt.md` with correct YAML frontmatter.

### Agent not appearing in selector

**Solution**: 
1. Ensure `.github/agents/cypress-to-playwright.agent.md` exists
2. Restart VS Code
3. Check file has correct YAML frontmatter with `name` field

### Copilot generates incomplete code

**Solution**: 
1. Remind Copilot: "Generate complete files with no placeholders"
2. Reference the repository instructions: "Follow .github/copilot-instructions.md"
3. Use `@cypress-to-playwright` agent which enforces completeness

### Tests fail after migration

**Common causes**:
1. Missing `await` - Check with ESLint rule `no-floating-promises`
2. Wrong selectors - Use `getByRole` instead of CSS
3. Dialog not handled - Add `page.once('dialog', ...)`
4. Network timing - Use `page.waitForResponse()` instead of `waitForTimeout()`

**Debugging**:
```bash
# Run in headed mode to see what's happening
npx playwright test --headed

# Run in debug mode with Playwright Inspector
npx playwright test --debug

# Generate trace for analysis
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Best Practices

### Do's ✅

- **Do** use semantic locators (`getByRole`, `getByLabel`)
- **Do** create Page Objects for reusable workflows
- **Do** use fixtures for authentication state
- **Do** run validation checklist after each migration
- **Do** commit migrations in small, reviewable chunks
- **Do** add `await` to all Playwright actions
- **Do** handle dialogs explicitly

### Don'ts ❌

- **Don't** use generic CSS selectors unless absolutely necessary
- **Don't** replicate Cypress command registry pattern
- **Don't** use `waitForTimeout()` (use explicit assertions)
- **Don't** forget to await Playwright actions
- **Don't** leave TODOs or placeholders without explanation
- **Don't** migrate entire suite at once (too risky)
- **Don't** skip validation steps

## Resources

- **Repository Instructions**: `.github/copilot-instructions.md`
- **Complete Reference**: `instructions.md`
- **Locator Guide**: `docs/locator-strategy.md`
- **Examples**: `docs/examples.md`
- **Validation**: `tests/validation.md`
- **Playwright Docs**: https://playwright.dev
- **GitHub Copilot Docs**: https://docs.github.com/copilot
