# Cypress2Playwright Using AI

> AI-powered Cypress-to-Playwright migration toolkit. Installable agent configurations for **7 major AI coding tools**.

[![npm](https://img.shields.io/badge/npm-cypress-playwright-red?style=flat-square&logo=npm)](https://www.npmjs.com/package/cypress2playwright-using-ai)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue?style=flat-square&logo=visual-studio-code)](https://marketplace.visualstudio.com/)
[![Playwright](https://img.shields.io/badge/Playwright-v1.38+-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev)

---

## What Is This?

A **single package** that installs AI agent configurations, migration guides, testing standards, and quality rules into your project — pre-configured for whichever AI coding tool you use.

### Supported Tools

| Tool | Config Files | How It Works |
|------|-------------|--------------|
| **GitHub Copilot** | `.github/copilot-instructions.md`, `.github/agents/*.agent.md` | Agents invoked via `@mentions` |
| **Claude Code** | `CLAUDE.md`, `.claude/commands/*.md` | Instructions + `/slash` commands |
| **Cursor** | `.cursor/rules/*.mdc` | Rules triggered by globs, always-on, or `@mentions` |
| **Cline** | `.clinerules/*.md` | Rules toggled per-task in the UI |
| **Windsurf** | `.windsurf/rules/*.md` | Rules with `trigger` modes (always_on, glob, manual) |
| **Aider** | `.aider.conf.yml`, `CONVENTIONS.md` | Read-only context loaded automatically |
| **Continue** | `.continue/rules/*.md` | Rules injected into chat context |

---

## Quick Start

### Option 1: npx (Recommended)

```bash
# Auto-detect installed tools and configure them
npx cypress2playwright-using-ai setup

# Install for specific tools
npx cypress2playwright-using-ai setup --tools copilot,cursor

# Install for ALL tools
npx cypress2playwright-using-ai setup --all
```

### Option 2: npm Install

```bash
npm install cypress2playwright-using-ai --save-dev
npx cypress2playwright-setup
```

### Option 3: VS Code Extension

1. Open VS Code
2. Install "Cypress2Playwright Using AI" from the Extensions marketplace
3. Run command: `Cypress2Playwright: Setup AI Agents`

### Option 4: Manual Copy

Clone the repo and copy the relevant template directory into your project:

```bash
git clone https://github.com/vbikkaneti/cypress-playwright.git
# Then copy the templates for your tool:
#   templates/copilot/    → for GitHub Copilot
#   templates/claude/     → for Claude Code
#   templates/cursor/     → for Cursor
#   templates/cline/      → for Cline
#   templates/windsurf/   → for Windsurf
#   templates/aider/      → for Aider
#   templates/continue/   → for Continue
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `setup` | Install agent configs (auto-detects tools) |
| `detect` | Show which AI tools are detected in this project |
| `list` | List all supported tools |

### Options

| Flag | Description |
|------|-------------|
| `--tools <list>` | Comma-separated list of tools (e.g., `copilot,claude,cursor`) |
| `--all` | Install templates for ALL supported tools |
| `--target <path>` | Target project directory (default: cwd) |
| `--help` | Show help message |

---

## What You Get

### Migration Agents

| Agent | What It Does |
|-------|-------------|
| **qa-orchestrator** | Central coordinator — routes tasks to the right specialist |
| **playwright-test-generator** | Generates Playwright tests from natural language requirements |
| **playwright-test-planner** | Plans test strategies and coverage maps |
| **playwright-healer** | Diagnoses and fixes broken Playwright tests |
| **cypress-healer** | Diagnoses and fixes broken Cypress tests |
| **cypress-to-playwright** | Migrates Cypress tests to Playwright |

### Coding Standards

- Locator priority: `getByRole` > `getByLabel` > `getByText` > `getByTestId` > CSS
- All actions must be `await`ed
- No `waitForTimeout` — explicit waits only
- Page Object Model for pages with 3+ interactions
- Test isolation — no shared state
- TypeScript strict mode

### Migration Cheat Sheet

| Cypress | Playwright |
|---------|-----------|
| `cy.visit(url)` | `await page.goto(url)` |
| `cy.get(sel)` | `page.locator(sel)` |
| `cy.contains(text)` | `page.getByText(text)` |
| `cy.get(sel).click()` | `await page.locator(sel).click()` |
| `cy.get(sel).type(text)` | `await page.locator(sel).fill(text)` |
| `cy.intercept(method, url)` | `await page.route(pattern, route => ...)` |
| `cy.wait('@alias')` | `await page.waitForResponse(pattern)` |
| `cy.get(sel).should('be.visible')` | `await expect(page.locator(sel)).toBeVisible()` |
| `cy.url().should('include', path)` | `await expect(page).toHaveURL(/path/)` |
| `cy.get(sel).should('have.text', x)` | `await expect(page.locator(sel)).toHaveText(x)` |

---

## Tool-Specific Setup

### GitHub Copilot

**Files installed:**
- `.github/copilot-instructions.md` — Always-on project rules
- `.github/agents/*.agent.md` — Invokable agents

**Usage:**
```
@qa-orchestrator create tests for login flow
@cypress-to-playwright migrate cypress/e2e/tests/login.test.ts
@playwright-healer fix playwright/e2e/smoke.spec.ts
```

### Claude Code

**Files installed:**
- `CLAUDE.md` — Project instructions (auto-loaded)
- `.claude/commands/*.md` — Slash commands

**Usage:**
```
/create-test login form validation
/heal-test playwright/e2e/smoke.spec.ts
/migrate cypress/e2e/tests/checkout.test.ts
```

### Cursor

**Files installed:**
- `.cursor/rules/*.mdc` — Context-aware rules

**Usage:** Rules auto-apply based on file globs, or invoke manually:
```
@playwright-testing
@cypress-migration
```

### Cline

**Files installed:**
- `.clinerules/*.md` — Toggleable rules

**Usage:** Toggle rules on/off in the Cline rules panel.

### Windsurf

**Files installed:**
- `.windsurf/rules/*.md` — Trigger-mode rules

**Usage:** Rules activate via `trigger: always_on`, `glob`, or `@mention`.

### Aider

**Files installed:**
- `.aider.conf.yml` — Auto-loads conventions
- `CONVENTIONS.md` — Coding standards

**Usage:** Aider auto-reads CONVENTIONS.md via the `read:` config.

### Continue

**Files installed:**
- `.continue/rules/*.md` — Chat context rules

**Usage:** Rules inject into chat based on `alwaysApply` or `globs`.

---

## Customization

After installation, customize the agent configs for your team:

1. **Edit rules** — Open the tool-specific config files and adjust to your conventions
2. **Add agents** — Create new `.agent.md`, `.mdc`, or `.md` files following the existing patterns
3. **Remove tools** — Delete config files for tools you don't use
4. **Share** — Commit the configs to your repo so your whole team benefits

---

## Requirements

- **Node.js**: v20+
- **Playwright**: v1.38+ (for test execution)
- **Cypress**: v10.x – 15.x (for migration source reference)

---

## License

MIT
