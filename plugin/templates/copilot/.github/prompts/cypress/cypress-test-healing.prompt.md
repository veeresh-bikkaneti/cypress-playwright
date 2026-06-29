# Cypress Test Healing

**Slash Command**: `/cypress-heal`

## Description
Diagnose and fix broken Cypress tests by analyzing error logs, screenshots, videos, and stack traces. Automatically applies self-healing selector strategies.

## Usage

```
/cypress-heal [test file or description of failure]
```

### Examples

```
/cypress-heal cypress/e2e/login.cy.ts
/cypress-heal "checkout test failing on payment step"
/cypress-heal tests timing out on CI
```

## What This Prompt Does

1. **Analyzes Failure**: Reads error messages, screenshots, videos
2. **Identifies Root Cause**: Selector changes, timing issues, API failures
3. **Proposes Fix**: Updates selectors, adds proper waits, fixes assertions
4. **Verifies Fix**: Runs test to confirm resolution
5. **Prevents Flakiness**: Implements robust waiting strategies

## Common Issues Fixed

| Error Type | Root Cause | Healing Strategy |
|------------|------------|------------------|
| **Timed out retrying** | Element not found | Update selector, check for iframes |
| **Detached from DOM** | Re-render happened | Re-query element, avoid stale references |
| **XHR Failure** | API changed | Update intercept route, fix mock data |
| **Assertion Error** | Expected value changed | Review test data, update assertion |

## Self-Healing Selectors

Auto-upgrades fragile selectors to resilient ones:

**Before** (Fragile):
```typescript
cy.get('.btn-primary').click();
```

**After** (Resilient):
```typescript
cy.getByRole('button', { name: 'Submit' });
// or
cy.get('[data-testid="submit-btn"]').click();
```

## Invocation Methods

1. **Slash Command**: `/cypress-heal login.cy.ts`
2. **Agent Mention**: `@cypress-healer fix the broken checkout test`
3. **Natural Language**: "The Cypress test file auth.cy.ts is failing"

## Required Artifacts

The healer looks for:
- Test failure logs
- `test-output/cypress-output/screenshots/`
- `test-output/cypress-output/videos/`
- Error stack traces

## Output

- Fixed test file with explanatory comments
- Summary of changes made
- Verification results
