---
name: code-review
description: Isolated code review of a completed migration or feature against requirements. Use after migrating a Cypress spec, finishing a Playwright feature, before merging to main, or when stuck and a fresh pass is needed. Never self-review in the implementer session.
license: MIT
---

# Requesting code review

Review early, review often. The reviewer must **not** share the implementer’s session history — only a git range, a short description, and the requirements.

This skill is vendor-neutral (Copilot code review, Claude, Grok, Codex, Cursor, OpenCode, or any subagent).

## When (mandatory)

- After each migrated spec
- After a major Playwright feature
- Before merge to the default branch

Also useful when stuck, before a refactor, or after a tricky healer change.

## How

1. Resolve the git range (helper: `skills/code-review/scripts/review-range.sh`):

```bash
./skills/code-review/scripts/review-range.sh origin/main HEAD
# prints BASE_SHA, HEAD_SHA, and git diff --stat
```

2. Dispatch a **separate** reviewer (new subagent, new chat, or GitHub Copilot code review). Give it **only** the template in [code-reviewer.md](code-reviewer.md).

Fill:

- `{DESCRIPTION}` — what changed
- `{PLAN_OR_REQUIREMENTS}` — Cypress source path, this repo’s `AGENTS.md`, or the task
- `{BASE_SHA}` / `{HEAD_SHA}`

Do not paste implementer notes, failed attempts, or tool logs.

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
