# Contributing

## Merge policy — do **not** squash feature work

**Use a merge commit** (`Create a merge commit` on GitHub) for `feat/*` PRs, especially [PR #49](https://github.com/veeresh-bikkaneti/cypress-playwright/pull/49).

Do **not** click **Squash and merge** on the enterprise-agent work.

### Why squash is wrong here

Squash flattens several intentional commits into one blob. This branch is an SDD ledger, not a messy WIP dump:

| Commit | What you lose if squashed |
| --- | --- |
| `cff95cc` enterprise-agnostic agents | Why Copilot is an adapter, not the core |
| `af41d31` portable `AGENTS.md` | The contract vs vendor-file split |
| `0f7f8f2` remaining improvements | Skill audit, hybrid CI, identity |
| `92d7171` SDD ledger | Rulings (dead personas, isolated review) |
| `210aec5` storageState + Remember me | Why Playwright cannot restore `sessionStorage` |

After a squash:

- `git blame` on `playwright/e2e/auth.setup.ts` points at one “feat: toolkit” line instead of the Remember-me fix.
- `git log --follow` cannot explain *why* nested Copilot personas were deleted.
- Reviewers cannot bisect “adapters” vs “storageState wiring”.

Dependabot / CVE bumps **may** squash. That is fine — those PRs are one logical change.

```text
feat/*  →  Create a merge commit
fix/*   →  merge commit preferred; squash OK if the branch is one commit
chore(deps) Dependabot → squash OK
```

GitHub UI: on the PR, open the merge dropdown → **Create a merge commit**. Do not leave the repo default on “Allow squash merging” only; keep merge commits enabled.

## Docs you should read first

| Doc | When |
| --- | --- |
| [docs/README.md](./docs/README.md) | Map of all documentation |
| [docs/SETUP.md](./docs/SETUP.md) | Install + migrate |
| [docs/INVENTORY.md](./docs/INVENTORY.md) | What lives in this repo |
| [docs/WORKFLOW.md](./docs/WORKFLOW.md) | Diagrams of every flow |
| [docs/architecture.html](./docs/architecture.html) | Click-through architecture |
| [docs/demo/](./docs/demo/) | Screen recording of setup + use |

## Local checks before you push

```bash
npx tsc --noEmit
npx playwright test --project=chromium
cd plugin && npm test    # list + smoke-setup + audit-skills
```

Isolated review: new chat, `skills/code-review`, git range, not the session that wrote the diff.
