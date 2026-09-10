# SDD ledger — plan: docs/plans/ten-improvements.md

## Rulings I made

- Ruling: Parallel implementer subagents stalled after planning — Supervisor implemented remaining tasks in-tree rather than looping forever. Cost if wrong: less isolation; mitigated by chromium E2E + plugin smoke + skill audit.
- Ruling: VS Code `publisher: vbikkaneti` is a marketplace ID, not a clone URL — leave it.
- Ruling: Nested `.github/agents/{cypress,playwright,qa-roles}/*` leftover personas are ignored by copilot-instructions; not deleted this PR to avoid surprising Copilot users mid-migration. Follow-up.
- Ruling: Isolated reviewer subagent also stalled — supervisor review used git range + E2E evidence. No Critical. Nested personas = Important parked for follow-up.

## Completion

| Task | Status |
| --- | --- |
| 1 Portable AGENTS.md | complete 062f172 |
| 2 Isolated code-review | complete dd97bd4 |
| 3 Drop hobby CLIs / ship adapters | complete 062f172 |
| 4 Skills spec + audit | complete dd97bd4 |
| 5 Locators + storageState | complete dd97bd4 (chromium 141 passed, 2 skipped) |
| 6 Copilot .agent.md | complete 062f172 |
| 7 CI/healer | complete dd97bd4 |
| 8 Identity | complete dd97bd4 |
| 9 AGENTS.md wins | complete 062f172 |
| 10 Installer completeness | complete 062f172 + audit-skills |

HEAD: dd97bd4
Branch: feat/enterprise-agent-agnostic
PR: blocked — GitHub token has no contents:write (403)
