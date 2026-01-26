# Beginner's Guide to Cypress Automation

Welcome! This guide is designed to help you get started with the **Cypress-e2e-Allure Automation Framework**. Whether you are new to test automation or just new to Cypress, this document will walk you through the basics.

## 🚀 What is Cypress?

Cypress is a next-generation front-end testing tool built for the modern web. Unlike Selenium, which runs outside the browser and executes remote commands, **Cypress runs inside the same run-loop as your application**.

### Why Cypress?
- **Time Travel:** See exactly what happened at each step.
- **Debuggability:** Readable errors and stack traces.
- **Automatic Waiting:** No more `Thread.sleep` or arbitrary waits. Cypress waits for commands and assertions automatically.
- **Real-time Reloads:** Tests automatically reload whenever you make changes to your test code.

---

## 🛠️ Getting Started

### Prerequisites
1. **Node.js**: Ensure you have Node.js installed. (Run `node -v` to check)
2. **VS Code**: Recommended IDE for writing tests.

### Installation
1. Clone this repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project folder:
   ```bash
   cd cypress-e2e-allure
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running Tests

You can run tests in two modes:

### 1. Interactive Mode (Test Runner)
This opens the Cypress Launchpad. You can see your tests running in a real browser.
```bash
npx cypress open
```
- Click **E2E Testing**.
- Choose a browser (Chrome, Edge, etc.).
- Click on a spec file (e.g., `login.test.ts`) to run it.

### 2. Headless Mode (CLI)
Runs tests in the background (good for CI/CD).
```bash
npx cypress run
```
To run a specific test file:
```bash
npx cypress run --spec cypress/e2e/tests/login.test.ts
```

---

## 📂 Project Structure

- **`cypress/e2e/tests`**: Contains all your test files (`.test.ts`).
- **`cypress/pages`**: Page Object Model (POM) files. Contains methods to interact with page elements.
- **`cypress/fixtures`**: Static data files (JSON) for testing (e.g., user credentials).
- **`cypress/support`**: Global commands and configuration (e.g., `commands.ts`).
- **`cypress.config.ts`**: Main configuration file for Cypress.

---

## ✍️ Writing Your First Test

Create a new file `cypress/e2e/tests/my_first_test.ts`:

```typescript
describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    // 1. Visit a website
    cy.visit('https://example.cypress.io');

    // 2. Query for an element
    cy.contains('type').click();

    // 3. Interact and Assert
    cy.url().should('include', '/commands/actions');
    
    // 4. Type into an input
    cy.get('.action-email')
      .type('hello@cypress.io')
      .should('have.value', 'hello@cypress.io');
  });
});
```

### Key Commands
| Command | Description |
| :--- | :--- |
| `cy.visit(url)` | Opens a URL. |
| `cy.get(selector)` | Finds an element by CSS selector. |
| `cy.contains(text)` | Finds an element containing specific text. |
| `cy.click()` | Clicks a DOM element. |
| `cy.type(text)` | Types into a DOM element. |
| `cy.should(...)` | Creates an assertion (e.g., `be.visible`, `have.value`). |

---

## 💡 Best Practices Implemented Here

1. **Page Object Model (POM)**: We separate test logic from page details. Check `cypress/pages/loginPage.ts`.
2. **Custom Commands**: Reusable commands like `cy.login()` are defined in `cypress/support/commands.ts`.
3. **Data Driven Testing**: We use `cypress/fixtures/users.json` to store test data.

---

## 🔒 Production Best Practice: Stripping `data-testid`

We use `data-testid` attributes for reliable element selection in tests. However, these should **not** be exposed in production.

### Why Strip `data-testid` in Production?
- Reduces HTML payload size
- Prevents exposing internal testing selectors
- Keeps the DOM clean for end users

### How to Strip (Industry Standard)

**For this Vanilla JS app:**
```bash
npm run build:prod
```
This runs `scripts/strip-testids.js` which removes all `data-testid` attributes.

**For React/Vue apps (recommended plugins):**
```javascript
// Babel (React)
['react-remove-properties', { properties: ['data-testid'] }]

// Vite
import removeTestIds from 'vite-plugin-react-remove-attributes';
```

---

## 📚 Learn More
- [Official Cypress Documentation](https://docs.cypress.io)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)

Happy Testing! 🧪

