# SDD ledger — plan: docs/plans/ten-improvements.md

Pre-flight:

| Task | Produces | Consumes | Finding |
| --- | --- | --- | --- |
| 1,3,6,9,10 | AGENTS.md, adapters, installer | none | Drafted on this branch; smoke green |
| 2 | code-review skill + script | skills/ | Independent of tests |
| 4 | skill audit + catalog | skills/, plugin/ | Overlaps 2 on skills/ — same worktree |
| 5 | playwright pages/specs/config | AGENTS.md locator policy | Independent file tree |
| 7 | .github/workflows | none | Independent |
| 8 | package.json, leftover docs | README already updated | Light overlap with README — avoid README unless needed |

Ruling: pair 2+4 in one implementer (shared `skills/`). 5, 7, 8 are parallel worktrees.

Task 1/3/6/9/10: in progress (commit pending)
