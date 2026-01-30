# 🎓 Beginner's Guide: Automation Sandbox

Welcome! This guide assumes **zero prior knowledge** of this specific project. By the end, you will be running automated tests like a pro.

---

## 🛠️ Step 1: The Setup

Before we run anything, we need to install the tools.

1.  **Open Terminal** (Command Prompt, PowerShell, or Git Bash).
2.  **Navigate** to this folder.
3.  **Install Packages**:
    ```bash
    npm install
    ```
4.  **Install Browsers** (for Playwright):
    ```bash
    npx playwright install --with-deps
    ```

---

## 🎬 Step 2: Start the Engine

This project tests a **real web application**. We need to start it first.

1.  Open a **NEW** terminal window (keep the first one open).
2.  Run:
    ```bash
    node app-under-test/server.js
    ```
3.  You should see: `Server running at http://localhost:3000`

---

## 🏃 Step 3: Run Your First Test

### Option A: The "Modern" Way (Playwright)
*Recommended for new code.*

1.  Go back to your **first** terminal.
2.  Run:
    ```bash
    npx playwright test
    ```
3.  Wait for the green checkmarks! ✅
4.  See the report:
    ```bash
    npx playwright show-report test-output/playwright-output/report
    ```

### Option B: The "Legacy" Way (Cypress)
*Good for understanding where we came from.*

1.  Run:
    ```bash
    npm run cy:run
    ```
2.  See the report:
    `test-output/cypress-output/html/index.html`

---

## 🕵️ Step 4: Explore the Code

- **`app-under-test/`**: The website source code.
- **`playwright/e2e/`**: The new tests. Open one!
- **`cypress/e2e/tests/`**: The old tests. Compare them!

---

## 🤝 Step 5: Ask for Help (AI Agents)

Stuck? Valid questions to ask your AI Assistant:

*   "How do I write a test for the Login page?"
*   "Explain the difference between `cy.get` and `page.locator`."
*   "Fix this broken test for me."

See [Agent Workflows](AGENT_WORKFLOWS.md) for more magic.
