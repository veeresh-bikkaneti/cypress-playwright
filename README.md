# Cypress to Playwright Migration Demo

> **Note**: This repository is a dedicated playground for demonstrating the migration of **Cypress (TypeScript)** tests to **Playwright (TypeScript)**, leveraging AI assistants like GitHub Copilot.

While the original codebase is based on an OWASP-compliant test suite, the primary focus here is the **migration methodology**, tooling, and validation between the two frameworks.

## 🎯 Project Goals

1.  **Demonstrate Migration Patterns**: Show direct comparisons between Cypress commands (`cy.*`) and Playwright locators/actions (`await page.*`).
2.  **AI-Assisted Refactoring**: utilizing AI agents to convert tests while maintaining robust locator strategies.
3.  **Validation**: A structured approach to verifying that the ported Playwright tests provide the same coverage and value as the original Cypress tests.

## 📂 Repository Structure

-   **`cypress/`**: Contains the source Cypress test project (`cypressAllure`). This is the "Legacy" state we are migrating *from*.
    -   See `cypress/cypressAllure/README.md` for specific Cypress detailed docs.
-   **`tests/`**: The destination folder for the new Playwright implementation.
-   **`docs/`**: Documentation for both frameworks and the migration strategy.
-   **`scripts/`**: Utility scripts for maintenance and setup.

## 🚀 Getting Started (Beginner's Guide)

### Prerequisites

-   [Node.js](https://nodejs.org/) (Latest LTS recommended).
-   [Visual Studio Code](https://code.visualstudio.com/) or your preferred IDE.
-   (Optional) Docker for running containerized tests.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd cypress-playwright
    ```

2.  **Install Cypress Dependencies** (for the source project):
    ```bash
    cd cypress/cypressAllure
    npm install
    ```

3.  **Install Playwright Dependencies** (for the new project):
    *(If you are setting up Playwright for the first time in the root)*
    ```bash
    # Return to root
    cd ../..
    npm init -y  # If package.json is missing in root
    npm init playwright@latest
    ```

## 🛤️ Migration Flow: How to "Hop on the Train"

Follow this workflow to contribute to the migration:

### 1. Identify a Candidate
Go to the `cypress/cypressAllure/cypress/e2e/tests` folder and pick a spec file (e.g., `login.test.ts`) that hasn't been migrated yet.

### 2. Understand the Source
Run the Cypress test to understand what it does:
```bash
cd cypress/cypressAllure
npx cypress open
```

### 3. Convert with AI
Create a new corresponding spec file in `tests/` (e.g., `tests/specs/login.spec.ts`).
Use your AI assistant (Copilot Chat, etc.) with a prompt like:
> "Convert this Cypress TypeScript test to Playwright TypeScript. Use `page.getByRole` and semantic locators where possible. Replace `cy.intercept` with `page.route`."

### 4. Refine and Validate
AI translation is a starting point, not the end.
-   **Fix Locators**: Ensure they are stable and resilient.
-   **Add Awaits**: Playwright is async/await based. ensuring no floating promises.
-   **Check Assertions**: Replace `should` chai assertions with `expect` Web-First assertions.

Refer to **[tests/validation.md](tests/validation.md)** for a checklist of what to verify.

## 🧪 Running Tests

### Running Cypress (Source)
```bash
cd cypress/cypressAllure
npm run cy:run    # Headless
npm run cy:open   # Interactive
```

### Running Playwright (Destination)
```bash
# From the root directory (assuming Playwright is initialized)
npx playwright test
npx playwright test --ui  # Interactive UI mode
```

## 📚 Resources

-   [Validation Checklist](tests/validation.md): detailed steps for verifying migration quality.
-   [Playwright Documentation](https://playwright.dev/)
-   [Cypress Documentation](https://docs.cypress.io/)
