# Plan: real migration proof (no tautological tests)

Staff-SDET bar. `expect(true).toBe(true)` and its cousins (`browserName` truthy, `test.info().title` contains itself, skipped security, always-visible "navigation") are not tests.

Cypress remains the source of truth. Playwright files are 1:1 twins. The plugin does not rewrite AST; this suite is the proof that tests, pages, fixtures, custom methods, and custom commands migrate and still fail when the AUT is wrong.

## Tasks

1. Kill fake / skipped / duplicate tests (utilities twins, duplicate login, screenshot skips).
2. Custom-command catalog: Cypress spec + Playwright helpers + twin spec. Every command hits the AUT.
3. Single fixture source (`users.json` → `test-data.ts`). `auth.fixture.ts` used by login + myAccount twins.
4. AUT: dashboard section switching so `navigateToOrders` can fail; security headers; cookie/httpOnly after real login; XSS echo via `textContent`.
5. Migration parity gate (spec pairing, command map, tautology grep).
6. Chromium E2E + plugin smoke + tsc. Isolated review. Merge to main.

## Rulings

- Ruling: Cypress-only runtime helpers (`Cypress._`, `Cypress.Promise`, `isCy`) stay in Cypress as capability demos. They do **not** get fake Playwright twins. — Cost if wrong: consumers copy lodash arithmetic into production suites.
- Ruling: Kitchen-sink click/traversal specs may use `getByTestId`. POM is required for login/account journeys (3+ interactions).
- Ruling: `setAuthCookie` is proven against `/api/auth/me` (cookie auth), not the dashboard JS gate (localStorage).
- Ruling: Dashboard hash nav must hide/show panels. An always-visible `orders-section` makes `navigateToOrders` a fake test. Session twins use the same hide/show assertion.
- Ruling: Remember me is Cypress source-of-truth (`login.test.ts`) then Playwright twin + `auth.setup.ts` (`rememberMe: true` because storageState does not restore sessionStorage).
- Ruling: Mock-token dashboard visits are not auth tests. Deleted. Dashboard storage specs seed a real `POST /api/auth/login` token.
- Ruling: `X-Frame-Options: SAMEORIGIN` on `/iframe-inner.html` only so the same-origin iframe kitchen-sink can load; `/` still sends `DENY`.
- Ruling: Playwright native dialogs must `page.once("dialog")` before `click()`. `waitForEvent` + awaited click deadlocks on `alert()`.
- Ruling: hybrid-ci `quality-check` runs `cd plugin && npm test` (smoke + skills audit + parity) before E2E. The npm package is the product.
- Ruling: Playwright wrap/spread twins must read fruit names from `/dom`. Literal `expect("Ada")` is `expect(true).toBe(true)`.
- Ruling: GraphQL spy (`cy.intercept` then live POST) is AUT-real and must have a Playwright `waitForRequest`/`waitForResponse` twin. Mocking is not a substitute for the spy case.
- Ruling: Forms keyboard/clear-retype/Germany/focus-blur/arrow and browser scroll-to-top/location/container-scroll are AUT interactions — drop them and the twin is a fake subset.
- Ruling: Dialog `error-btn` throws `"Test error"` after 100ms. Cypress must `cy.on("uncaught:exception")` in the spec; Playwright must swallow only that `pageerror`. A global ignore is too wide.
- Ruling: Demo credentials in Playwright specs come from `test-data.ts` → `users.json`. Literal `test@example.com` in a twin is a second source of truth.
