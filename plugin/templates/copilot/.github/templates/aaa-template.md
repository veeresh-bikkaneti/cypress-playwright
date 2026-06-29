# AAA Test Template (Arrange-Act-Assert)

## Description
Use this template for writing tests in **Arrange-Act-Assert** format, emphasizing clear test structure and separation of concerns.

## Template Structure

```typescript
import { test, expect } from '@playwright/test';
import { [Feature]Page } from '../pages/[Feature]Page';

test.describe('[Feature Name]', () => {
  test('[test description]', async ({ page }) => {
    // Arrange: Set up test data and initial state
    
    // Act: Perform the action being tested
    
    // Assert: Verify the expected outcome
  });
});
```

## Full Example

```typescript
// playwright/e2e/user-profile.spec.ts
import { test, expect } from '@playwright/test';
import { ProfilePage } from '../pages/ProfilePage';
import { TestDataFactory } from '../helpers/testDataFactory';

test.describe('User Profile Management', () => {
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await profilePage.loginAsUser('user@example.com', 'password123');
    await profilePage.goto();
  });

  test('user can update their profile information', async ({ page }) => {
    // Arrange
    const updatedProfile = {
      name: 'Jane Smith',
      bio: 'Software Engineer passionate about testing',
      location: 'San Francisco, CA'
    };

    // Act
    await profilePage.editProfile();
    await profilePage.fillProfileForm(updatedProfile);
    await profilePage.saveChanges();

    // Assert
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    await expect(profilePage.profileName).toHaveText(updatedProfile.name);
    await expect(profilePage.profileBio).toContainText(updatedProfile.bio);
    await expect(profilePage.profileLocation).toHaveText(updatedProfile.location);
  });

  test('validation error is shown for invalid email format', async ({ page }) => {
    // Arrange
    const invalidEmail = 'not-an-email';

    // Act
    await profilePage.editProfile();
    await profilePage.emailInput.fill(invalidEmail);
    await profilePage.emailInput.blur(); // Trigger validation

    // Assert
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    await expect(profilePage.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(profilePage.saveButton).toBeDisabled();
  });

  test('profile changes are persisted after page reload', async ({ page }) => {
    // Arrange
    const newName = 'Updated Name';
    await profilePage.editProfile();
    await profilePage.nameInput.fill(newName);
    await profilePage.saveChanges();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();

    // Act
    await page.reload();

    // Assert
    await expect(profilePage.profileName).toHaveText(newName);
  });

  test('user can upload a profile picture', async ({ page }) => {
    // Arrange
    const testImage = 'test-data/profile-pic.jpg';

    // Act
    await profilePage.editProfile();
    await profilePage.uploadProfilePicture(testImage);
    await profilePage.saveChanges();

    // Assert
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    await expect(profilePage.profilePicture).toBeVisible();
    await expect(profilePage.profilePicture).toHaveAttribute('src', /profile-pic/);
  });
});
```

## AAA Principles

### 1. Arrange (Setup)
**Purpose**: Prepare everything needed for the test
- Initialize objects
- Set up test data
- Navigate to the page
- Authenticate users
- Mock API responses

**Example**:
```typescript
// Arrange
const user = TestDataFactory.generateUser();
const loginPage = new LoginPage(page);
await loginPage.goto();
```

### 2. Act (Execute)
**Purpose**: Perform the action being tested
- ONE action per test (ideally)
- The behavior you're verifying

**Example**:
```typescript
// Act
await loginPage.login(user.email, user.password);
```

### 3. Assert (Verify)
**Purpose**: Verify the expected outcome
- Check the result of the action
- Verify state changes
- Confirm side effects

**Example**:
```typescript
// Assert
await expect(page).toHaveURL('/dashboard');
await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible();
```

## Best Practices

### ✅ DO

**1. One Logical Action Per Test**
```typescript
test('login with valid credentials', async ({ page }) => {
  // Arrange
  await page.goto('/login');
  
  // Act
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  
  // Assert
  await expect(page).toHaveURL('/dashboard');
});
```

**2. Clear Comments**
Use comments to separate sections, especially in complex tests.

**3. Meaningful Test Data**
```typescript
// Arrange
const validEmail = 'user@example.com';
const invalidEmail = 'not-an-email';
```

**4. Test Isolation**
Each test should be independent and not rely on other tests.

### ❌ DON'T

**1. Multiple Unrelated Actions**
```typescript
// BAD - Testing multiple things
test('user flows', async ({ page }) => {
  await login();
  await createPost();
  await editProfile();
  await logout();
});
```

**2. Assertions in Arrange**
```typescript
// BAD
// Arrange
await page.goto('/login');
await expect(page.getByRole('heading')).toBeVisible(); // This is asserting!
```

**3. Complex Logic in Tests**
Tests should be simple and readable. Move complex logic to page objects or helpers.

## Requirements Traceability

Link tests to requirements:

```typescript
/**
 * @requirement USER-PROFILE-001: Users must be able to update profile information
 * @acceptance-criteria
 *   - AC-1: User can edit name, bio, and location
 *   - AC-2: Changes are persisted in database
 *   - AC-3: Success message is shown after save
 * @unstated-requirements
 *   - A11Y-001: Form must be keyboard accessible
 *   - SEC-001: Profile data must be sanitized (XSS prevention)
 *   - PERF-001: Profile update must complete within 2 seconds
 */
test.describe('User Profile Management', () => {
  // Tests here
});
```

## When to Use AAA

Use AAA templates when:
- Writing unit-style or component tests
- Testing specific functions or behaviors
- Need clear, structured tests
- Working with developers more than business stakeholders

## CypressAAA Example

For Cypress users:

```typescript
describe('Shopping Cart', () => {
  it('adds item to cart', () => {
    // Arrange
    cy.visit('/products');
    const productName = 'Wireless Headphones';

    // Act
    cy.contains(productName).parents('.product-card').find('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-icon"]').click();

    // Assert
    cy.get('[data-testid="cart-items"]').should('contain', productName);
    cy.get('[data-testid="cart-count"]').should('have.text', '1');
  });
});
```

## Advanced Pattern: Multiple Assertions in Groups

```typescript
test('registration form validation', async ({ page }) => {
  // Arrange
  await page.goto('/register');

  // Act - Submit empty form
  await page.getBy Role('button', { name: 'Register' }).click();

  // Assert - All validation errors shown
  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Password is required')).toBeVisible();

  // Act - Fill name only
  await page.getByLabel('Name').fill('John Doe');
  await page.getByRole('button', { name: 'Register' }).click();

  // Assert - Name error gone, others remain
  await expect(page.getByText('Name is required')).not.toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Password is required')).toBeVisible();
});
```

## Testing Exceptions

For error scenarios, AAA is still clear:

```typescript
test('handles network error gracefully', async ({ page }) => {
  // Arrange
  await page.route('**/api/users', route => route.abort('failed'));
  await page.goto('/users');

  // Act
  await page.getByRole('button', { name: 'Load Users' }).click();

  // Assert
  await expect(page.getByText('Failed to load users. Please try again.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});
```
