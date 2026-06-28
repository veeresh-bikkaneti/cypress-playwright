# Cypress Test Creation

**Slash Command**: `/cypress-create`

## Description
Generate comprehensive Cypress tests following BDD or AAA patterns with support for Cypress 10.x - 15.x. Automatically infers unstated requirements (accessibility, security, performance).

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
});
```

## Configuration

**Supported Cypress Versions**: 10.x - 15.x

**Test Patterns**:
- BDD (Given-When-Then)
- AAA (Arrange-Act-Assert)

**Automatic Inclusions**:
- ✅ Accessibility tests (keyboard nav, ARIA labels)
- ✅ Security tests (XSS prevention, input validation)
- ✅ Performance checks (page load, API response times)
- ✅ Edge cases (empty states, boundary values)

## Invocation Methods

1. **Slash Command**: `/cypress-create login functionality`
2. **Agent Mention**: `@qa-orchestrator create Cypress tests for login`
3. **Natural Language**: "Generate Cypress tests for the shopping cart"

## Output Files

- `cypress/e2e/[feature].cy.ts` - Main test file
- `cypress/support/commands.ts` - Custom commands (if needed)
- Test data fixtures (if applicable)
