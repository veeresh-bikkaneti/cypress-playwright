# Plan: 10 enterprise-agent improvements

Branch: `feat/enterprise-agent-agnostic`
Base: `main`
Owner: supervisor (parent agent)
Loop: implement → verify → isolated review → E2E → PR

Source of truth for agent behavior remains root `AGENTS.md`. Do not reintroduce Copilot lock-in, hobby CLIs (Aider/Cline/Continue/Windsurf), or `model:` pins.

## Global constraints

- Feature branch only. Never commit to `main`.
- No `cy.*` in `playwright/`. No `page.waitForTimeout`.
- Locators: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`.
- Skills follow https://agentskills.io/specification (`name` + `description` required; `name` matches folder).
- Adapter files stay thin pointers at `AGENTS.md` + `skills/`.
- `model: inherit` or omit. Do not pin paid models.
- Plugin `npm test` (smoke-setup) must stay green.
- Playwright chromium must stay green after test/locator/auth changes.

## Tasks

| # | Title | Status | Notes |
| --- | --- | --- | --- |
| 1 | Portable AGENTS.md core | in progress (this branch) | Shared always-on contract |
| 2 | Isolated code-review skill | open | Match requesting-code-review (git range, no self-review) |
| 3 | Drop hobby CLIs; ship claimed adapters | in progress | Copilot/Cursor templates were empty |
| 4 | Agent Skills spec compliance | open | Phantom skills, extra keys, mirrors |
| 5 | Playwright locators + storageState | open | Vs live Playwright docs |
| 6 | Copilot `.agent.md` format | in progress | Thin wrappers, path instructions |
| 7 | CI / healer reliability | open | Artifact names, Node, Copilot-only heal |
| 8 | Identity / docs consistency | open | package.json, clone URL, Copilot-only docs |
| 9 | AGENTS.md as always-on winner | in progress | Adapters defer to it |
| 10 | Plugin installer completeness | in progress | Mirrors, smoke assertions |

## Task details

### 1 / 3 / 6 / 9 / 10 — Enterprise adapter core (this branch, already drafted)

Portable `AGENTS.md` + `skills/`. Thin adapters for Copilot, Claude, Cursor, Gemini. Grok/Codex/OpenCode core-only. Installer mirrors skills. Smoke test covers required files.

### 2 — Isolated code-review

`skills/code-review` must require a **separate** reviewer with `{BASE_SHA}` `{HEAD_SHA}` `{DESCRIPTION}` `{PLAN_OR_REQUIREMENTS}` only. Add a small helper script `skills/code-review/scripts/review-range.sh` that prints the git range. Remove any implication that the implementer reviews itself.

### 4 — Skills spec

- Canonical skills live in `skills/` only: the four playbooks.
- Delete or stop shipping Copilot-only phantoms (`clean-code`, `testing-patterns`) from installer output. Keep `.github/skills/` as a **mirror** of `skills/`, not a second catalog of personas.
- Validate frontmatter: `name` matches directory, lowercase hyphenated, description includes what + when.
- Add `plugin/scripts/audit-skills.js` and call it from `plugin/npm test`.

### 5 — Playwright vs docs

- Page objects: labeled inputs → `getByLabel`; buttons/links → `getByRole`; else `getByTestId('x')` not `locator('[data-testid="x"]')`.
- Demo HTML already has labels on login (`Email Address`, `Password`, `Remember me`).
- Auth: setup project + `storageState` for authenticated tests; login specs use a clean storage state. Stop UI-login in `authenticatedPage` per test.
- Do not drop coverage. Re-run `npx playwright test --project=chromium`.

### 7 — CI

- `hybrid-ci.yml` job Node 18 → 20 (repo engines/badge).
- Auto-heal `workflow_run` name must match workflow `name:` (`Hybrid Test Execution` vs `"Hybrid CI"`).
- Artifact names: healer downloads `test-results`; CI uploads `playwright-results` / `cypress-results`. Align.
- Healer issue body must not mention `@cypress-healer` as primary. Point at `skills/playwright-testing` / natural language.
- `npm audit` should not silently `continue-on-error` without a summary.
- Disable or gate `update-agents.yml` live mutation of agent files if it still fetches/rewrites Copilot personas unsafely. Prefer pinning via `package.json` versions in `AGENTS.md`.

### 8 — Identity

- Root `package.json` `name`/`description` should describe the hybrid Cypress→Playwright + enterprise-agent toolkit.
- Clone URLs: `veeresh-bikkaneti/cypress-playwright` not `vbikkaneti/...`.
- Docs (`AGENT_WORKFLOWS`, `.github/README`) already rewritten; grep leftover `@cypress-healer`, Aider, Copilot-only claims.

## Integration order

1. Commit adapter core (1,3,6,9,10) on this branch.
2. Parallel worktrees: task 2+4 (skills), task 5 (tests), task 7 (CI), task 8 (identity).
3. Merge worktrees; fix conflicts in supervisor.
4. Isolated code review of merge-base..HEAD.
5. Parallel E2E: plugin smoke, Playwright chromium, skill audit.
6. Supervisor verdict. Then PR. Never PR with failing E2E or unfixed Critical/Important review findings.
