# Cypress capability matrix

Source of truth: [Why Cypress](https://docs.cypress.io/app/get-started/why-cypress) (`#Other` = API testing + plugins) plus the Cypress 12 [API table of contents](https://docs.cypress.io/api/table-of-contents).

The AUT (`app-under-test/`) exists so the **Cypress** suite can demonstrate those commands against a real app. Playwright files are 1:1 migrations of those Cypress specs — not a second, independently written suite.

**Case-level pairing** (which `it()` has a twin, which cases are combined, which stay Cypress-only): [PARITY.md](./PARITY.md). This file is the **command** matrix.

## Why Cypress solutions vs this repo

| Why Cypress claim                                                                  | How this repo demos it                                                | Spec                                              |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| E2E testing (`visit` / `get` / `type` / `should`)                                  | Login, smoke, forms                                                   | `login.test.ts`, `smoke.test.ts`, `forms.test.ts` |
| **Other — API testing** (`cy.request('POST', …).its('body').should('contain', …)`) | Canonical snippet against `POST /api/todos`                           | `api.test.ts`                                     |
| **Other — plugins for other test types**                                           | `cypress-real-events` (`realHover`) + `cypress-plugin-api` (`cy.api`) | `actions.test.ts`, `api.test.ts`                  |
| Accessibility (in-spec `alt` / roles; not Cloud)                                   | Logo alt, nav landmark, login `role=alert`                            | `a11y.test.ts`                                    |
| Native access (`stub` / `spy` / empty + 500 / clock)                               | Window dialogs, intercept 500, `cy.clock`                             | `dialogs.test.ts`, `api.test.ts`, `clock.test.ts` |
| Shortcuts (`cy.session` + `cy.origin`)                                             | Session with `validate`; origin on `:3002`                            | `session.test.ts`, `origin.test.ts`               |
| Component testing (`cy.mount`)                                                     | **Excluded** — not this E2E AUT                                       | —                                                 |
| Cypress Cloud / UI Coverage                                                        | **Excluded** — paid products, not commands                            | —                                                 |

## E2E commands (Cypress 12)

| Command                                                                                                | Cypress spec                                                      | Playwright twin                         |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------- |
| `.click()` (default, position, coords, force, modifier, multiple)                                      | `actions.test.ts`                                                 | `actions.spec.ts`                       |
| `.dblclick()`                                                                                          | `actions.test.ts`                                                 | `actions.spec.ts`                       |
| `.rightclick()`                                                                                        | `actions.test.ts`                                                 | `actions.spec.ts`                       |
| `.type()`                                                                                              | `forms.test.ts`, `actions.test.ts`                                | `forms.spec.ts`, `actions.spec.ts`      |
| `.clear()`                                                                                             | `forms.test.ts`                                                   | `forms.spec.ts`                         |
| `.select()`                                                                                            | `forms.test.ts`                                                   | `forms.spec.ts`                         |
| `.check()` / `.uncheck()`                                                                              | `forms.test.ts`                                                   | `forms.spec.ts`                         |
| `.focus()` / `.blur()`                                                                                 | `forms.test.ts`                                                   | `forms.spec.ts`                         |
| `.submit()`                                                                                            | `actions.test.ts`                                                 | `actions.spec.ts`                       |
| `.trigger()` (HTML5 drag-and-drop, range)                                                              | `actions.test.ts`                                                 | `actions.spec.ts`                       |
| `.selectFile()` + drag-drop file                                                                       | `upload.test.ts`                                                  | `upload.spec.ts`                        |
| `.scrollTo()` / `.scrollIntoView()`                                                                    | `browser.test.ts`                                                 | `browser.spec.ts`                       |
| `.viewport()` (dimensions, mobile, tablet, landscape)                                                  | `browser.test.ts` (asserts `#viewport-flag`)                      | `browser.spec.ts`                       |
| `.viewport()` **presets / breakpoint loop / `{ duration }` / `reload(true)`**                          | `browser.test.ts`                                                 | **Cypress-only** — [PARITY.md](./PARITY.md#browser) |
| `.visit()` / `.go()` / `.reload()`                                                                     | `browser.test.ts`                                                 | `browser.spec.ts`                       |
| `.get()` / `.contains()` / `.find()`                                                                   | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.first()` / `.last()` / `.eq()` / `.filter()` / `.not()`                                              | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.children()` / `.parent()` / `.parents()` / `.closest()`                                              | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.next()` / `.prev()` / `.siblings()` / `.nextAll()` / `.prevAll()`                                    | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.nextUntil()` / `.prevUntil()` / `.parentsUntil()`                                                    | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.within()` / `.root()` / `.focused()` / `.hash()`                                                     | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.shadow()`                                                                                            | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| iframe (`its('0.contentDocument')`)                                                                    | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.as()` / `.wrap()` / `.its()` / `.invoke()` / `.each()` / `.then()` / `.spread()`                     | `traversal.test.ts`                                               | `traversal.spec.ts`                     |
| `.should()` / `.and()`                                                                                 | used across specs                                                 | `expect()`                              |
| `.intercept()` / `.request()` / `.wait('@alias')`                                                      | `api.test.ts`                                                     | `api.spec.ts`                           |
| Why Cypress `#Other` `POST /api/todos` + `/api/error/:code`                                            | `api.test.ts`                                                     | `api.spec.ts`                           |
| `cy.api()` (`cypress-plugin-api`)                                                                      | `api.test.ts`                                                     | `api.spec.ts` (`request.post`)          |
| GraphQL request + intercept                                                                            | `graphql.test.ts`                                                 | `graphql.spec.ts`                       |
| `.session()` with `validate` + `cy.login()`                                                            | `session.test.ts`                                                 | `session.spec.ts` + `auth.setup.ts`     |
| `.origin()`                                                                                            | `origin.test.ts`                                                  | `origin.spec.ts`                        |
| `.clock()` / `.tick()`                                                                                 | `clock.test.ts`                                                   | `clock.spec.ts`                         |
| cookies / `getAllCookies` / `clearAllCookies`                                                          | `storage.test.ts`                                                 | `storage.spec.ts`                       |
| `getAllLocalStorage` / `getAllSessionStorage` / `clearAllLocalStorage`                                 | `storage.test.ts`                                                 | `storage.spec.ts`                       |
| alerts / confirm / prompt / stub / spy                                                                 | `dialogs.test.ts`                                                 | `dialogs.spec.ts` (2 sinon-only cases stay Cypress-only — [PARITY.md](./PARITY.md#dialogs)) |
| `.exec()` / `.task()` / `.readFile()` / `.writeFile()` / `.fixture()`                                  | `system.test.ts`                                                  | `system.spec.ts` (AUT grid only; Node I/O is Cypress-only) |
| `.screenshot()` / `Cypress.*` runtime helpers                                                          | `utilities.test.ts`                                               | `utilities.spec.ts` (screenshot + `document.readyState`; rest Cypress-only) |
| `Cypress.Cookies.debug` / `Keyboard.defaults` / `Screenshot.defaults` / `currentTest` / `currentRetry` | `utilities.test.ts`                                               | n/a (Cypress runtime)                   |
| `.debug()` / `.log()`                                                                                  | `debug.test.ts`, `utilities.test.ts`                              | `debug.spec.ts`                         |
| custom commands (`login`, `logout`, `getByTestId`, `interceptAndWait`, `typeAndClear`, `shouldHaveData`, `highlight`, `setAuthCookie`, `fruit`, `api`, overwrite `visit`) | `custom-commands.test.ts` (+ `support/commands.ts`) | `custom-commands.spec.ts` + `playwright/helpers/commands.ts` — see [COMMAND_MAP.md](COMMAND_MAP.md) |
| hover (`cy.realHover`)                                                                                 | `actions.test.ts`                                                 | `actions.spec.ts`                       |
| accessibility (`alt`, `role`, `aria-*`)                                                                | `a11y.test.ts`                                                    | `a11y.spec.ts`                          |
| login / account / smoke / security                                                                     | matching `*.test.ts`                                              | matching `*.spec.ts`                    |

## Intentionally not covered

| API                                                              | Why                                                                                                                                                                        |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cy.mount()`                                                     | Component Testing runner, not this E2E AUT                                                                                                                                 |
| `cy.pause()`                                                     | Interactive only; hangs headless                                                                                                                                           |
| `cy.press()` / `cy.prompt()`                                     | Cypress 15+; this repo pins Cypress 12                                                                                                                                     |
| `Cypress.expose` / `Cypress.require` / `Cypress.ElementSelector` | Newer runtime APIs, not AUT behavior                                                                                                                                       |
| `cy.wait(ms)`                                                    | Valid but an anti-pattern; alias `cy.wait('@…')` is used instead                                                                                                           |
| Cypress Cloud / UI Coverage / Accessibility Cloud                | Paid products, not E2E commands                                                                                                                                            |
| Majority intercept stubbing of UI specs                          | Official “testing your app” guidance prefers stubs; this repo’s contract is a **live kitchen-sink AUT**. Intercepts are demonstrated in `api.test.ts` / `graphql.test.ts`. |

## AUT pages added for this matrix

| Page      | URL                    | What it unlocks                                                                            |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| Actions   | `/actions`             | click variants, dblclick, rightclick, hover, HTML5 drag-and-drop, slider, keyboard, submit |
| DOM       | `/dom`                 | traversal tree including `*Until`, open shadow root, same-origin iframe                    |
| Upload    | `/upload`              | `selectFile`, file drop, download                                                          |
| Home      | `/`                    | viewport-flag, products intercept, logo `alt`                                              |
| Todos API | `POST /api/todos`      | Why Cypress `#Other` canonical `cy.request`                                                |
| Error API | `GET /api/error/:code` | live 400/401/404/500 via `cy.request`                                                      |
