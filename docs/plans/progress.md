# SDD ledger — plan: docs/plans/ten-improvements.md

## Rulings I made

- Ruling: Parallel implementer subagents stalled after planning — Supervisor implemented remaining tasks in-tree rather than looping forever. Cost if wrong: less isolation; mitigated by chromium E2E + plugin smoke + skill audit.
- Ruling: VS Code `publisher: vbikkaneti` is a marketplace ID, not a clone URL — leave it.
- Ruling: Nested Copilot personas were dead (ignored + unused). Deleted; five thin `*.agent.md` wrappers remain.
- Ruling: `authenticatedPage` was dead. Removed. Authenticated specs use `test.use({ storageState: AUTH_STATE })`. Setup checks Remember me because the app puts the token in sessionStorage otherwise, which Playwright does not restore.
- Ruling: Isolated reviewer subagent stalled — supervisor review used git range + E2E evidence.

## Completion

| Task | Status |
| --- | --- |
| 1 Portable AGENTS.md | complete 062f172 |
| 2 Isolated code-review | complete dd97bd4 |
| 3 Drop hobby CLIs / ship adapters | complete 062f172 |
| 4 Skills spec + audit | complete dd97bd4 |
| 5 Locators + storageState | complete; storageState now consumed |
| 6 Copilot .agent.md | complete; dead nested personas deleted |
| 7 CI/healer | complete dd97bd4 |
| 8 Identity | complete dd97bd4 |
| 9 AGENTS.md wins | complete 062f172 |
| 10 Installer completeness | complete + audit-skills |

Branch: feat/enterprise-agent-agnostic
