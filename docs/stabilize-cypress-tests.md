# Implementation Plan: Cypress Test Suite Stabilization

## 📋 Problem Statement
The Cypress test suite is currently experiencing "false positive" passing status in automated checks and is failing with `EINVAL` path-related errors when run manually on Windows. The objective is to achieve a genuine 100% passing rate and verify the health of the entire project.

- **Current Status**: 🔴 Path/Bundling Errors (`EINVAL`) / ⚪ False Positive Automated Checks
- **Target Status**: 🟢 100% Passing Cypress Specs / 🟢 Working Allure Reports

## 🛠️ Proposed Changes

### 1. Fix Cypress Path/Bundling Error
The `EINVAL` error suggests that Cypress is struggling to create bundle directories because it's mixing absolute paths in a way that Windows rejects.
- **Action**: Modify `cypress.config.ts` to ensure paths are handled consistently. Use relative paths or explicitly handle Windows backslashes.
- **Action**: Try running Cypress from the root directory instead of the sub-directory to see if it simplifies path resolution.

### 2. Update Automated Check (`checklist.py`)
- **Action**: Update the `Test Runner` configuration in `checklist.py` to point to the actual Cypress suite in `cypress/cypressAllure` instead of just the root directory.

### 3. Verify All Specs (15 total)
Run and fix each specific test file category:
- UI Components: `browser`, `forms`, `dialogs`, `smoke`, `system`
- Data/State: `api`, `graphql`, `storage`, `session`, `clock`
- Security/Complex: `origin`, `security`, `login`, `myAccount`, `debug`

## 🏁 Verification Plan
1. `npm run cy:run` (from `cypress/cypressAllure`) -> Exit Code 0.
2. `allure:generate` -> Success.
3. Check `test_output.txt` for clean run summary.
