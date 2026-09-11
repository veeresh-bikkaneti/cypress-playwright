## Why

<!-- One paragraph. Link the issue if there is one. -->

## What

<!-- Bullet the user-visible change. -->

## Merge

- [ ] **Feature / SDD work:** maintainer will use **Create a merge commit**. Do **not** squash. See [CONTRIBUTING.md](../CONTRIBUTING.md).
- [ ] **Dependabot / single-commit chore:** squash is OK.

## Checks

- [ ] `npx tsc --noEmit`
- [ ] `npx playwright test --project=chromium` (or the files this PR touches)
- [ ] `cd plugin && npm test` if `plugin/` or `skills/` changed
- [ ] Isolated review (`skills/code-review`) in a **new** session

## Diagrams / docs

- [ ] Workflow change? Update [docs/WORKFLOW.md](../docs/WORKFLOW.md) and [docs/architecture.html](../docs/architecture.html)
