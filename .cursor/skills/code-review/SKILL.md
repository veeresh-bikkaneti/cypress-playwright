---
name: code-review
description: Isolated code review of a completed migration or feature against requirements. Use after migrating a Cypress spec, finishing a Playwright feature, before merging to main, or when stuck and a fresh pass is needed.
license: MIT
---

# Requesting code review

Review early, review often. The reviewer must **not** share the implementer’s session history — only a git range, a short description, and the requirements.

This skill is vendor-neutral. Works with Copilot code review, Claude, Grok, Codex, Cursor, or any subagent.

## When (mandatory)

- After each migrated spec
- After a major Playwright feature
- Before merge to the default branch

Also useful when stuck, before a refactor, or after a tricky healer change.

## How

1. Resolve the git range:

```bash
BASE_SHA=$(git rev-parse origin/main)   # or HEAD~1 for a single commit
HEAD_SHA=$(git rev-parse HEAD)
```

2. Dispatch a **separate** reviewer (subagent, Copilot code review, or a new chat). Give it only the template in [code-reviewer.md](code-reviewer.md).

Fill:

- `{DESCRIPTION}` — what changed
- `{PLAN_OR_REQUIREMENTS}` — Cypress source path, this repo’s `AGENTS.md`, or the task
- `{BASE_SHA}` / `{HEAD_SHA}`

3. Act on the verdict:

| Severity | Action |
| --- | --- |
| Critical | Fix now |
| Important | Fix before merge |
| Minor | Note; do not block |
| Reviewer is wrong | Push back with code/tests |

## Never

- Skip because “it’s a small spec”
- Let the implementer agent review its own diff in the same context
- Ignore Critical / Important
- Mark nits as Critical
- Spawn a second reviewer from inside the review

Copilot code review on GitHub also loads this skill when the directory is named `code-review` under `.github/skills/`.
