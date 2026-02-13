# BDD Test Template (Behavior-Driven Development)

##Description
Use this template for writing tests in **Given-When-Then** format, emphasizing business behavior over implementation details.

## Template Structure

```typescript
import { test, expect } from '@playwright/test';
import { [Feature]Page } from '../pages/[Feature]Page';

test.describe('Feature: [Feature Name]', () => {
  test.describe('[User Role/Persona]', () => {
    test('Scenario: [Scenario Description]', async ({ page }) => {
      // Given: [Precondition - system state]
      // Setup initial state, navigate to page, authenticate, etc.
      
      // When: [Action - user behavior]
      // Perform the action being tested
      
      // Then: [Expected Outcome - observable result]
      // Verify the expected outcome
    });
  });
});
```

## Full Example

```typescript
// playwright/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { Checkout Page } from '../pages/CheckoutPage';
import { authenticatedUser } from '../fixtures/auth.fixture';

test.describe('Feature: Checkout Process', () => {
  test.describe('As an authenticated user', () => {
    test.use({ ...authenticatedUser });

    test('Scenario: Complete purchase with valid payment information', async ({ page }) => {
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      // Given: The user has items in their cart
      await cartPage.goto();
      await expect(cartPage.cartItems).toHaveCount(2); // Verify cart has items

      // When: The user proceeds to checkout and completes payment
      await cartPage.proceedToCheckout();
      await checkoutPage.fillShippingAddress({
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        zip: '10001'
      });
      await checkoutPage.fillPaymentInfo({
        cardNumber: '4242424242424242',
        expiry: '12/25',
        cvc: '123'
      });
      await checkoutPage.placeOrder();

      // Then: The order is confirmed and a confirmation number is displayed
      await expect(page).toHaveURL(/\/order-confirmation/);
      await expect(page.getByRole('heading', { name: 'Order Confirmed' })).toBeVisible();
      await expect(page.getByTestId('order-number')).toBeVisible();
      await expect(page.getByTestId('order-number')).toHaveText(/ORD-\d+/);
    });

    test('Scenario: Validation error for missing payment information', async ({ page }) => {
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      // Given: The user has items in their cart
      await cartPage.goto();
      await cartPage.proceedToCheckout();

      // When: The user fills shipping but skips payment information
      await checkoutPage.fillShippingAddress({
        name: 'John Doe',
        address: '123 Main St',
        city: 'New York',
        zip: '10001'
      });
      // Intentionally skip payment info
      await checkoutPage.placeOrder();

      // Then: Validation errors are shown for payment fields
      await expect(page.getByText('Payment information is required')).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Card Number' })).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test.describe('As a guest user', () => {
    test('Scenario: Redirected to login when attempting checkout', async ({ page }) => {
      const cartPage = new CartPage(page);

      // Given: The user is not authenticated and has items in cart
      await cartPage.goto();
      await cartPage.addSampleItemToCart(); // Helper to add item without auth

      // When: The user attempts to proceed to checkout
      await cartPage.proceedToCheckout();

      // Then: The user is redirected to the login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByText('Please log in to continue')).toBeVisible();
    });
  });
});
```

## BDD Principles

### 1. Focus on Behavior, Not Implementation
✅ **Good**: "User receives confirmation email"  
❌ **Bad**: "POST request to /api/send-email returns 200"

### 2. Use Business Language
Write tests that non-technical stakeholders can understand.

### 3. One Scenario, One Behavior
Each test should verify a single business scenario.

### 4. Given-When-Then Structure
- **Given**: Set up the world (preconditions)
- **When**: Perform an action (the behavior)
- **Then**: Verify the outcome (expected result)

### 5. Make Tests Readable
Use descriptive names, clear comments, and well-named page objects.

## Requirements Traceability

Always link tests to requirements:

```typescript
/**
 * @feature CHECKOUT-001
 * @user-story As a customer I want to complete my purchase securely
 * @acceptance-criteria
 *   - AC-1: User can enter shipping address
 *   - AC-2: User can enter payment information
 *   - AC-3: User receives order confirmation
 * @unstated-requirements
 *   - SEC-001: Payment info must be transmitted over HTTPS
 *   - A11Y-001: Checkout form must be keyboard accessible
 *   - PERF-001: Checkout completion < 3 seconds
 */
test.describe('Feature: Checkout Process', () => {
  // Tests here
});
```

## When to Use BDD

Use BDD templates when:
- Working with product owners or business stakeholders
- Testing user journeys and workflows
- Documenting feature behavior
- Need living documentation (tests as specs)

## Cypress BDD Example

For Cypress users, the structure is similar:

```typescript
describe('Feature: User Login', () => {
  context('As a registered user', () => {
    it('Scenario: Successful login with valid credentials', () => {
      // Given: User is on the login page
      cy.visit('/login');

      // When: User enters valid credentials and clicks login
      cy.get('[data-testid="email"]').type('user@example.com');
      cy.get('[data-testid="password"]').type('SecurePass123!');
      cy.get('[data-testid="login-btn"]').click();

      // Then: User is redirected to dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome back').should('be.visible');
    });
  });
});
```

## Tools & Plugins

Consider using:
- **Cucumber**: For `.feature` files with Gherkin syntax
- **@cucumber/cucumber**: Cucumber JS integration
- **playwright-bdd**: Playwright + Cucumber integration
