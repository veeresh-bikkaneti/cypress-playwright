# Third-party skills

This folder vendors two upstream Agent Skills so maintainers of this repo can draw architecture diagrams and mint new playbooks without extra clones.

They are **not** part of the npm package `cypress2playwright-using-ai`.

| Skill | Upstream | License | Local path |
| --- | --- | --- | --- |
| architecture-diagram | [konraddzbik/architecture-diagram-skill](https://github.com/konraddzbik/architecture-diagram-skill) | MIT — [architecture-diagram/LICENSE](./architecture-diagram/LICENSE) | `skills/architecture-diagram/` |
| skill-creator | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator) | Apache-2.0 — [skill-creator/LICENSE.txt](./skill-creator/LICENSE.txt) | `skills/skill-creator/` |

The four consumer skills (`cypress-to-playwright-migration`, `playwright-testing`, `code-review`, `webapp-testing`) are original to this project (MIT via `plugin/`).
