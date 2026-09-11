# Workflow diagrams

Companion to the click-through map: [architecture.html](./architecture.html) (open in a browser, press Play). This page is the GitHub-readable version — same flows, as Mermaid.

Toggle meaning in the HTML:

- **Consumer** — you ran `npx cypress2playwright-setup` inside *your* Cypress repo.
- **Demo repo** — this GitHub repository (dual suites + Express). Not what npm publishes.

---

## 1. Big picture

```mermaid
flowchart LR
  Eng[QA / engineer] -->|prompt| Agent[Copilot / Claude / Grok / …]
  Agent -->|reads| Core[AGENTS.md + skills]
  Eng -->|once| CLI[npx cypress2playwright-setup]
  CLI -->|copies| Core
  Agent -->|rewrites| POM[playwright/pages]
  Agent -->|writes| Spec[playwright/e2e/*.spec.ts]
  Cypress[cypress/e2e] -->|source of truth| Agent
  Spec --> Chromium[npx playwright test]
  Review[skills/code-review<br/>new session] --> Spec
```

---

## 2. Setup (installer)

```mermaid
sequenceDiagram
  actor Eng as Engineer
  participant CLI as setup.js
  participant Core as AGENTS.md + skills/
  participant Adapt as Vendor adapters
  participant Git as git

  Eng->>CLI: npx cypress2playwright-setup setup --tools copilot,claude,cursor
  Note over CLI: file copy only — no network, no AST
  CLI->>Core: write portable core + mirrors<br/>.agents/skills, .github/skills
  CLI->>Adapt: optional .github / CLAUDE.md / .cursor / GEMINI.md
  Eng->>Git: commit playbook
  Eng->>Eng: prompt: migrate cypress/e2e/login.cy.ts
```

Grok, Codex, and OpenCode need **no** extra files. They already read `AGENTS.md`.

---

## 3. Migrate one spec

```mermaid
sequenceDiagram
  actor Eng as Engineer
  participant Agent as Coding agent
  participant Skill as migration skill
  participant Cy as Cypress spec
  participant POM as Page object
  participant PW as Playwright spec
  participant T as tsc + chromium

  Eng->>Agent: migrate cypress/e2e/tests/login.test.ts
  Agent->>Skill: load skills/cypress-to-playwright-migration
  Skill->>Cy: read spec + support/commands + JSON fixtures
  Note over Cy: copy users.json as-is
  Skill->>POM: rewrite cy.* → Page + getByRole / getByLabel
  Skill->>PW: write e2e/*.spec.ts
  PW->>T: npx tsc --noEmit && playwright test that file
  Note over Cy: delete Cypress only after green + isolated review
```

Order of work:

1. Inventory custom commands, `cy.session`, intercepts, fixtures.
2. Auth + 1–2 page objects first (`storageState` setup project).
3. Convert specs that use those POMs — **one file per agent session**.
4. Dual CI until coverage matches.

---

## 4. Auth: `cy.session` → `storageState`

```mermaid
flowchart TB
  subgraph cypress["Cypress"]
    CMD["cy.login / cy.session"]
    UI1["UI login every cache miss"]
  end
  subgraph playwright["Playwright"]
    SETUP["playwright/e2e/auth.setup.ts"]
    FILE[".auth/user.json  gitignored"]
    USE["test.use({ storageState })"]
  end
  CMD -->|no 1:1 API| SETUP
  SETUP -->|check Remember me| FILE
  FILE --> USE
  UI1 -.->|do not copy into beforeEach| USE
```

Playwright restores cookies + `localStorage`. It does **not** restore `sessionStorage`. The demo login must tick **Remember me** or authenticated specs start logged out.

Login-page tests stay unauthenticated (empty storage).

---

## 5. Isolated review

```mermaid
flowchart LR
  A[Authoring agent<br/>wrote the spec] -->|forbidden| R[Review]
  B[New chat / new session] --> Skill[skills/code-review]
  Skill --> Range[git diff BASE...HEAD -- playwright/]
  Range --> V{Critical / Important?}
  V -->|yes| Fix[Authoring agent fixes]
  V -->|no| Merge[Merge commit]
  Fix --> Skill
```

The authoring agent does not review its own diff. Claude: `/review`. Copilot: new chat. Grok: new conversation. Pass a git range.

---

## 6. Hybrid CI (demo repo)

```mermaid
flowchart TB
  Push[git push] --> GHA[hybrid-ci.yml]
  GHA --> SUT[app-under-test :3000]
  SUT --> CY[Cypress job]
  SUT --> PW[Playwright job]
  PW --> Art[playwright-report artifact]
  Art --> Heal[healer listens to Playwright<br/>not Cypress]
```

Jobs are **parallel**. Do not gate Playwright on Cypress. Consumers copy the *job shape*, not this repo's paths, and point `webServer` at *their* app.

---

## 7. Copy vs rewrite

```mermaid
flowchart TD
  Art[Cypress artifact] --> Q{What is it?}
  Q -->|JSON / text fixture| Copy[Copy or import]
  Q -->|Page object with cy.*| RW1[Rewrite with Page + locators]
  Q -->|Cypress.Commands.add| RW2[POM method / fixture / helper — once]
  Q -->|cy.session| SS[setup project + storageState]
  Q -->|cy.intercept + alias| RW3[page.route + waitForResponse started BEFORE the click]
  Q -->|cy.origin| Drop[Drop the wrapper; page.goto the other origin]
  Q -->|App HTML / server| Leave[Not a test artifact]
```

---

## 8. Locator order (contract)

```mermaid
flowchart LR
  R[getByRole] --> L[getByLabel]
  L --> P[getByPlaceholder]
  P --> T[getByText]
  T --> ID[getByTestId]
  ID --> CSS["locator() last"]
```

Never `page.waitForTimeout`. Await every action and assertion. No leftover `cy.*` in `playwright/`.

---

## 9. Skill loading

```mermaid
flowchart TB
  Prompt[User prompt] --> Disc{Does a skill description match?}
  Disc -->|migrate a Cypress spec| M[cypress-to-playwright-migration]
  Disc -->|heal / write Playwright| P[playwright-testing]
  Disc -->|review a range| C[code-review]
  Disc -->|plan coverage| W[webapp-testing]
  Disc -->|draw the system| A[architecture-diagram<br/>this repo only]
  Disc -->|mint a new skill| S[skill-creator<br/>this repo only]
  M --> Core[AGENTS.md still wins]
  P --> Core
  C --> Core
```

---

## 10. Merge — why not squash

```mermaid
gitGraph
  commit id: "main"
  branch feat
  commit id: "agents + adapters"
  commit id: "portable AGENTS.md"
  commit id: "CI / audit / identity"
  commit id: "SDD ledger"
  commit id: "storageState Remember-me"
  checkout main
  merge feat id: "merge commit keeps all five"
```

Squash would hide the Remember-me ruling inside one synthetic commit. See [CONTRIBUTING.md](../CONTRIBUTING.md).
