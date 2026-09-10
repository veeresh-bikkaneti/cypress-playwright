# Gemini / Antigravity / Jules

Read [AGENTS.md](./AGENTS.md) first. That file is the source of truth.

Skills live in `skills/` and `.agents/skills/`. Use:

- `cypress-to-playwright-migration` to convert Cypress specs
- `playwright-testing` to write or heal Playwright tests
- `code-review` after a completed change, with a git range — do not self-review

Pin APIs to `package.json`. No `cy.*` in `playwright/`. No `waitForTimeout`.
