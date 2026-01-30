# Migration to Playwright

This project is migrating from Cypress to Playwright.

## Running Playwright Tests

To run the new Playwright tests:

```bash
npm run test:pw
```

To run with UI:
```bash
npm run test:pw:ui
```

## Structure

- `tests-pw/`: Contains all Playwright tests and related files.
  - `e2e/`: Test specifications (equivalent to `cypress/e2e`).
  - `pages/`: Page Object Models.
  - `utils/`: Utilities and helper functions.

## Progress

- [x] Login Page
- [x] My Account Page
- [x] Login Tests
- [ ] Other tests...
