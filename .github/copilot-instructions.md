# Cypress → Playwright Migration (Repository Instructions)

## Scope & Goals

Migrate Cypress E2E tests (cypress.io) to Playwright TypeScript using @playwright/test.

- **Target**: Production-grade, maintainable, type-safe Playwright tests
- **Do NOT recommend or rely on third-party codemod services/tools** (e.g., Codemod.com)
- **Maintain or improve** test coverage, reliability, and execution speed


## OWASP Security Guidelines

All code and tests must adhere to OWASP Top 10 security best practices.

### 🛡️ Security Requirements
1. **Input Validation**: Validate and sanitize all inputs in tests and application code.
2. **Authentication**: Use secure authentication flows; avoid hardcoding credentials.
3. **Data Protection**: Never commit sensitive data (tokens, keys, PII). Use environment variables.
4. **Secure Configuration**: Ensure test environment matches securely configured production settings.
5. **Dependencies**: Regularly scan `package.json` for vulnerabilities using `npm audit`.

### 🧪 Security Testing
- **XSS & Injection**: Include tests for Cross-Site Scripting and SQL Injection common vectors.
- **Access Control**: Verify unauthorized users cannot access restricted resources.
- **Secure Headers**: Check for presence of security headers (CSP, X-Frame-Options, etc.).

## Non-Negotiable Quality Rules

### Code Quality

- **All Playwright actions/assertions are async and MUST be awaited** - violations will cause runtime failures
- **Output complete files only** - no placeholders, no ellipses, no "// ... rest of code"
- **No `cy.*` remains in migrated output** - verify with regex search
- **All TypeScript errors must be resolved** - run `npx tsc --noEmit` before committing
- **Preserve test intent and coverage** - never silently drop test cases or assertions

### 🧠 Cognitive Steps (Chain-of-Thought)

**Before generating any code**, you MUST output a brief analysis comment block:
```typescript
/**
 * MIGRATION ANALYSIS
 * 1. Intent: [Login / Checkout / etc.]
 * 2. Custom Commands: [List found cy.login(), etc.] -> [Map to PageObject.method()]
 * 3. State Dependencies: [Auth / Database seeding] -> [Map to fixture]
 * 4. Critical Checks: [Dialogs / Network mocks]
 */
```

### 🔒 Tech Stack & Path Constraints

- **Target Framework**: Playwright Test v1.41+ (Use `mergeExpects` if applicable)
- **Language**: TypeScript (Strict Mode)
- **Path Aliases** (Assume `tsconfig.json` paths):
  - `@pages/*` → `tests/pages/*`
  - `@fixtures/*` → `tests/fixtures/*`
  - `@helpers/*` → `tests/helpers/*`

### ⛔ Stop Sequences (Refusals)

You MUST **REFUSE** to generate the following patterns unless explicitly instructed with a "Skip Checks" override:

1. **Bare `waitForTimeout`**:
   - ❌ `await page.waitForTimeout(5000)`
   - ✅ `await expect(locator).toBeVisible()` or `await page.waitForFunction(...)`
   - *Exception*: If wrapped in comment `// REVIEW: Temporary wait for [reason]`

2. **Index-based locators without comments**:
   - ❌ `page.locator('div').nth(2).click()` (Fragile!)
   - ✅ `page.locator('div').filter({ hasText: 'Settings' }).click()`

3. **Incomplete file outputs**:
   - ❌ `// ... rest of code`
   - ✅ Output the full file content every time.

---

## Canonical Cypress → Playwright Mapping

Playwright strongly recommends user-facing locators that mirror how users interact with the page.

**Priority order** (from most to least resilient):

1. `page.getByRole(role, { name })` - **Preferred** for interactive elements (buttons, links, inputs)
2. `page.getByLabel(text)` - For form fields with labels
3. `page.getByPlaceholder(text)` - For inputs with placeholders
4. `page.getByText(text)` - For text content
5. `page.getByTestId(id)` - When semantic locators aren't viable
6. `page.locator(css/xpath)` - **Last resort** for complex selectors

**Never use**:
- Generic selectors like `.class`, `#id` without semantic meaning
- XPath unless absolutely necessary
- Index-based selection (`.nth(0)`) without justification

### Auto-Waiting & Explicit Waits

- Playwright auto-waits for elements to be actionable (visible, enabled, stable)
- **Avoid `page.waitForTimeout(ms)`** - use explicit wait conditions instead
- Prefer `await expect(locator).toBeVisible()` over arbitrary sleeps
- For custom conditions, use `page.waitForFunction()` or `locator.waitFor()`

---

## Canonical Cypress → Playwright Mapping

### Test Structure & Hooks

```typescript
// Cypress → Playwright
describe('suite')           → test.describe('suite', () => {})
it('test')                  → test('test', async ({ page }) => {})
it.only()                   → test.only()
it.skip()                   → test.skip()
context()                   → test.describe()

before()                    → test.beforeAll(async ({ browser }) => {})
beforeEach()                → test.beforeEach(async ({ page }) => {})
after()                     → test.afterAll(async ({ browser }) => {})
afterEach()                 → test.afterEach(async ({ page }) => {})
```

### Navigation & Page Actions

```typescript
// Cypress → Playwright
cy.visit(url)               → await page.goto(url)
cy.visit(url, { timeout })  → await page.goto(url, { timeout })
cy.reload()                 → await page.reload()
cy.go('back')               → await page.goBack()
cy.go('forward')            → await page.goForward()
cy.url()                    → page.url()
cy.title()                  → await page.title()
cy.viewport(w, h)           → await page.setViewportSize({ width: w, height: h })
cy.scrollTo(pos)            → await page.evaluate(() => window.scrollTo(pos))
cy.wait(ms)                 → await page.waitForTimeout(ms) // AVOID - use explicit waits
```

### Element Selection & Interaction

```typescript
// Cypress → Playwright
cy.get(selector)                    → page.locator(selector)
cy.get(sel).click()                 → await page.locator(sel).click()
cy.get(sel).dblclick()              → await page.locator(sel).dblclick()
cy.get(sel).rightclick()            → await page.locator(sel).click({ button: 'right' })
cy.get(sel).type(text)              → await page.locator(sel).fill(text)
cy.get(sel).type(text, { delay })   → await page.locator(sel).pressSequentially(text, { delay })
cy.get(sel).clear()                 → await page.locator(sel).clear()
cy.get(sel).check()                 → await page.locator(sel).check()
cy.get(sel).uncheck()               → await page.locator(sel).uncheck()
cy.get(sel).select(value)           → await page.locator(sel).selectOption(value)
cy.get(sel).trigger('mouseover')    → await page.locator(sel).hover()
cy.get(sel).focus()                 → await page.locator(sel).focus()
cy.get(sel).blur()                  → await page.locator(sel).blur()
cy.get(sel).submit()                → await page.locator(sel).evaluate(el => el.submit())

// Special selectors
cy.contains(text)                   → page.getByText(text)
cy.contains(sel, text)              → page.locator(sel).filter({ hasText: text })
cy.get(sel).find(child)             → page.locator(sel).locator(child)
cy.get(sel).parent()                → page.locator(sel).locator('..')
cy.get(sel).children()              → page.locator(sel).locator('> *')

// Filtering/indexing
cy.get(sel).first()                 → page.locator(sel).first()
cy.get(sel).last()                  → page.locator(sel).last()
cy.get(sel).eq(n)                   → page.locator(sel).nth(n)
cy.get(sel).filter(selector)        → page.locator(sel).filter({ has: page.locator(selector) })
```

### Assertions

```typescript
// Cypress → Playwright
cy.get(sel).should('exist')                    → await expect(page.locator(sel)).toBeAttached()
cy.get(sel).should('not.exist')                → await expect(page.locator(sel)).not.toBeAttached()
cy.get(sel).should('be.visible')               → await expect(page.locator(sel)).toBeVisible()
cy.get(sel).should('not.be.visible')           → await expect(page.locator(sel)).not.toBeVisible()
cy.get(sel).should('be.hidden')                → await expect(page.locator(sel)).toBeHidden()
cy.get(sel).should('be.enabled')               → await expect(page.locator(sel)).toBeEnabled()
cy.get(sel).should('be.disabled')              → await expect(page.locator(sel)).toBeDisabled()
cy.get(sel).should('be.checked')               → await expect(page.locator(sel)).toBeChecked()
cy.get(sel).should('be.focused')               → await expect(page.locator(sel)).toBeFocused()
cy.get(sel).should('have.text', text)          → await expect(page.locator(sel)).toHaveText(text)
cy.get(sel).should('contain', text)            → await expect(page.locator(sel)).toContainText(text)
cy.get(sel).should('have.value', value)        → await expect(page.locator(sel)).toHaveValue(value)
cy.get(sel).should('have.attr', attr, val)     → await expect(page.locator(sel)).toHaveAttribute(attr, val)
cy.get(sel).should('have.class', className)    → await expect(page.locator(sel)).toHaveClass(new RegExp(className))
cy.get(sel).should('have.css', prop, value)    → await expect(page.locator(sel)).toHaveCSS(prop, value)
cy.get(sel).should('have.length', n)           → await expect(page.locator(sel)).toHaveCount(n)

// URL & Title assertions
cy.url().should('eq', url)                     → await expect(page).toHaveURL(url)
cy.url().should('include', path)               → await expect(page).toHaveURL(new RegExp(path))
cy.url().should('match', regex)                → await expect(page).toHaveURL(regex)
cy.title().should('eq', title)                 → await expect(page).toHaveTitle(title)
cy.title().should('include', text)             → await expect(page).toHaveTitle(new RegExp(text))

// Value/content retrieval
cy.get(sel).invoke('text')                     → await page.locator(sel).innerText()
cy.get(sel).invoke('val')                      → await page.locator(sel).inputValue()
cy.get(sel).invoke('attr', name)               → await page.locator(sel).getAttribute(name)
```

### File Upload & Download

```typescript
// Cypress → Playwright
cy.get(sel).selectFile(path)           → await page.locator(sel).setInputFiles(path)
cy.get(sel).selectFile([p1, p2])       → await page.locator(sel).setInputFiles([p1, p2])
cy.readFile(path)                      → const content = await fs.promises.readFile(path, 'utf-8')

// Download handling
cy.get(sel).click()                    → const [download] = await Promise.all([
                                           page.waitForEvent('download'),
                                           page.locator(sel).click()
                                         ]);
                                         const path = await download.path();
```

### Network Interception & Waiting

```typescript
// Cypress → Playwright

// Intercept & mock responses
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers')
→
await page.route('**/api/users', async route => {
  const json = await fs.promises.readFile('fixtures/users.json', 'utf-8');
  await route.fulfill({ json: JSON.parse(json) });
});

// Intercept & modify requests
cy.intercept('POST', '/api/users', (req) => {
  req.body.modified = true;
  req.continue();
})
→
await page.route('**/api/users', async route => {
  const request = route.request();
  const postData = request.postDataJSON();
  await route.continue({ postData: { ...postData, modified: true } });
});

// Wait for network alias
cy.wait('@getUsers')
→
const response = await page.waitForResponse(resp => 
  resp.url().includes('/api/users') && resp.status() === 200
);
const data = await response.json();

// Wait for multiple requests
cy.wait(['@req1', '@req2'])
→
await Promise.all([
  page.waitForResponse('**/api/endpoint1'),
  page.waitForResponse('**/api/endpoint2')
]);
```

### Dialogs (alert, confirm, prompt)

**CRITICAL**: Playwright auto-dismisses dialogs unless you register a handler.
If you register `page.on('dialog')`, you **MUST** call `dialog.accept()` or `dialog.dismiss()`,
or the page will freeze waiting for dialog interaction.

```typescript
// Cypress → Playwright
cy.on('window:alert', (text) => { expect(text).to.eq('Alert!'); })
→
page.once('dialog', async dialog => {
  expect(dialog.message()).toBe('Alert!');
  await dialog.accept();
});

cy.on('window:confirm', () => true)  // Accept confirm
→
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  await dialog.accept();
});

cy.on('window:confirm', () => false) // Dismiss confirm
→
page.once('dialog', async dialog => {
  await dialog.dismiss();
});

cy.window().then((win) => cy.stub(win, 'prompt').returns('user input'))
→
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('prompt');
  await dialog.accept('user input');
});
```

### Cookies & Local Storage

```typescript
// Cypress → Playwright

// Cookies
cy.getCookie('name')                   → await context.cookies().then(c => c.find(x => x.name === 'name'))
cy.getCookies()                        → await context.cookies()
cy.setCookie('name', 'value')          → await context.addCookies([{ name: 'name', value: 'value', domain: '.example.com', path: '/' }])
cy.clearCookie('name')                 → await context.clearCookies({ name: 'name' })
cy.clearCookies()                      → await context.clearCookies()

// Sessions (cy.session replacement)
// Cypress
cy.session('user', () => { ... })
→
// Playwright: Use storageState in config or context.storageState()
// In playwright.config.ts:
// use: { storageState: 'state.json' }

// Local Storage
cy.clearLocalStorage()                 → await page.evaluate(() => localStorage.clear())
cy.clearLocalStorage('key')            → await page.evaluate(key => localStorage.removeItem(key), 'key')
localStorage.setItem('key', 'value')   → await page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: 'key', v: 'value' })
localStorage.getItem('key')            → await page.evaluate(k => localStorage.getItem(k), 'key')
```

### Iframe Handling

```typescript
// Cypress -> Playwright
cy.get('iframe').its('0.contentDocument.body').find(sel)
→
const frame = page.frameLocator('iframe');
await frame.locator(sel).click();

// Named iframe
cy.get('iframe[name="myframe"]').then($iframe => {
  const body = $iframe.contents().find('body');
  cy.wrap(body).find(sel).click();
})
→
const frame = page.frameLocator('iframe[name="myframe"]');
await frame.locator(sel).click();

// Multi-domain (cy.origin)
cy.origin('other-domain.com', () => { ... })
→
// Playwright handles multi-domain naturally
await page.goto('https://other-domain.com');

// Clock (cy.clock)
cy.clock(now)                          → await page.clock.install({ now });
cy.tick(ms)                            → await page.clock.fastForward(ms);
cy.clock().invoke('restore')           → // Handled automatically or page.clock.uninstall()
```

---

## Cypress Custom Commands: `Cypress.Commands.add(...)`

Cypress allows defining reusable commands via `Cypress.Commands.add()` in `cypress/support/commands.{js,ts}`.
Playwright does **NOT** have a global command registry.

### Migration Strategy

Migrate each custom command based on its purpose:

#### (A) **UI Workflow Commands** → **Page Object Method** (PREFERRED)

If the command performs UI actions (visit, click, type, assert):

**Pattern**:
- Create a Page Object class with constructor accepting `page: Page`
- Migrate command logic to an `async` method
- Define locators as methods returning `Locator`
- Update test call sites to instantiate the page object and call the method

**Example**:
```typescript
// Cypress: cypress/support/commands.ts
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Playwright: tests/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get usernameInput(): Locator {
    return this.page.getByLabel('Username'); // Prefer semantic locators
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
    await expect(this.page).toHaveURL(/\/dashboard/);
  }
}

// Test usage
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can log in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'password123');
});
```

#### (B) **Setup/Teardown Commands** → **Playwright Fixture** (RECOMMENDED)

If the command handles auth, session setup, data seeding, or environment state:

**Pattern**:
- Create a custom fixture using `base.extend()`
- Fixture can provide authenticated page, API client, or test data
- Use fixture auto-injection in tests

**Example**:
```typescript
// Cypress: cypress/support/commands.ts
Cypress.Commands.add('loginViaAPI', (username: string, password: string) => {
  cy.request('POST', '/api/auth/login', { username, password })
    .then(response => {
      window.localStorage.setItem('authToken', response.body.token);
    });
});

// Playwright: tests/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Option 1: Login via UI
    const loginPage = new LoginPage(page);
    await loginPage.login('user@example.com', 'password123');
    
    // Option 2: Login via API and set storage state
    // const response = await page.request.post('/api/auth/login', {
    //   data: { username: 'user@example.com', password: 'password123' }
    // });
    // const { token } = await response.json();
    // await context.addCookies([{ name: 'authToken', value: token, domain: 'localhost', path: '/' }]);
    
    await use(page);
  }
});

// Test usage
import { test } from './fixtures/auth.fixture';

test('authenticated user sees dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Test authenticated state
});
```

#### (C) **Utility/Helper Commands** → **Helper Function**

For pure functions that don't interact with the page (formatters, parsers, generators):

```typescript
// Cypress
Cypress.Commands.add('generateRandomEmail', () => {
  return `user-${Date.now()}@example.com`;
});

// Playwright: tests/helpers/generators.ts
export function generateRandomEmail(): string {
  return `user-${Date.now()}@example.com`;
}

// Usage
import { generateRandomEmail } from './helpers/generators';
const email = generateRandomEmail();
```

---

## Common Migration Pitfalls & Solutions

### ❌ Pitfall 1: Missing `await`

```typescript
// WRONG - test will fail or timeout
page.locator('button').click();
expect(page.locator('h1')).toHaveText('Success');

// CORRECT
await page.locator('button').click();
await expect(page.locator('h1')).toHaveText('Success');
```

### ❌ Pitfall 2: Using `cy.*` patterns

```typescript
// WRONG - Playwright doesn't chain like Cypress
page.locator('input').fill('text').locator('button').click();

// CORRECT
await page.locator('input').fill('text');
await page.locator('button').click();
```

### ❌ Pitfall 3: Forgetting dialog handlers

```typescript
// WRONG - page will freeze if alert appears
await page.locator('button').click();

// CORRECT
page.once('dialog', async dialog => await dialog.accept());
await page.locator('button').click();
```

### ❌ Pitfall 4: Non-isolated tests

```typescript
// WRONG - tests share state
let sharedData: any;
test.beforeAll(async () => {
  sharedData = await fetchData();
});

// CORRECT - use fixtures for isolation
const test = base.extend({
  testData: async ({}, use) => {
    const data = await fetchData();
    await use(data);
  }
});
```

### ❌ Pitfall 5: Weak selectors

```typescript
// WRONG - fragile CSS selectors
await page.locator('.btn.btn-primary.submit-btn').click();

// CORRECT - semantic, accessible selectors
await page.getByRole('button', { name: 'Submit' }).click();
```

---

## Validation Checklist

Before considering migration complete, verify:

- [ ] All `cy.*` calls removed (regex: `\bcy\.[a-z]`)
- [ ] All Playwright actions have `await`
- [ ] All assertions use `expect()` from `@playwright/test`
- [ ] Locators prefer `getByRole`, `getByLabel`, `getByText` over CSS
- [ ] No `page.waitForTimeout()` without justification
- [ ] Dialog handlers call `accept()` or `dismiss()`
- [ ] Network waits use `waitForResponse()` not fixed delays
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Tests pass in headed mode (`npx playwright test --headed`)
- [ ] Tests pass in parallel (`npx playwright test --workers=4`)
- [ ] Screenshots/videos configured in `playwright.config.ts`
- [ ] No shared state between tests (each test is isolated)

---

## Additional Resources

- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Writing Tests: https://playwright.dev/docs/writing-tests
- Locators Guide: https://playwright.dev/docs/locators
- Test Fixtures: https://playwright.dev/docs/test-fixtures
- Playwright vs Cypress: https://playwright.dev/docs/why-playwright
