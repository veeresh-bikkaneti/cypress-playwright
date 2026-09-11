# Gemini / Antigravity / Jules

Read [AGENTS.md](./AGENTS.md) first. That file is the source of truth. If this file conflicts with it, prefer not to — keep this file a pointer so Antigravity cannot silently override shared rules.

Skills live in `skills/` and `.agents/skills/`. Use:

- `cypress-to-playwright-migration` to convert Cypress specs
- `playwright-testing` to write or heal Playwright tests
- `code-review` after a completed change, with a git range — do not self-review

Pin APIs to `package.json`. No `cy.*` in `playwright/`. No `waitForTimeout`.
