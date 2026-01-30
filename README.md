# Cypress to Playwright Migration & Capabilities Demo

> 🚀 **One-Liner**: A beginner-friendly sandbox for learning Cypress, migrating to Playwright, and using AI Agents to automate the process.

[![Playwright](https://img.shields.io/badge/Playwright-v1.41+-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev)
[![Cypress](https://img.shields.io/badge/Cypress-v12+-17202C?style=flat-square&logo=cypress)](https://cypress.io)
[![Agents](https://img.shields.io/badge/AI_Agents-Active-8A2BE2?style=flat-square)](./docs/AGENT_WORKFLOWS.md)

---

## 📖 What is this?

This repository simulates a real-world "brownfield" project. It contains:
1.  **Legacy Cypress Tests**: A robust suite of Cypress tests (API, UI, Cross-origin).
2.  **Modern Playwright Tests**: The exact same tests, migrated to Playwright using best practices (POM, Fixtures).
3.  **App Under Test**: A local Node.js web server (`app-under-test/`) to run tests against.
4.  **AI Agents**: Specialized prompts and scripts (`.github/agents`) to automate migration, planning, and healing.

It is designed to help you **learn by doing** or **demonstrate migration capabilities**.

---

## ⚡ Quick Start (< 5 Minutes)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Docker](https://www.docker.com/) (Optional, for containerized runs)

### 2. Install Dependencies
```bash
npm install
npx playwright install --with-deps
```

### 3. Start the App
Open a new terminal and run:
```bash
node app-under-test/server.js
# Server starts at http://localhost:3000
```

### 4. Run Tests

**Option A: Cypress (Legacy)**
```bash
npm run cy:run
# Output: test-output/cypress-output/html/index.html
```

**Option B: Playwright (Modern)**
```bash
npx playwright test
# Output: test-output/playwright-output/report/index.html
```

**Option C: Hybrid (Parallel Mode) ⚔️**
Run both frameworks simultaneously to compare results or speed up CI:
```bash
npm run test:hybrid
# Runs cy:run and test:pw in parallel
```

---

## 🧭 Documentation Map

| Guide | Purpose | Audience |
|-------|---------|----------|
| [**Migration Guide**](./docs/MIGRATION_GUIDE.md) | **Step-by-step** showing Cypress code next to Playwright code (As-Is vs To-Be). | QA Engineers |
| [**Agent Workflows**](./docs/AGENT_WORKFLOWS.md) | How to use the **AI Agents** (Planner, Generator, Healer). | AI Engineers, Leads |
| [**Cypress Guide**](./docs/CYPRESS_GUIDE.md) | Deep dive into the legacy Cypress setup. | Maintenance |
| [**Docker Helper**](./docs/DOCKER_HELPER.md) | Running tests in containers. | DevOps |

---

## 🤖 AI Agents & Skills

This repo comes with "batteries included" AI assistance. The `.github/` folder contains instructions for your AI Assistant (GitHub Copilot, Cursor, etc.).

- **`playwright-test-planner`**: Plans test strategy.
- **`playwright-test-generator`**: Writes code from user stories.
- **`playwright-healer`**: Fixes broken tests using trace logs.
- **`cypress-to-playwright`**: Automated migration specialist.

👉 **[Read the Full Agent Guide](./docs/AGENT_WORKFLOWS.md)** to learn how to summon them.

---

## 📂 Project Structure

```
├── app-under-test/       # The local web application (Server + UI)
├── cypress/              # Legacy Cypress Tests
├── playwright/           # Modern Playwright Tests
│   ├── e2e/              #   - Test Specifications
│   ├── pages/            #   - Page Objects (POM)
│   └── fixtures/         #   - Reusable Logic
├── scripts/              # Automation Scripts (Agents update, diagnosis)
└── test-output/          # ALL test results go here (Gitignored)
```

---

## 🆘 Troubleshooting

**"Server address in use"**
If `node app-under-test/server.js` fails:
```bash
# Kill port 3000 (Windows)
npx kill-port 3000
```

**"Playwright browser not found"**
```bash
npx playwright install
```

**"Agents are outdated"**
The repo self-updates agent definitions every 15 days. To force it:
```bash
node scripts/update_agents.js
```
