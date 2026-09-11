# Skills

Agent Skills ([spec](https://agentskills.io/specification)) that coding agents load on demand.

## Consumer skills (installed by `npx cypress2playwright-setup`)

These four are the product. They are mirrored into `plugin/templates/_shared/skills/`.

| Folder | Trigger |
| --- | --- |
| [cypress-to-playwright-migration](./cypress-to-playwright-migration/SKILL.md) | Convert a Cypress spec or custom command |
| [playwright-testing](./playwright-testing/SKILL.md) | Write or heal Playwright tests |
| [code-review](./code-review/SKILL.md) | Isolated review with a git range |
| [webapp-testing](./webapp-testing/SKILL.md) | Plan E2E coverage |

## Repo-only skills (not published)

Used to maintain **this** GitHub repository. The installer must not copy them into a consumer app (`plugin/scripts/audit-skills.js` enforces that).

| Folder | Upstream | Trigger |
| --- | --- | --- |
| [architecture-diagram](./architecture-diagram/SKILL.md) | [konraddzbik/architecture-diagram-skill](https://github.com/konraddzbik/architecture-diagram-skill) v1.3.0 | Interactive HTML architecture diagrams |
| [skill-creator](./skill-creator/SKILL.md) | [anthropics/skills · skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) | Create, eval, and package new skills |

Licenses: [THIRD_PARTY.md](./THIRD_PARTY.md).

### How we used architecture-diagram here

`docs/architecture.html` + `docs/architecture.md` were generated from `skills/architecture-diagram` (template + this repo's flows: Setup, Migrate, Auth, Review, Hybrid CI; modes Consumer vs Demo repo). To regenerate:

> Using `skills/architecture-diagram`, rebuild `docs/architecture.html` and `docs/architecture.md` for Cypress2Playwright. Flows: setup, migrate a spec, auth→storageState, isolated review, hybrid CI. Modes: Consumer (`npx setup`) vs Demo repo.

### How we used skill-creator here

Use it when adding a **new** consumer playbook (for example an `intercept-to-route` specialist). Do not rewrite the four canonical skills in-place without evals.

> Using `skills/skill-creator`, draft a skill for X. Follow the interview → SKILL.md → evals loop.
