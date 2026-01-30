# 🤖 AI Agent Workflows

> **Goal**: Use the "Batteries Included" AI Agents to plan, build, heal, and migrate tests.

---

## 🏗️ The Agent Squad

| Agent | File | Specialty |
|:------|:-----|:----------|
| **Planner** | `playwright-test-planner.agent.md` | Strategy, Component vs E2E, Coverage |
| **Generator** | `playwright-test-generator.agent.md` | Writing code from User Stories |
| **Healer** | `playwright-healer.md` | Diagnosing failures & fixing selectors |
| **Migrator** | `cypress-to-playwright.agent.md` | Converting Cypress to Playwright |

---

## 🚀 How to Summon an Agent

### 1. The Migrator (Cypress -> Playwright)

**Use when**: You have a legacy Cypress test file and want a Playwright version.

**Prompt**:
> "@cypress-to-playwright Migrate `cypress/e2e/login.cy.ts` to Playwright using the Page Object Model."

**What happens**:
1.  Agent reads the file.
2.  Identifies custom commands (`cy.login`).
3.  Creates a Page Object (`pages/LoginPage.ts`).
4.  Creates the Test Spec (`e2e/login.spec.ts`).
5.  Includes strict type safety and semantic locators.

### 2. The Planner (New Feature Strategy)

**Use when**: You have a new feature request (e.g., "Add a Shopping Cart") but no code yet.

**Prompt**:
> "@playwright-test-planner Create a test plan for the new Shopping Cart feature. Use BDD style."

**What happens**:
1.  Agent outlines scenarios (Happy Path, Edge Cases).
2.  Recommends Directory Structure.
3.  Identifies necessary Fixtures.

### 3. The Generator (Writing Code)

**Use when**: You have a plan and want the actual test code.

**Prompt**:
> "@playwright-test-generator Generate the tests for the Shopping Cart based on this plan."

**What happens**:
1.  Agent writes `pages/CartPage.ts`.
2.  Agent writes `e2e/cart.spec.ts`.
3.  Agent ensures all selectors use `getByRole` (Accessibility first).

### 4. The Healer (Fixing Failures)

**Use when**: A CI build failed or a test is flaky.

**Prompt**:
> "@playwright-healer Fix the failure in `e2e/cart.spec.ts`. Here are the logs..."

**What happens**:
1.  Agent analyzes the error (e.g., "Timeout waiting for selector").
2.  Checks the Trace Viewer summary.
3.  Suggests a fix (e.g., "Selector changed ID -> Class", or "Need to await API response").

---

## 🛠️ Skills & Capabilities

The agents are powered by specialized **Skills** defined in `.github/skills/`.

- **`webapp-testing`**: Deep knowledge of DOM, Network, and Accessibility testing.
- **`clean-code`**: Enforces DRY, SOLID, and readable code.
- **`documentation-templates`**: Ensures docs are formatted correctly.

---

## 🔄 Self-Maintenance

These agents are **self-updating**. A script runs every 15 days to ensure they match the installed version of Playwright and Cypress.

- **Check status**: `.github/workflows/update-agents.yml`
- **Manual update**: `node scripts/update_agents.js`
