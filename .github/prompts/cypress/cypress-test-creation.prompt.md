# Cypress Test Creation

**Slash Command**: `/cypress-create`

## Description
Generate comprehensive Cypress tests following BDD or AAA patterns with support for Cypress 10.x - 13.x. Automatically infers unstated requirements (accessibility, security, performance).

## Usage

```
/cypress-create [feature description]
```

### Examples

```
/cypress-create login page with email and password
/cypress-create checkout flow with payment validation
/cypress-create user registration with form validation
```

## What This Prompt Does

1. **Analyzes Requirements**: Understands the feature and acceptance criteria
2. **Infers Unstated Needs**: Adds accessibility, security, and performance tests
3. **Generates Test Structure**: Creates BDD or AAA formatted tests
4. **Provides Page Objects**: Generates Cypress custom commands if needed
5. **Includes Edge Cases**: Covers error scenarios and boundary conditions
6. **Validates Execution**: Runs tests to verify complete working system

## Template

When you use this slash command, the agent will generate:

### Cypress E2E Test (Cypress 10.x - 13.x)

```typescript
describe('[Feature Name]', () => {
  beforeEach(() => {
    // Setup (navigate, authenticate, etc.)
  });

  context('Happy Path Scenarios', () => {
    it('[should description]', () => {
      // Arrange
      
      // Act
      
      // Assert
    });
  });

  context('Error Scenarios', () => {
    it('shows validation error for [invalid input]', () => {
      // Test error handling
    });
  });

  context('Accessibility', () => {
    it('supports keyboard navigation', () => {
      // Test keyboard access
    });
  });

  context('Security', () => {
    it('prevents XSS attacks', () => {
      // Test input sanitization
    });
  });
});
```

## Configuration

**Supported Cypress Versions**: 10.x, 11.x, 12.x, 13.x

**Test Patterns**:
- BDD (Given-When-Then)
- AAA (Arrange-Act-Assert)

**Automatic Inclusions**:
- ✅ Accessibility tests (keyboard nav, ARIA labels)
- ✅ Security tests (XSS prevention, input validation)
- ✅ Performance checks (page load, API response times)
- ✅ Edge cases (empty states, boundary values)

## Mandatory Execution Validation ⭐ NEW

**BEFORE COMPLETION**, agent MUST verify the complete working system:

### 1. Configuration Check
- [ ] `cypress.config.ts` exists with correct `baseUrl`
- [ ] Dev server configured or running
- [ ] All dependencies installed
- [ ] Custom commands registered (if created)

### 2. Code Validation
- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] No syntax or linting errors
- [ ] Cypress plugin requirements met

### 3. Execution Proof (MANDATORY)
**Agent must run at least 1 generated test**:
```bash
npx cypress run --spec "cypress/e2e/[generated-file].cy.ts" --headed
```

Verify:
- [ ] Test starts without errors
- [ ] Dev server accessible (if needed)
- [ ] Test executes all steps
- [ ] Test completes (pass or fail for valid reasons)
- [ ] No runtime errors in console

### 4. Completion Report
Agent must provide:
- ✅ Terminal output showing test execution
- ✅ Pass/fail status
- ✅ Any errors encountered and resolutions
- ✅ Confirmation of working configuration

**NEVER mark complete without execution proof.**

## Invocation Methods

1. **Slash Command**: `/cypress-create login functionality`
2. **Agent Mention**: `@qa-orchestrator create Cypress tests for login`
3. **Natural Language**: "Generate Cypress tests for the shopping cart"

## Output Files

The agent will create:
- `cypress/e2e/[feature].cy.ts` - Main test file
- `cypress/support/commands.ts` - Custom commands (if needed)
- Test data fixtures (if applicable)
- Test execution report (proof of working system)
