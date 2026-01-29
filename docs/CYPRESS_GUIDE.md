# Cypress Complete Guide

**Technical reference with RTM, project overview, and best practices**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Requirements Traceability Matrix (RTM)](#requirements-traceability-matrix-rtm)
3. [Test Reporters](#test-reporters)
4. [Best Practices](#best-practices)
5. [Advanced Features](#advanced-features)

---

## Project Overview

### About This Project

This is a **Cypress to Playwright migration demonstration** showcasing how to systematically convert TypeScript-based Cypress tests to Playwright while maintaining test coverage and quality.

### Goals & Objectives

1. **Demonstrate Migration Patterns** - Show direct comparisons between Cypress (`cy.*`) and Playwright (`await page.*`) commands
2. **AI-Assisted Refactoring** - Utilize AI agents to convert tests while maintaining robust locator strategies
3. **Validation** - Provide structured approach to verify ported tests maintain same coverage
4. **Production Readiness** - Include CI/CD, code quality, security audits, Docker support

### Project Structure

```
cypress-playwright/
├── cypress/
│   ├── cypress/
│   │   ├── e2e/
│   │   ├── fixtures/
│   │   ├── support/
│   │   └── test-app/
│   │   ├── cypress.config.ts       # Main Cypress configuration
│   │   ├── package.json            # Dependencies & scripts
│   │   ├── reports/                # Generated test reports
│   │   └── run-parallel.js         # Parallel execution script
│   ├── e2e/
│   │   ├── tests/                  # 15 test specification files
│   │   └── pages/                  # Page Object Model classes
│   ├── support/
│   │   ├── commands.ts             # Custom Cypress commands
│   │   └── e2e.ts                  # Global setup & hooks
│   ├── fixtures/                   # Test data (JSON files)
│   └── test-app/                   # Self-contained Express application
│       ├── server.js               # Express server
│       ├── public/                 # HTML, CSS, JS
│       └── package.json            # App dependencies
├── tests/                          # Playwright tests (migration target)
├── docs/                           # Documentation
│   ├── GETTING_STARTED.md          # Setup & quick reference
│   ├── CYPRESS_GUIDE.md            # This file
│   └── QA_REVIEW.md                # QA assessment
├── .github/workflows/              # CI/CD pipelines
│   └── ci.yml                      # GitHub Actions workflow
└── scripts/                        # Utility scripts

```

### Test Application

**Express-based self-contained application** for testing Cypress capabilities:
- **Location**: `cypress/test-app/`
- **Purpose**: Demonstrate all 55 Cypress capabilities
- **Features**: Forms, API endpoints, storage, dialogs, GraphQL, security tests
- **Port**: http://localhost:3000

### Test Suite

**15 test files** covering 55 Cypress capabilities:
- `api.test.ts` - Network & API testing
- `browser.test.ts` - Browser control & navigation
- `forms.test.ts` - Form inputs & validation
- `storage.test.ts` - Cookies & local/session storage
- `dialogs.test.ts` - Alerts, confirms, prompts
- `graphql.test.ts` - GraphQL queries & mutations
- `security.test.ts` - OWASP security checks
- `smoke.test.ts` - Critical path verification
- `login.test.ts` - Authentication flows
- `myAccount.test.ts` - User account features
- Plus 5 more specialized test files

### Design Principles

#### Object-Oriented Design (Page Object Model)

```typescript
// cypress/e2e/pages/LoginPage.ts
export class LoginPage {
  private emailInput = '[data-testid="email"]';
  private passwordInput = '[data-testid="password"]';
  private submitButton = '[data-testid="submit-btn"]';

  visit() {
    cy.visit('/login');
    return this;
  }

  login(email: string, password: string) {
    cy.get(this.emailInput).type(email);
    cy.get(this.passwordInput).type(password);
    cy.get(this.submitButton).click();
    return this;
  }

  verifySuccess() {
    cy.url().should('include', '/dashboard');
    return this;
  }
}

// Usage in tests
it('should login successfully', () => {
  new LoginPage()
    .visit()
    .login('user@example.com', 'password123')
    .verifySuccess();
});
```

#### Loose Coupling

**Separation of concerns** between:
- **Test logic** (`tests/`) - What to test
- **Page objects** (`pages/`) - How to interact with UI
- **Test data** (`fixtures/`) - Data for tests
- **Custom commands** (`support/commands.ts`) - Reusable actions
- **Configuration** (`cypress.config.ts`) - Environment setup

#### SOLID Principles

**Single Responsibility Principle**:
```typescript
// Each page object handles ONE page
class LoginPage { /* Login-specific methods */ }
class DashboardPage { /* Dashboard-specific methods */ }
class ProfilePage { /* Profile-specific methods */ }
```

**Open/Closed Principle**:
```typescript
// Base class for extension
class BasePage {
  visit(url: string) {
    cy.visit(url);
    return this;
  }
  
  waitForLoad() {
    cy.get('[data-testid="loading"]').should('not.exist');
    return this;
  }
}

// Extended without modifying base
class LoginPage extends BasePage {
  login(email: string, password: string) {
    // Login-specific logic
  }
}
```

**Liskov Substitution Principle**:
```typescript
// Any page can be used where BasePage is expected
function navigateAndWait(page: BasePage) {
  page.visit('/').waitForLoad();
}

navigateAndWait(new LoginPage());
navigateAndWait(new DashboardPage()); // Works with any page
```

**Interface Segregation**:
```typescript
// Small, focused interfaces
interface Searchable {
  search(query: string): void;
}

interface Filterable {
  applyFilter(filter: string): void;
}

// Only implement what you need
class ProductPage implements Searchable, Filterable {
  search(query: string) { /* ... */ }
  applyFilter(filter: string) { /* ... */ }
}
```

**Dependency Inversion**:
```typescript
// Depend on abstractions, not implementations
interface ApiClient {
  get(url: string): Cypress.Chainable;
  post(url: string, data: any): Cypress.Chainable;
}

class CypressApiClient implements ApiClient {
  get(url: string) {
    return cy.request('GET', url);
  }
  post(url: string, data: any) {
    return cy.request('POST', url, data);
  }
}

// Tests depend on interface, not concrete class
function testUserApi(client: ApiClient) {
  client.get('/api/users').its('status').should('eq', 200);
}
```

---

## Requirements Traceability Matrix (RTM)

**100% Coverage - All 55 Cypress Capabilities Mapped to Code**

| Capability ID | Cypress Feature | Test File | Test Case | Line # | Status |
|---------------|-----------------|-----------|-----------|--------|--------|
| **CAP-001** | `cy.visit()` - Page Navigation | `api.test.ts` | All tests | 48, 65 | ✅ |
| **CAP-002** | `cy.get()` - Element Selection | `api.test.ts` | should load and display products | 51-52 | ✅ |
| **CAP-003** | `cy.intercept()` - Network Stubbing | `api.test.ts` | Response Stubbing suite | 42-159 | ✅ |
| **CAP-004** | `cy.request()` - Direct API Testing | `api.test.ts` | Direct API Testing suite | 165-300 | ✅ |
| **CAP-005** | `cy.wait()` - Network Waiting | `api.test.ts` | Network Request Waiting suite | 306-344 | ✅ |
| **CAP-006** | `cy.viewport()` - Responsive Testing | `browser.test.ts` | Responsive Testing suite | 38-120 | ✅ |
| **CAP-007** | `cy.scrollTo()` - Scroll Control | `browser.test.ts` | Scroll Control suite | 126-199 | ✅ |
| **CAP-008** | `cy.scrollIntoView()` - Element Scroll | `browser.test.ts` | should scroll element into view | 164-168 | ✅ |
| **CAP-009** | `cy.window()` - Window Access | `browser.test.ts` | Window & Document Access suite | 205-272 | ✅ |
| **CAP-010** | `cy.document()` - Document Access | `browser.test.ts` | should access document object | 238-244 | ✅ |
| **CAP-011** | `cy.title()` - Page Title Assertion | `browser.test.ts` | should assert page title | 283-286 | ✅ |
| **CAP-012** | `cy.url()` - URL Assertion | `browser.test.ts` | should assert URL | 291-294 | ✅ |
| **CAP-013** | `cy.location()` - Location Properties | `browser.test.ts` | should assert location properties | 299-305 | ✅ |
| **CAP-014** | `cy.go()` - Navigation Control | `browser.test.ts` | Navigation Control suite | 335-390 | ✅ |
| **CAP-015** | `cy.reload()` - Page Reload | `browser.test.ts` | should reload the page | 365-377 | ✅ |
| **CAP-016** | `cy.screenshot()` - Screenshots | `browser.test.ts` | Screenshots suite | 396-423 | ✅ |
| **CAP-017** | `cy.clock()` - Time Manipulation | `clock.test.ts` | Time Manipulation suite | 19-65 | ✅ |
| **CAP-018** | `cy.tick()` - Advance Time | `clock.test.ts` | All time tests | 34, 51 | ✅ |
| **CAP-019** | `cy.on('window:alert')` - Alert Dialogs | `dialogs.test.ts` | Alert Dialogs suite | 51-103 | ✅ |
| **CAP-020** | `cy.on('window:confirm')` - Confirm Dialogs | `dialogs.test.ts` | Confirm Dialogs suite | 104-174 | ✅ |
| **CAP-021** | `cy.on('window:prompt')` - Prompt Dialogs | `dialogs.test.ts` | Prompt Dialogs suite | 175-246 | ✅ |
| **CAP-022** | `cy.on('window:before:load')` - Window Events | `dialogs.test.ts` | Window Events suite | 334-379 | ✅ |
| **CAP-023** | `cy.stub()` - Function Stubbing | `dialogs.test.ts` | Popup Windows suite | 380-423 | ✅ |
| **CAP-024** | `cy.type()` - Text Input | `forms.test.ts` | Text Input suite | 50-127 | ✅ |
| **CAP-025** | `cy.clear()` - Clearing Inputs | `forms.test.ts` | Clearing Inputs suite | 128-163 | ✅ |
| **CAP-026** | `cy.select()` - Dropdown Selection | `forms.test.ts` | Dropdown Selection suite | 164-218 | ✅ |
| **CAP-027** | `cy.check()` - Checkbox Check | `forms.test.ts` | Checkboxes suite | 219-265 | ✅ |
| **CAP-028** | `cy.uncheck()` - Checkbox Uncheck | `forms.test.ts` | Checkboxes suite | 219-265 | ✅ |
| **CAP-029** | Radio Button Selection | `forms.test.ts` | Radio Buttons suite | 266-295 | ✅ |
| **CAP-030** | `cy.focus()` - Focus Management | `forms.test.ts` | Focus Management suite | 296-348 | ✅ |
| **CAP-031** | `cy.blur()` - Blur Event | `forms.test.ts` | Focus Management suite | 296-348 | ✅ |
| **CAP-032** | Number & Range Inputs | `forms.test.ts` | Number & Range Inputs suite | 349-390 | ✅ |
| **CAP-033** | Date & Time Inputs | `forms.test.ts` | Date & Time Inputs suite | 391-424 | ✅ |
| **CAP-034** | Form Submission | `forms.test.ts` | Form Submission suite | 425-469 | ✅ |
| **CAP-035** | GraphQL Queries | `graphql.test.ts` | GraphQL Queries suite | 28-162 | ✅ |
| **CAP-036** | GraphQL Mutations | `graphql.test.ts` | GraphQL Mutations suite | 249-345 | ✅ |
| **CAP-037** | GraphQL Intercept | `graphql.test.ts` | Intercepting GraphQL suite | 346-459 | ✅ |
| **CAP-038** | `cy.session()` - Session Caching | `session.test.ts` | Session Testing suite | 18-78 | ✅ |
| **CAP-039** | `cy.getCookie()` - Cookie Retrieval | `storage.test.ts` | Cookie Management suite | 51-153 | ✅ |
| **CAP-040** | `cy.setCookie()` - Cookie Setting | `storage.test.ts` | Cookie Management suite | 51-153 | ✅ |
| **CAP-041** | `cy.clearCookie()` - Cookie Clearing | `storage.test.ts` | Cookie Management suite | 51-153 | ✅ |
| **CAP-042** | `cy.clearCookies()` - Clear All Cookies | `storage.test.ts` | Cookie Management suite | 51-153 | ✅ |
| **CAP-043** | `cy.getAllLocalStorage()` - localStorage Read | `storage.test.ts` | localStorage Management suite | 154-259 | ✅ |
| **CAP-044** | sessionStorage Management | `storage.test.ts` | sessionStorage Management suite | 260-298 | ✅ |
| **CAP-045** | Authentication State Management | `storage.test.ts` | Authentication State suite | 299-357 | ✅ |
| **CAP-046** | Storage Assertions | `storage.test.ts` | Storage Assertions suite | 358-402 | ✅ |
| **CAP-047** | `cy.exec()` - System Commands | `system.test.ts` | System Commands suite | 28-46 | ✅ |
| **CAP-048** | `cy.task()` - Node Tasks | `system.test.ts` | Node Tasks suite | 47-66 | ✅ |
| **CAP-049** | `cy.readFile()` - File Reading | `system.test.ts` | File System suite | 67-104 | ✅ |
| **CAP-050** | `cy.writeFile()` - File Writing | `system.test.ts` | File System suite | 67-104 | ✅ |
| **CAP-051** | `cy.origin()` - Cross-Origin Testing | `origin.test.ts` | Cross-Origin Testing suite | 18-60 | ✅ |
| **CAP-052** | Security Testing (OWASP) | `security.test.ts` | OWASP Security Checks | 1-74 | ✅ |
| **CAP-053** | Smoke Testing | `smoke.test.ts` | Smoke Test suite | 15-79 | ✅ |
| **CAP-054** | Login Functionality | `login.test.ts` | Login Functionality suite | 22-82 | ✅ |
| **CAP-055** | My Account Features | `myAccount.test.ts` | My Account suite | 15-69 | ✅ |

**Coverage Summary**:
- **Total Capabilities**: 55
- **Capabilities Implemented**: 55
- **Coverage**: 100%
- **Test Files**: 15
- **Total Test Cases**: 150+

---

## Test Reporters

### 1. Allure Reporter (Primary)

**Setup**: Pre-configured via `@shelex/cypress-allure-plugin`

```bash
# Run tests and generate report
npm run cy:e2e:run

# Or manually
npm run cy:run
npm run report
```

**Report Location**: `reports/ui/allure-report/`

**Features**:
- Rich dashboards with charts
- Test history & trends
- Screenshots on failure
- Video recordings
- Categorization & suites
- Duration tracking

### 2. Mochawesome Reporter

```bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
```

```typescript
// cypress.config.ts
reporter: 'mochawesome',
reporterOptions: {
  reportDir: 'reports/mochawesome',
  overwrite: false,
  html: true,
  json: true
}
```

### 3. JUnit Reporter (CI/CD)

```bash
npm install --save-dev cypress-multi-reporters mocha-junit-reporter
```

```yaml
# GitHub Actions
- name: Publish Test Results
  uses: EnricoMi/publish-unit-test-result-action@v2
  with:
    junit_files: 'reports/junit/results-*.xml'
```

---

## Best Practices

### Unhappy Path Testing

```typescript
// Network failures
cy.intercept('GET', '/api/products', (req) => {
  req.on('response', (res) => res.setDelay(5000));
});

// Server errors
cy.intercept('POST', '/api/orders', {
  statusCode: 500,
  body: { error: 'Internal Server Error' }
}).as('orderFail');

cy.get('[data-testid="checkout-btn"]').click();
cy.wait('@orderFail');
cy.get('[data-testid="error-message"]').should('be.visible');
```

### Flakiness Prevention

```typescript
// ❌ BAD: Fixed wait
cy.wait(3000);

// ✅ GOOD: Conditional wait
cy.get('[data-testid="result"]', { timeout: 10000 })
  .should('be.visible');

// ✅ BEST: Wait for network
cy.intercept('GET', '/api/data').as('getData');
cy.wait('@getData');
cy.get('[data-testid="result"]').should('be.visible');
```

### Data Isolation

```typescript
// Create unique test data
const uniqueEmail = `test-${Date.now()}@example.com`;

cy.request('POST', '/api/users', {
  email: uniqueEmail,
  password: 'password123'
}).then((response) => {
  const userId = response.body.id;
  
  // Test with this user
  cy.visit(`/profile/${userId}`);
  
  // Cleanup
  cy.request('DELETE', `/api/users/${userId}`);
});
```

### Performance Baselines

| Suite | Expected | Warning | Critical |
|-------|----------|---------|----------|
| Smoke | <2 min | >3 min | >5 min |
| Full Suite | <15 min | >20 min | >30 min |
| Parallel | <5 min | >10 min | >15 min |

---

## Advanced Features

### Video Recording

```typescript
// cypress.config.ts
video: process.env.CI === 'true',
videoCompression: 32,
videoUploadOnPasses: false
```

### Parallel Execution

```bash
npm run cy:run:parallel
```

### Docker Support

```bash
docker compose up --build
```

### CI/CD Integration

GitHub Actions workflow in `.github/workflows/ci.yml`:
- Runs on push/PR
- Executes all tests
- Uploads artifacts
- Generates reports

---

**Last Updated**: 2026-01-27  
**Cypress Version**: 15.9.0  
**Coverage**: 100% (55/55 capabilities)
