---
name: playwright-testing
description: Write or heal Playwright Test TypeScript specs using Page Objects, semantic locators, fixtures, and storageState. Use when creating new Playwright tests, fixing failures, or replacing Cypress-shaped Playwright.
license: MIT
---

# Playwright testing

Follow root `AGENTS.md`.

## Write

1. Prefer an existing Page Object in `playwright/pages/`. Create one if the page has 3+ interactions.
2. Use `getByRole` / `getByLabel` first. `getByTestId` is a fallback, not the default. Prefer `page.getByTestId('x')` over `locator('[data-testid="x"]')`.
3. Auth: setup project writes `playwright/.auth/user.json`; authenticated specs `test.use({ storageState: AUTH_STATE })`. Login specs use `{ cookies: [], origins: [] }`. Persist tokens in **localStorage or cookies** — Playwright does not restore `sessionStorage` (check Remember me if the app uses it).
4. Structure tests AAA. One behavior per `test()`. Isolate state.
5. Assert with web-first `expect(locator)`. Every click that changes the UI needs an assertion.

## Heal

1. Read the failure (error, trace, screenshot). Do not guess.
2. Confirm the app still exposes the control (role/name/label). Update the locator to a user-facing one when the DOM changed.
3. If it is a race, wait on the condition (`toBeVisible`, `waitForResponse`) — never a sleep.
4. Re-run the single spec, then a broader `chromium` pass if the Page Object changed.

## Config reminders

- `playwright.config.ts` starts `app-under-test` via `webServer`.
- `baseURL` is `http://127.0.0.1:3000`. Do not mix `localhost` and `127.0.0.1` in cookies.
- Traces on first retry. Do not commit `debug.spec.ts`.

## After changes

Load `skills/code-review` before merge. Reviewer is a separate pass with a git range — do not self-review in the same context.
