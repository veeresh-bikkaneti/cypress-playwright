# Requirements Traceability Matrix

## Purpose
This template ensures every test is linked to specific requirements, acceptance criteria, and unstated needs (accessibility, security, performance).

## Template for Test Files

Add this comment block at the top of your test describe block:

```typescript
/**
 * @feature [FEATURE-ID]: [Feature Name]
 * @user-story [USER-STORY-ID]: As a [role] I want to [action] so that [benefit]
 * 
 * @acceptance-criteria
 *   - AC-1: [First acceptance criterion]
 *   - AC-2: [Second acceptance criterion]
 *   - AC-3: [Third acceptance criterion]
 * 
 * @unstated-requirements
 *   - A11Y-001: [Accessibility requirement]
 *   - SEC-001: [Security requirement]
 *   - PERF-001: [Performance requirement]
 *   - UX-001: [Usability requirement]
 * 
 * @test-coverage
 *   - Happy path: [Test names]
 *   - Error scenarios: [Test names]
 *   - Edge cases: [Test names]
 *   - Accessibility: [Test names]
 *   - Security: [Test names]
 */
```

## Full Example

```typescript
/**
 * @feature AUTH-001: User Authentication
 * @user-story US-042: As a registered user I want to log in securely so that I can access my account
 * 
 * @acceptance-criteria
 *   - AC-1: User can log in with valid email and password
 *   - AC-2: User is redirected to dashboard after successful login
 *   - AC-3: Error message is shown for invalid credentials
 *   - AC-4: User remains logged in across sessions (remember me)
 * 
 * @unstated- requirements
 *   - A11Y-001: Login form must be keyboard accessible (tab navigation)
 *   - A11Y-002: Screen reader must announce errors clearly
 *   - SEC-001: Password must be masked in UI
 *   - SEC-002: Login attempts must be rate-limited (prevent brute force)
 *   - SEC-003: Invalid login must not reveal if email exists
 *   - PERF-001: Login API response time must be < 500ms
 *   - PERF-002: Dashboard must load within 2 seconds after login
 *   - UX-001: Clear error messages for different failure scenarios
 *   - UX-002: "Forgot password" link must be visible
 * 
 * @test-coverage
 *   - Happy path: "logs in successfully with valid credentials"
 *   - Error scenarios: "shows error for invalid email", "shows error for wrong password", "shows error for empty fields"
 *   - Edge cases: "handles special characters in password", "handles long email addresses"
 *   - Accessibility: "supports keyboard navigation", "announces errors to screen readers"
 *   - Security: "masks password input", "prevents SQL injection", "rate limits login attempts"
 *   - Performance: "login completes within 500ms"
 */
test.describe('User Authentication', () => {
  test('logs in successfully with valid credentials', async ({ page }) => {
    // Test implementation
  });

  test('shows error for invalid email', async ({ page }) => {
    // Test implementation
  });

  // ... more tests
});
```

## Traceability Matrix Spreadsheet

Create a spreadsheet (Excel/Google Sheets) to track coverage:

| Requirement ID | Requirement Description | Acceptance Criteria | Test File | Test Name | Status | Last Run |
|----------------|------------------------|---------------------|-----------|-----------|--------|----------|
| AUTH-001 | User Authentication | AC-1: Valid login | `login.spec.ts` | "logs in successfully" | ✅ Pass | 2026-02-13 |
| AUTH-001 | User Authentication | AC-2: Dashboard redirect | `login.spec.ts` | "logs in successfully" | ✅ Pass | 2026-02-13 |
| AUTH-001 | User Authentication | AC-3: Error for invalid | `login.spec.ts` | "shows error for invalid email" | ✅ Pass | 2026-02-13 |
| AUTH-001 | User Authentication | SEC-001: Password masked | `login.spec.ts` | "masks password input" | ✅ Pass | 2026-02-13 |
| AUTH-001 | User Authentication | A11Y-001: Keyboard access | `login.spec.ts` | "supports keyboard navigation" | ✅ Pass | 2026-02-13 |

## Automated Traceability Extraction

Use a script to extract traceability automatically from test files:

```javascript
// scripts/extract-traceability.js
const fs = require('fs');
const path = require('path');

function extractTraceability(testFile) {
  const content = fs.readFileSync(testFile, 'utf-8');
  const commentBlock = content.match(/\/\*\*([\s\S]*?)\*\//);
  
  if (!commentBlock) return null;

  const lines = commentBlock[1].split('\n');
  const traceability = {
    feature: null,
    userStory: null,
    acceptanceCriteria: [],
    unstatedRequirements: [],
    testCoverage: []
  };

  let currentSection = null;

  lines.forEach(line => {
    line = line.trim().replace(/^\* /, '');
    
    if (line.startsWith('@feature')) {
      traceability.feature = line.replace('@feature ', '');
    } else if (line.startsWith('@user-story')) {
      traceability.userStory = line.replace('@user-story ', '');
    } else if (line.startsWith('@acceptance-criteria')) {
      currentSection = 'ac';
    } else if (line.startsWith('@unstated-requirements')) {
      currentSection = 'unstated';
    } else if (line.startsWith('@test-coverage')) {
      currentSection = 'coverage';
    } else if (line.startsWith('- ')) {
      const item = line.replace('- ', '');
      if (currentSection === 'ac') {
        traceability.acceptanceCriteria.push(item);
      } else if (currentSection === 'unstated') {
        traceability.unstatedRequirements.push(item);
      } else if (currentSection === 'coverage') {
        traceability.testCoverage.push(item);
      }
    }
  });

  return traceability;
}

// Usage
const testFiles = fs.readdirSync('playwright/e2e');
testFiles.forEach(file => {
  const traceability = extractTraceability(path.join('playwright/e2e', file));
  console.log(JSON.stringify(traceability, null, 2));
});
```

## Linking to Project Management Tools

### Jira Integration Example

```typescript
/**
 * @jira-ticket AUTH-42
 * @jira-epic EPIC-12: Authentication System
 * @feature AUTH-001: User Login
 * ...
 */
```

### GitHub Issues Integration

```typescript
/**
 * @github-issue #123
 * @feature AUTH-001: User Login
 * ...
 */
```

## Coverage Report Generation

Generate an HTML report showing requirement→test mapping:

```bash
# Run custom script to generate traceability report
node scripts/generate-traceability-report.js

# Output: traceability-report.html
```

Sample report structure:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Requirements Traceability Report</title>
</head>
<body>
  <h1>Requirements Coverage</h1>
  
  <div class="feature">
    <h2>AUTH-001: User Authentication</h2>
    <p>User Story: As a registered user I want to log in securely...</p>
    
    <h3>Acceptance Criteria Coverage</h3>
    <table>
      <tr><th>AC</th><th>Test</th><th>Status</th></tr>
      <tr><td>AC-1: Valid login</td><td>login.spec.ts: "logs in successfully"</td><td>✅</td></tr>
      <tr><td>AC-2: Dashboard redirect</td><td>login.spec.ts: "logs in successfully"</td><td>✅</td></tr>
    </table>
    
    <h3>Unstated Requirements Coverage</h3>
    <table>
      <tr><th>Requirement</th><th>Test</th><th>Status</th></tr>
      <tr><td>A11Y-001: Keyboard access</td><td>login.spec.ts: "supports keyboard navigation"</td><td>✅</td></tr>
      <tr><td>SEC-001: Password masked</td><td>login.spec.ts: "masks password input"</td><td>✅</td></tr>
    </table>
  </div>
</body>
</html>
```

## Best Practices

1. **Update Before Implementation**: Write traceability comments before writing tests
2. **Keep IDs Consistent**: Use the same IDs as your project management tool
3. **Be Specific**: Link each test to specific acceptance criteria
4. **Include Unstated**: Always document accessibility, security, performance needs
5. **Review Regularly**: Audit coverage during sprint planning
6. **Automate Extraction**: Use scripts to generate reports automatically

## Benefits

- ✅ **Complete Coverage**: Ensure no requirements are missed
- ✅ **Easy Auditing**: Quickly see which requirements have test coverage
- ✅ **Regression Prevention**: Know which tests to update when requirements change
- ✅ **Compliance**: Satisfy audit requirements for regulated industries
- ✅ **Documentation**: Tests serve as living documentation of requirements
