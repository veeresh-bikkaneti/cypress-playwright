# Cypress Test Healing

Point this at `skills/cypress-to-playwright-migration` (or migrate the spec to Playwright and heal with `skills/playwright-testing`). There is no `@cypress-healer` agent.

## Description

Diagnose and fix broken Cypress tests by analyzing error logs, screenshots, videos, and stack traces. Prefer migrating the spec to Playwright when the suite is mid-migration.

## Usage

```
heal cypress/e2e/tests/login.test.ts using skills/cypress-to-playwright-migration
```

## What This Prompt Does

1. **Analyzes Failure**: Reads error messages, screenshots, videos
2. **Identifies Root Cause**: Selector changes, timing issues, API failures
3. **Proposes Fix**: Updates selectors, adds proper waits, fixes assertions — or converts to Playwright
4. **Verifies Fix**: Runs the spec to confirm resolution
5. **Prevents Flakiness**: Implements robust waiting strategies (no `waitForTimeout`)

## Common Issues Fixed

| Error Type             | Root Cause             | Healing Strategy                         |
| ---------------------- | ---------------------- | ---------------------------------------- |
| **Timed out retrying** | Element not found      | Update selector, check for iframes       |
| **Detached from DOM**  | Re-render happened     | Re-query element, avoid stale references |
| **XHR Failure**        | API changed            | Update intercept route, fix mock data    |
| **Assertion Error**    | Expected value changed | Review test data, update assertion       |

## Self-Healing Selectors

Auto-upgrades fragile selectors to resilient ones.

**Before** (Fragile):

```typescript
cy.get(".btn-primary").click();
```

**After** (Cypress, still in the Cypress tree):

```typescript
cy.contains("button", "Submit").click();
```

**After** (Playwright — preferred):

```typescript
await page.getByRole("button", { name: "Submit" }).click();
```

## Invocation Methods

1. Natural language: "heal `cypress/e2e/tests/login.test.ts` using `skills/cypress-to-playwright-migration`"
2. After migration: "heal `playwright/e2e/login.spec.ts` using `skills/playwright-testing`"
3. Copilot-optional for Playwright only: `@playwright-healer`

## Required Artifacts

The healer looks for:

- Test failure logs
- `test-output/cypress-output/screenshots/`
- `test-output/cypress-output/videos/`
