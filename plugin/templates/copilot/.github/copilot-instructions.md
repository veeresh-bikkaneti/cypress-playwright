---
description: Copilot adapter. Follow root AGENTS.md; this file must not contradict it.
alwaysApply: true
---

# Copilot adapter

**Source of truth is `AGENTS.md` at the repo root.** Skills live in `skills/` (mirrored to `.github/skills/` and `.agents/skills/`).

- Cypress conversion → skill `cypress-to-playwright-migration`
- Write/heal Playwright → skill `playwright-testing`
- Before merge → skill `code-review` (isolated git-range review, not this session)

Optional `@mentions`: `@qa-orchestrator`, `@cypress-to-playwright-migration`, `@playwright-healer`, `@playwright-test-generator`, `@playwright-test-planner`.
