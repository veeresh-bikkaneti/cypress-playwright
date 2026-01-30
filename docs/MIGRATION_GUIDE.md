# 🗺️ Migration Guide: Cypress to Playwright

> **Goal**: Move from Cypress "Chain of Command" style to Playwright "Async/Await" style with Page Objects.

---

## 🔍 As-Is vs To-Be (Side-by-Side)

### 1. Basic Interaction

| Feature | Cypress (As-Is) | Playwright (To-Be) |
|:--------|:----------------|:-------------------|
| **Concept** | Global `cy` chain | `page` instance + `await` |
| **Visit** | `cy.visit('/login')` | `await page.goto('/login')` |
| **Type** | `cy.get('#user').type('name')` | `await page.getByLabel('User').fill('name')` |
| **Click** | `cy.get('.btn').click()` | `await page.getByRole('button').click()` |

**Why Change?**
- **Cypress**: Retries *commands* (can be flaky if UI refreshes).
- **Playwright**: Auto-waits for *interaction capability* (visible, stable, enabled).

---

### 2. Assertions

| Cypress (Chai) | Playwright (Jest-like) |
|:---------------|:-----------------------|
| `cy.get(el).should('be.visible')` | `await expect(locator).toBeVisible()` |
| `cy.url().should('include', '/home')` | `await expect(page).toHaveURL(/home/)` |
| `cy.get(el).should('have.text', 'Hi')` | `await expect(locator).toHaveText('Hi')` |

**Why Change?**
- Playwright assertions wait until the condition is met or timeout (5s default). They are "web-first".

---

### 3. Page Object Model (POM)

**Legacy Cypress Pattern (Custom Commands)**
*Often used `cypress/support/commands.js` as a bucket for reusable code.*

```javascript
// support/commands.js
Cypress.Commands.add('login', (u, p) => {
  cy.get('#email').type(u);
  cy.get('#pass').type(p);
  cy.get('button').click();
});

// test.cy.js
cy.login('user', 'pass');
```

**Modern Playwright Pattern (Classes)**
*Strictly typed classes that encapsulate page logic.*

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(u: string, p: string) {
    await this.page.getByLabel('Email').fill(u);
    await this.page.getByLabel('Password').fill(p);
    await this.page.getByRole('button', { name: 'Log in' }).click();
  }
}

// test.spec.ts
const loginPage = new LoginPage(page);
await loginPage.login('user', 'pass');
```

---

### 4. Advanced Capabilities

#### 🌍 Cross-Origin (Multi-Domain)
- **Cypress**: Requires `cy.origin('domain.com', () => { ... })`. Specific syntax limits variable access.
- **Playwright**: Natural support. Just `await page.goto('https://other.com')`. The browser handles it.

#### 🕵️ API Mocking
- **Cypress**: `cy.intercept('GET', '/api', { body: {} })`.
- **Playwright**: `page.route('**/api', route => route.fulfill({ json: {} }))`.

#### 💾 Session Storage
- **Cypress**: `cy.session()`.
- **Playwright**: `test.use({ storageState: 'auth.json' })`. (Can reuse across all files without code changes).

---

## 🛠️ How to Migrate a File

1.  **Identify**: Pick a Cypress spec (e.g., `cypress/e2e/login.cy.ts`).
2.  **Generate POM**: Create `playwright/pages/LoginPage.ts`.
3.  **Use Agent**: Copy the Cypress code and ask the **`cypress-to-playwright`** agent:
    > "Migrate this Cypress test to Playwright using the LoginPage POM."
4.  **Verify**: Run `npx playwright test`.

---
