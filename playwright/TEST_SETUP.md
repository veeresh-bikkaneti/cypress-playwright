# Playwright Test Setup Guide

## ✅ Issue Resolved

The Playwright tests were failing because the test server wasn't running. I've fixed this by adding automatic server startup to the Playwright configuration.

---

## 🔧 What Was Fixed

### Updated: `playwright.config.ts`

Added `webServer` configuration to automatically start the test app:

```typescript
webServer: {
  command: 'cd app-under-test && npm run dev',
  url: 'http://127.0.0.1:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
},
```

**What this does**:
- ✅ Automatically starts `app-under-test/server.js` before running tests
- ✅ Waits for server to be ready at http://127.0.0.1:3000
- ✅ Reuses existing server if already running (saves time)
- ✅ Shuts down server after tests complete

---

## 🚀 How to Run Tests Now

### Option 1: Automatic Server (Recommended)

```bash
# From project root
npx playwright test

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# Run with UI mode
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed
```

Playwright will automatically:
1. Start the test server
2. Wait for it to be ready
3. Run tests
4. Shut down server

### Option 2: Manual Server (For Development)

Terminal 1 - Start server:
```bash
cd app-under-test
npm run dev
```

Terminal 2 - Run tests:
```bash
npx playwright test
```

---

## ✅ Verify Setup

Run the migrated tests:

```bash
# Test login functionality (6 tests)
npx playwright test e2e/auth/login.spec.ts

# Test form interactions (30+ tests)
npx playwright test e2e/forms/form-interactions.spec.ts

# Run all migrated tests
npx playwright test e2e/
```

---

## 🐛 Troubleshooting

### "Error: Port 3000 is already in use"

**Solution**: Kill existing process on port 3000:

```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess

# Kill it (replace <PID> with the process ID)
Stop-Process -Id <PID> -Force
```

### "Cannot navigate to invalid URL"

**Causes**:
1. Server didn't start in time → Increase `timeout` in `webServer` config
2. Server crashed → Check `app-under-test/server.js` for errors
3. Port conflict → Change port in both `server.js` and `playwright.config.ts`

**Quick fix**: Start server manually first:
```bash
cd app-under-test && npm run dev
```

### Tests still failing after server starts

Check if `app-under-test/node_modules` exists:

```bash
cd app-under-test
npm install
cd ..
npx playwright test
```

---

## 📊 Expected Test Results

### Login Tests (`e2e/auth/login.spec.ts`)

✅ 6 tests should pass:
- login with valid credentials
- login with valid credentials read data from fixture
- login with invalid email credentials
- login with invalid password credentials  
- login with wrong email format
- should show password error for short password

### Form Tests (`e2e/forms/form-interactions.spec.ts`)

✅ 33 tests should pass covering:
- Text input (type, fill, special chars)
- Clear operations
- Dropdown selection (by value, text, index, multiple)
- Checkboxes and radios
- Focus/blur management
- Number and range inputs
- Date/time inputs
- Form submission

---

## 🔄 Next Steps

1. ✅ **Verify tests pass**: Run the commands above
2. **Migrate remaining files**: Apply same patterns to other 13 test files
3. **Update CI/CD**: The `webServer` config works in CI automatically
4. **Review reports**: Check `test-output/playwright-output/report/`

---

## 📝 CI/CD Note

In CI (`process.env.CI === true`):
- `webServer.reuseExistingServer` is `false` (always fresh server)
- Server shuts down immediately after tests
- Test retries are enabled (`retries: 2`)
- Parallel workers are limited (`workers: 1`)

This ensures clean, isolated test runs in CI environments.
