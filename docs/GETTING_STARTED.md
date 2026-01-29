# Getting Started with Cypress

**Quick setup guide + command reference**

---

## Part 1: First Time Setup (10 minutes)

### Prerequisites

- **Node.js** ≥18.0.0 - [Download](https://nodejs.org) (choose LTS)
- **npm** ≥9.0.0 (comes with Node.js)
- **Git** (optional) - [Download](https://git-scm.com)
- **Java** (optional, for Allure reports) - [Download](https://www.java.com)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/vbikkaneti/cypress-playwright
cd cypress-playwright

# 2. Navigate to Cypress project
cd cypress/cypressAllure

# 3. Install dependencies
npm install

# 4. Verify Cypress installation
npx cypress verify
```

### Start Test Application

```bash
# Open NEW terminal window
cd cypress/test-app
npm install
npm run dev

# Should see: "Server running at http://localhost:3000"
# Leave this terminal running!
```

---

## Part 2: Run Your First Test

### Interactive Mode (See Tests Run)

```bash
# In original terminal
npm run cy:open

# Cypress UI will open
# 1. Click "E2E Testing"
# 2. Choose browser (Chrome)
# 3. Click on "smoke.test.ts"
# Watch the test run automatically! ✅
```

### Headless Mode (No UI)

```bash
# Run all tests
npm run cy:run

# Run specific test
npx cypress run --spec "cypress/e2e/tests/smoke.test.ts"

# Run in parallel (faster)
npm run cy:run:parallel
```

### View Test Report

```bash
npm run report
# Opens Allure report in browser
```

---

## Part 3: Quick Reference

### Essential Commands

| Command | What It Does |
|---------|--------------|
| `npm run cy:open` | Open Cypress interactive UI |
| `npm run cy:run` | Run all tests headless |
| `npm run cy:run:parallel` | Run tests in parallel (faster) |
| `npm run cy:run:docker` | Run in Docker container |
| `npm run report` | Generate Allure report |
| `npm run validate` | Run linting + type check |

### Common Cypress Commands

```typescript
// Navigation
cy.visit('/login')                          // Go to page

// Find elements
cy.get('[data-testid="submit-btn"]')        // Find by test ID
cy.contains('Submit')                       // Find by text

// Click
cy.get('[data-testid="login-btn"]').click() // Click button

// Type
cy.get('[data-testid="email"]').type('test@example.com')
cy.get('[data-testid="password"]').type('password123')

// Check text
cy.get('[data-testid="message"]').should('contain', 'Success')
cy.get('[data-testid="message"]').should('be.visible')

// Wait for API
cy.intercept('GET', '/api/users').as('getUsers')
cy.wait('@getUsers')

// URL checks
cy.url().should('include', '/dashboard')
```

### Test File Structure

```typescript
describe('Feature Name', () => {
  
  beforeEach(() => {
    cy.visit('/');  // Runs before each test
  });
  
  it('should do something', () => {
    cy.get('[data-testid="button"]').click();
    cy.get('[data-testid="result"]').should('be.visible');
  });
  
  it('should do something else', () => {
    // Another test
  });
});
```

### Running Specific Tests

```bash
# Single file
npx cypress run --spec "cypress/e2e/tests/api.test.ts"

# Pattern
npx cypress run --spec "cypress/e2e/tests/**/api*.ts"

# Specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox

# With custom config
npx cypress run --config viewportWidth=1920,viewportHeight=1080
```

---

## Part 4: Project Structure

```
cypress-playwright/
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   ├── support/
│   └── test-app/
│   ├── cypress.config.ts       # Main configuration
│   ├── package.json            # Dependencies (consolidated)
│   └── reports/                # Test reports
│   ├── e2e/
│   │   ├── tests/                  # 15 test files
│   │   └── pages/                  # Page objects
│   ├── support/
│   │   ├── commands.ts             # Custom commands
│   │   └── e2e.ts                  # Setup hooks
│   ├── fixtures/                   # Test data
│   └── test-app/                   # Express test application
├── docs/                           # Documentation
└── .github/workflows/              # CI/CD
```

---

## Part 5: Environment Configuration

Create `cypress.env.json` (gitignored):

```json
{
  "baseUrl": "http://localhost:3000",
  "apiKey": "your-api-key-here"
}
```

Use in tests:

```typescript
const apiKey = Cypress.env('apiKey');
```

---

## Part 6: Docker Execution

```bash
# Build and run
docker compose up --build

# Run specific test
docker compose run --rm cypress npx cypress run --spec "cypress/e2e/tests/api.test.ts"
```

---

## Part 7: CI/CD

GitHub Actions workflow is already configured in `.github/workflows/ci.yml`:

- Runs on every push/PR
- Executes all tests
- Uploads screenshots/videos on failure
- Generates Allure reports

---

## Troubleshooting

### Port Already in Use

```bash
npx kill-port 3000
npm run dev
```

### Tests Can't Find Elements

1. Is test app running? (`npm run dev`)
2. Check element has correct `data-testid`
3. Wait for page load: `cy.get('[data-testid]', { timeout: 10000 })`

### Module Not Found

```bash
npm install
```

### Cypress Won't Open

```bash
npx cypress verify
npx cypress cache clear
npm install cypress --force
```

---

## Next Steps

1. ✅ Run your first test (smoke.test.ts)
2. ✅ View Allure report
3. 📖 Read [CYPRESS_GUIDE.md](./CYPRESS_GUIDE.md) for:
   - Complete RTM (55 capabilities)
   - Project overview & design
   - Best practices
   - Advanced features

---

**Last Updated**: 2026-01-27  
**Cypress Version**: 15.9.0
