# Migration Examples - Cypress to Playwright

## Table of Contents

1. [Basic Selectors and Actions](#basic-selectors-and-actions)
2. [Complex Assertions](#complex-assertions)
3. [Network Interception](#network-interception)
4. [Dialog Handling](#dialog-handling)
5. [Advanced Features Migration](#advanced-features-migration)
6. [Custom Command Migration](#custom-command-migration)
7. [Complete Test Examples](#complete-test-examples)

---

## Basic Selectors and Actions

### Example 1: Button Click

**Cypress**:
```javascript
cy.get('[data-testid="submit-button"]').click();
cy.contains('Continue').click();
```

**Playwright**:
```typescript
await page.getByTestId('submit-button').click();
await page.getByRole('button', { name: 'Continue' }).click(); // Preferred
```

### Example 2: Form Input

**Cypress**:
```javascript
cy.get('input[name="email"]').type('test@example.com');
cy.get('#password').type('password123');
```

**Playwright**:
```typescript
await page.getByLabel('Email').fill('test@example.com'); // Preferred
await page.getByLabel('Password').fill('password123');
```

### Example 3: Checkbox

**Cypress**:
```javascript
cy.get('#terms').check();
cy.get('#newsletter').uncheck();
```

**Playwright**:
```typescript
await page.getByRole('checkbox', { name: 'Accept terms' }).check();
await page.getByRole('checkbox', { name: 'Newsletter' }).uncheck();
```

### Example 4: Dropdown Selection

**Cypress**:
```javascript
cy.get('select[name="country"]').select('United States');
cy.get('#color').select(['red', 'blue']);
```

**Playwright**:
```typescript
await page.getByLabel('Country').selectOption('United States');
await page.getByLabel('Color').selectOption(['red', 'blue']);
```

### Example 5: Hover and Right-Click

**Cypress**:
```javascript
cy.get('.menu-item').trigger('mouseover');
cy.get('.context-menu').rightclick();
```

**Playwright**:
```typescript
await page.getByRole('menuitem').hover();
await page.locator('.context-menu').click({ button: 'right' });
```

---

## Complex Assertions

### Example 6: Element Visibility

**Cypress**:
```javascript
cy.get('.notification').should('be.visible');
cy.get('.error-message').should('not.exist');
cy.get('.loading-spinner').should('not.be.visible');
```

**Playwright**:
```typescript
await expect(page.locator('.notification')).toBeVisible();
await expect(page.locator('.error-message')).not.toBeAttached();
await expect(page.locator('.loading-spinner')).not.toBeVisible();
```

### Example 7: Text Content

**Cypress**:
```javascript
cy.get('h1').should('have.text', 'Welcome');
cy.get('.message').should('contain', 'Success');
cy.get('input[name="amount"]').should('have.value', '100');
```

**Playwright**:
```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome');
await expect(page.locator('.message')).toContainText('Success');
await expect(page.getByLabel('Amount')).toHaveValue('100');
```

### Example 8: Attributes and Classes

**Cypress**:
```javascript
cy.get('a').should('have.attr', 'href', '/home');
cy.get('.button').should('have.class', 'active');
cy.get('.badge').should('have.css', 'background-color', 'rgb(0, 255, 0)');
```

**Playwright**:
```typescript
await expect(page.getByRole('link')).toHaveAttribute('href', '/home');
await expect(page.locator('.button')).toHaveClass(/active/);
await expect(page.locator('.badge')).toHaveCSS('background-color', 'rgb(0, 255, 0)');
```

### Example 9: Element Count

**Cypress**:
```javascript
cy.get('.list-item').should('have.length', 5);
cy.get('table tbody tr').should('have.length.greaterThan', 0);
```

**Playwright**:
```typescript
await expect(page.locator('.list-item')).toHaveCount(5);
await expect(page.locator('table tbody tr')).not.toHaveCount(0);
```

### Example 10: URL and Title

**Cypress**:
```javascript
cy.url().should('eq', 'https://example.com/dashboard');
cy.url().should('include', '/products');
cy.url().should('match', /\/users\/\d+/);
cy.title().should('eq', 'Dashboard - My App');
```

**Playwright**:
```typescript
await expect(page).toHaveURL('https://example.com/dashboard');
await expect(page).toHaveURL(/\/products/);
await expect(page).toHaveURL(/\/users\/\d+/);
await expect(page).toHaveTitle('Dashboard - My App');
```

---

## Network Interception

### Example 11: Mock API Response

**Cypress**:
```javascript
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
cy.visit('/users');
cy.wait('@getUsers');
```

**Playwright**:
```typescript
// Load fixture data
const usersData = JSON.parse(
  await fs.promises.readFile('./fixtures/users.json', 'utf-8')
);

// Intercept and mock
await page.route('**/api/users', async route => {
  await route.fulfill({ json: usersData });
});

await page.goto('/users');

// Wait for response
await page.waitForResponse(resp => 
  resp.url().includes('/api/users') && resp.status() === 200
);
```

### Example 12: Modify Request

**Cypress**:
```javascript
cy.intercept('POST', '/api/users', (req) => {
  req.body.role = 'admin';
  req.continue();
});
```

**Playwright**:
```typescript
await page.route('**/api/users', async route => {
  const request = route.request();
  const postData = request.postDataJSON();
  await route.continue({
    postData: { ...postData, role: 'admin' }
  });
});
```

### Example 13: Spy on Network Requests

**Cypress**:
```javascript
cy.intercept('POST', '/api/analytics').as('analytics');
cy.get('button').click();
cy.wait('@analytics').its('request.body').should('include', { event: 'click' });
```

**Playwright**:
```typescript
const requests: Request[] = [];

await page.route('**/api/analytics', route => {
  requests.push(route.request());
  route.continue();
});

await page.getByRole('button').click();

const analyticsRequest = await page.waitForRequest('**/api/analytics');
const body = analyticsRequest.postDataJSON();
expect(body).toMatchObject({ event: 'click' });
```

### Example 14: Multiple Network Waits

**Cypress**:
```javascript
cy.intercept('GET', '/api/user').as('getUser');
cy.intercept('GET', '/api/settings').as('getSettings');
cy.visit('/profile');
cy.wait(['@getUser', '@getSettings']);
```

**Playwright**:
```typescript
await Promise.all([
  page.waitForResponse('**/api/user'),
  page.waitForResponse('**/api/settings'),
  page.goto('/profile')
]);
```

### Example 15: Conditional Response

**Cypress**:
```javascript
cy.intercept('GET', '/api/status', (req) => {
  req.reply({
    statusCode: 200,
    body: { status: 'online' }
  });
});
```

**Playwright**:
```typescript
await page.route('**/api/status', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'online' })
  });
});
```

---

## Dialog Handling

### Example 16: Alert Dialog

**Cypress**:
```javascript
cy.on('window:alert', (text) => {
  expect(text).to.contains('Are you sure?');
});
cy.get('#delete-button').click();
```

**Playwright**:
```typescript
page.once('dialog', async dialog => {
  expect(dialog.message()).toContain('Are you sure?');
  await dialog.accept();
});
await page.getByRole('button', { name: 'Delete' }).click();
```

### Example 17: Confirm Dialog (Accept)

**Cypress**:
```javascript
cy.on('window:confirm', () => true);
cy.get('#confirm-action').click();
```

**Playwright**:
```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  await dialog.accept();
});
await page.getByRole('button', { name: 'Confirm action' }).click();
```

### Example 18: Confirm Dialog (Dismiss)

**Cypress**:
```javascript
cy.on('window:confirm', () => false);
cy.get('#dangerous-action').click();
```

**Playwright**:
```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('confirm');
  await dialog.dismiss();
});
await page.getByRole('button', { name: 'Dangerous action' }).click();
```

### Example 19: Prompt Dialog

**Cypress**:
```javascript
cy.window().then((win) => {
  cy.stub(win, 'prompt').returns('John Doe');
});
cy.get('#enter-name').click();
```

**Playwright**:
```typescript
page.once('dialog', async dialog => {
  expect(dialog.type()).toBe('prompt');
  expect(dialog.message()).toBe('Enter your name:');
  await dialog.accept('John Doe');
});
await page.getByRole('button', { name: 'Enter name' }).click();
```

---

## Advanced Features Migration

### Example 20: Persistent Sessions (cy.session)

**Cypress**:
```javascript
Cypress.Commands.add('login', (name) => {
  cy.session(name, () => {
    cy.visit('/login');
    cy.get('input[name="user"]').type(name);
    cy.get('input[name="pass"]').type('password');
    cy.get('button').click();
    cy.url().should('contain', '/dashboard');
  });
});
```

**Playwright**:
```typescript
// Option 1: Using storageState in config
// playwright.config.ts
export default defineConfig({
  use: {
    storageState: 'state.json',
  },
});

// Option 2: Programmatic state sharing
// tests/fixtures/auth.fixture.ts
export const test = base.extend({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'state.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

### Example 21: Multi-domain (cy.origin)

**Cypress**:
```javascript
cy.visit('https://domain-a.com');
cy.origin('https://domain-b.com', () => {
  cy.visit('/login');
  cy.get('#external-auth').click();
});
```

**Playwright**:
```typescript
// Playwright handles multi-domain naturally without any special wrapper
await page.goto('https://domain-a.com');
await page.goto('https://domain-b.com/login');
await page.locator('#external-auth').click();
```

### Example 22: Clock Manipulation (cy.clock)

**Cypress**:
```javascript
const now = new Date(2023, 1, 1).getTime();
cy.clock(now);
cy.visit('/');
cy.tick(5000);
cy.get('.timer').should('contain', '5 seconds');
```

**Playwright**:
```typescript
const now = new Date(2023, 1, 1).getTime();
await page.clock.install({ now });
await page.goto('/');
await page.clock.fastForward(5000);
await expect(page.locator('.timer')).toContainText('5 seconds');
```

---

## Custom Command Migration

### Example 23: Login Command → Page Object

**Cypress Custom Command**:
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Usage in test
describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
  });

  it('displays welcome message', () => {
    cy.contains('Welcome back').should('be.visible');
  });
});
```

**Playwright Page Object**:
```typescript
// tests/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get emailInput(): Locator {
    return this.page.getByLabel('Email');
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

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await expect(this.page).toHaveURL(/\/dashboard/);
  }
}

// tests/specs/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('user@example.com', 'password123');
  });

  test('displays welcome message', async ({ page }) => {
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
```

### Example 24: Auth Command → Fixture

**Cypress Custom Command**:
```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request('POST', '/api/auth/login', { email, password })
    .then(response => {
      window.localStorage.setItem('token', response.body.token);
    });
});

// Usage
beforeEach(() => {
  cy.loginViaAPI('admin@example.com', 'admin123');
  cy.visit('/admin');
});
```

**Playwright Fixture**:
```typescript
// tests/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login via API
    const response = await page.request.post('/api/auth/login', {
      data: { email: 'admin@example.com', password: 'admin123' }
    });
    
    const { token } = await response.json();
    
    // Set token in localStorage
    await page.goto('/');
    await page.evaluate(t => localStorage.setItem('token', t), token);
    
    await use(page);
  }
});

export { expect } from '@playwright/test';

// tests/specs/admin.spec.ts
import { test, expect } from '../fixtures/auth.fixture';

test.beforeEach(async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/admin');
});

test('admin dashboard loads', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
});
```

### Example 25: Utility Command → Helper Function

**Cypress Custom Command**:
```javascript
// cypress/support/commands.js
Cypress.Commands.add('generateRandomEmail', () => {
  return `user-${Date.now()}@example.com`;
});

/// Usage
const email = cy.generateRandomEmail();
cy.get('input[name="email"]').type(email);
```

**Playwright Helper**:
```typescript
// tests/helpers/generators.ts
export function generateRandomEmail(): string {
  return `user-${Date.now()}@example.com`;
}

export function generateRandomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Usage in test
import { test, expect } from '@playwright/test';
import { generateRandomEmail } from '../helpers/generators';

test('user registration', async ({ page }) => {
  const email = generateRandomEmail();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText(`Welcome ${email}`)).toBeVisible();
});
```

---

## Complete Test Examples

### Example 26: E-Commerce Product Search (TypeScript)

**Cypress**:
```javascript
// cypress/e2e/search.cy.js
describe('Product Search', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('searches for products and displays results', () => {
    cy.get('input[name="search"]').type('laptop');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '?q=laptop');
    cy.get('.product-card').should('have.length.greaterThan', 0);
    cy.get('.product-card').first().should('contain', 'laptop');
    
    cy.get('.result-count').invoke('text').then((text) => {
      const count = parseInt(text.match(/\d+/)[0]);
      expect(count).to.be.greaterThan(0);
    });
  });

  it('handles no results', () => {
    cy.get('input[name="search"]').type('xyznonexistent');
    cy.get('button[type="submit"]').click();
    
    cy.get('.no-results').should('be.visible');
    cy.get('.product-card').should('not.exist');
  });
});
```

**Playwright**:
```typescript
// tests/pages/ProductsPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {
  constructor(private readonly page: Page) {}

  get searchInput(): Locator {
    return this.page.getByPlaceholder('Search products...');
  }

  get searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search' });
  }

  get productCards(): Locator {
    return this.page.locator('.product-card');
  }

  get resultCount(): Locator {
    return this.page.locator('.result-count');
  }

  get noResultsMessage(): Locator {
    return this.page.locator('.no-results');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
}

// tests/specs/search.spec.ts
import { test, expect } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';

test.describe('Product Search', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await productsPage.goto();
  });

  test('searches for products and displays results', async ({ page }) => {
    await productsPage.search('laptop');
    
    await expect(page).toHaveURL(/\?q=laptop/);
    await expect(productsPage.productCards).not.toHaveCount(0);
    await expect(productsPage.productCards.first()).toContainText('laptop');
    
    const countText = await productsPage.resultCount.textContent();
    const count = parseInt(countText?.match(/\d+/)?.[0] || '0');
    expect(count).toBeGreaterThan(0);
  });

  test('handles no results', async ({ page }) => {
    await productsPage.search('xyznonexistent');
    
    await expect(productsPage.noResultsMessage).toBeVisible();
    await expect(productsPage.productCards).toHaveCount(0);
  });
});
```

### Example 27: Form Validation (JavaScript)

**Cypress**:
```javascript
// cypress/e2e/registration.cy.js
describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('validates required fields', () => {
    cy.get('button[type="submit"]').click();
    
    cy.get('#email-error').should('be.visible').and('contain', 'Email is required');
    cy.get('#password-error').should('be.visible').and('contain', 'Password is required');
  });

  it('validates email format', () => {
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.get('#email-error').should('contain', 'Invalid email format');
  });

  it('successfully registers user', () => {
    cy.intercept('POST', '/api/register').as('register');
    
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('SecurePass123!');
    cy.get('input[name="confirm"]').type('SecurePass123!');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@register').its('response.statusCode').should('eq', 201);
    cy.url().should('include', '/welcome');
  });
});
```

**Playwright**:
```javascript
// tests/pages/RegistrationPage.js
export class RegistrationPage {
  constructor(page) {
    this.page = page;
  }

  get emailInput() {
    return this.page.getByLabel('Email');
  }

  get passwordInput() {
    return this.page.getByLabel('Password');
  }

  get confirmPasswordInput() {
    return this.page.getByLabel('Confirm Password');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Register' });
  }

  get emailError() {
    return this.page.locator('#email-error');
  }

  get passwordError() {
    return this.page.locator('#password-error');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email, password, confirm = password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirm);
    await this.submitButton.click();
  }
}

// tests/specs/registration.spec.js
const { test, expect } = require('@playwright/test');
const { RegistrationPage } = require('../pages/RegistrationPage');

test.describe('User Registration', () => {
  let registrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  test('validates required fields', async ({ page }) => {
    await registrationPage.submitButton.click();
    
    await expect(registrationPage.emailError).toBeVisible();
    await expect(registrationPage.emailError).toContainText('Email is required');
    await expect(registrationPage.passwordError).toBeVisible();
    await expect(registrationPage.passwordError).toContainText('Password is required');
  });

  test('validates email format', async ({ page }) => {
    await registrationPage.emailInput.fill('invalid-email');
    await registrationPage.passwordInput.fill('password123');
    await registrationPage.submitButton.click();
    
    await expect(registrationPage.emailError).toContainText('Invalid email format');
  });

  test('successfully registers user', async ({ page }) => {
    const responsePromise = page.waitForResponse('**/api/register');
    
    await registrationPage.register('newuser@example.com', 'SecurePass123!');
    
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    await expect(page).toHaveURL(/\/welcome/);
  });
});
```

### Example 28: Multi-Step Wizard

**Cypress**:
```javascript
describe('Checkout Wizard', () => {
  beforeEach(() => {
    cy.visit('/checkout');
  });

  it('completes checkout flow', () => {
    // Step 1: Shipping
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="address"]').type('123 Main St');
    cy.contains('Next').click();
    
    // Step 2: Payment
    cy.get('input[name="cardNumber"]').type('4111111111111111');
    cy.get('input[name="expiry"]').type('12/25');
    cy.get('input[name="cvv"]').type('123');
    cy.contains('Next').click();
    
    // Step 3: Review
    cy.contains('John Doe').should('be.visible');
    cy.contains('123 Main St').should('be.visible');
    cy.contains('•••• 1111').should('be.visible');
    
    cy.intercept('POST', '/api/orders').as('submitOrder');
    cy.contains('Place Order').click();
    
    cy.wait('@submitOrder');
    cy.url().should('include', '/confirmation');
  });
});
```

**Playwright**:
```typescript
// tests/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  // Step 1: Shipping
  get firstNameInput(): Locator {
    return this.page.getByLabel('First Name');
  }

  get lastNameInput(): Locator {
    return this.page.getByLabel('Last Name');
  }

  get addressInput(): Locator {
    return this.page.getByLabel('Address');
  }

  // Step 2: Payment
  get cardNumberInput(): Locator {
    return this.page.getByLabel('Card Number');
  }

  get expiryInput(): Locator {
    return this.page.getByLabel('Expiry Date');
  }

  get cvvInput(): Locator {
    return this.page.getByLabel('CVV');
  }

  // Navigation
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Next' });
  }

  get placeOrderButton(): Locator {
    return this.page.getByRole('button', { name: 'Place Order' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  async fillShipping(firstName: string, lastName: string, address: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.addressInput.fill(address);
    await this.nextButton.click();
  }

  async fillPayment(cardNumber: string, expiry: string, cvv: string): Promise<void> {
    await this.cardNumberInput.fill(cardNumber);
    await this.expiryInput.fill(expiry);
    await this.cvvInput.fill(cvv);
    await this.nextButton.click();
  }
}

// tests/specs/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Wizard', () => {
  test('completes checkout flow', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    
    // Step 1: Shipping
    await checkoutPage.fillShipping('John', 'Doe', '123 Main St');
    
    // Step 2: Payment
    await checkoutPage.fillPayment('4111111111111111', '12/25', '123');
    
    // Step 3: Review
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('123 Main St')).toBeVisible();
    await expect(page.getByText('•••• 1111')).toBeVisible();
    
    // Submit order
    const responsePromise = page.waitForResponse('**/api/orders');
    await checkoutPage.placeOrderButton.click();
    await responsePromise;
    
    await expect(page).toHaveURL(/\/confirmation/);
  });
});
```

---

## Key Takeaways

1. **Always use semantic locators** (getByRole, getByLabel, getByText)
2. **All Playwright actions must be awaited**
3. **Migrate custom commands to Page Objects or Fixtures**
4. **Handle dialogs explicitly with accept/dismiss**
5. **Use page.route() for network interception**
6. **Prefer explicit assertions over waitForTimeout()**

## Resources

- [Repository Instructions](./.github/copilot-instructions.md)
- [Locator Strategy Guide](./docs/locator-strategy.md)
- [Complete Reference](./instructions.md)
- [Playwright Documentation](https://playwright.dev)
