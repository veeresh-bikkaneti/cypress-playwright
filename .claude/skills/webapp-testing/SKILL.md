---
name: webapp-testing
description: Plan web E2E coverage for this Express app under test. Use when mapping routes, deciding what to automate, or designing a Playwright suite — not for a single spec (use playwright-testing) and not for Cypress conversion (use cypress-to-playwright-migration).
license: MIT
---

# Web app testing

App under test: `app-under-test/` on port 3000. See `AGENTS.md`.

## What to cover first

1. Auth (login, logout, session)
2. Critical user flows on `/`, `/login`, `/dashboard`, `/forms`, `/dialogs`
3. API contracts used by those flows (`/api/auth/*`, `/api/products`, `/api/orders`)
4. Error paths that users can hit

Do not E2E everything. Prefer a few reliable flows plus API tests via `request`.

## Locator policy (same as AGENTS.md)

`getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > `locator()`.

`data-testid` is a test contract for chrome that has no accessible name — not the default for buttons, links, and labeled inputs.

## Isolation

- Independent tests
- `storageState` for authenticated projects
- No shared mutable `orders` across parallel workers without isolation

## After the plan

Hand off writing to `playwright-testing` and conversion to `cypress-to-playwright-migration`. Review with `code-review`.
