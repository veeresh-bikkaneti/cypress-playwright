# GitHub Configuration & AI Resources

This directory contains the configuration files, instructions, and agent definitions that power the **AI-Assisted Cypress to Playwright Migration** workflow.

## 🤖 AI Agents & Prompts

We define specific contexts for GitHub Copilot and other AI agents to ensure high-quality, consistent migration code.

| Resource | Description |
| :--- | :--- |
| **[`copilot-instructions.md`](./copilot-instructions.md)** | **The Core Rulebook**. Contains the system prompt instructions for migrating Cypress to Playwright. It defines the "Laws of Migration" (e.g., "Must await all actions", "Prefer `getByRole`"). |
| **[`agents/`](./agents/)** | Definitions for specialized agents (e.g., `cypress-to-playwright.agent.md`). |
| **[`prompts/`](./prompts/)** | Reusable prompt templates for specific migration tasks. |

## 📝 Copilot Instructions (`copilot-instructions.md`)

This file is the single source of truth for how the AI should behave. It covers:
-   **Scope**: Migrating `cy.*` commands to `await page.*` calls.
-   **Refusals**: Patterns the AI must refuse to generate (e.g., bare `waitForTimeout`, Generic CSS selectors).
-   **Mappings**: Detailed lookup table for command translation.
-   **Migration Strategy**: Rules for converting Custom Commands to Page Objects or Fixtures.

### How to use
When asking Copilot to migrate a file, you can reference these rules by adding the file to your context or simply saying:
> "Convert this test following the rules in `.github/copilot-instructions.md`."

## 📂 Workflow

1.  **Read the Instructions**: Familiarize yourself with `copilot-instructions.md`.
2.  **Select a Test**: Pick a Cypress test from `cypress/cypressAllure/cypress/e2e/tests`.
3.  **Invoke Agent**: Use the agent defined in `agents/` or manually prompt using the templates in `prompts/`.
4.  **Validate**: Ensure the generated Code follows the "Non-Negotiable Quality Rules" in the instructions.
