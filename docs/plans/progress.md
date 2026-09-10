# SDD ledger — plan: docs/plans/ten-improvements.md

Pre-flight:

| Task | Produces | Consumes | Finding |
| --- | --- | --- | --- |
| 1,3,6,9,10 | AGENTS.md, adapters, installer | none | Committed 062f172 |
| 2 | code-review skill + script | skills/ | Implementing in parent after subagent stall |
| 4 | skill audit + catalog | skills/, plugin/ | Paired with 2 |
| 5 | playwright pages/specs/config | locator policy | Implementing in parent |
| 7 | .github/workflows | none | Implementing in parent |
| 8 | package.json, leftover docs | README | Implementing in parent |

Ruling: parallel subagents stalled after planning. Supervisor implemented remaining tasks in-tree. Isolated review + E2E still required before PR.

Task 1/3/6/9/10: complete (commits 07bd215..062f172)
Task 2/4/5/7/8: in progress
