# Playwright Test Healing

**Slash Command**: `/playwright-heal`

## Description
Diagnose and fix broken Playwright tests by analyzing trace logs, screenshots, and error messages. Automatically applies self-healing selector strategies and fixes timing issues.

## Usage

```
/playwright-heal [test file or description of failure]
```

### Examples

```
/playwright-heal playwright/e2e/login.spec.ts
/playwright-heal "checkout test failing at payment step"
/playwright-heal tests failing in CI but passing locally
```

## What This Prompt Does

1. **Analyzes Failure**: Reads error messages, trace files, screenshots
2. **Identifies Root Cause**: Selector changes, timing issues, network problems
3. **Proposes Fix**: Updates selectors, adds proper waits, fixes assertions
4. **Uses Trace Analysis**: Opens `trace.zip` for debugging insights
5. **Verifies Fix**: Runs test to confirm resolution

## Common Issues Fixed

| Error Type | Root Cause | Healing Strategy |
|------------|------------|------------------|
| **TimeoutError** | Selector changed / Slow network | Update selector, add explicit wait |
| **AssertionError** | Logic changed / Data mismatch | Update expectation, verify test data |
| **TargetClosed** | Browser crash / Navigation issue | Fix unawaited async, add stability |
| **strict mode violation** | Multiple elements match | Make selector more specific |

## Self-Healing Selectors

Auto-upgrades fragile selectors to resilient ones:

**Before** (Fragile):
```typescript
await page.locator('.btn-primary').click();
```

**After** (Resilient):
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
// or
await page.getByTestId('submit-btn').click();
```

## Trace Analysis

Automatically analyzes Playwright trace files:
```bash
npx playwright show-trace test-output/playwright-output/test-results/.../trace.zip
```

Extracts:
- DOM snapshot at failure point
- Network activity
- Console logs
- Screenshots/videos

## Invocation Methods

1. **Slash Command**: `/playwright-heal login.spec.ts`
2. **Agent Mention**: `@playwright-healer fix the broken checkout test`
3. **Natural Language**: "The Playwright test auth.spec.ts is failing"

## Required Artifacts

The healer looks for:
- Test failure logs
- `test-output/playwright-output/test-results/**/trace.zip`
- Screenshots and videos
- Error stack traces

## Output

- Fixed test file with explanatory comments
- Summary of changes made
- Verification results
- Recommendations for preventing similar failures
