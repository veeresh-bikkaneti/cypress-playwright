// File: playwright/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MyAccountPage } from '../pages/MyAccountPage';

/**
 * Authentication Fixture
 * Replaces Cypress cy.login() and cy.logout() custom commands
 * 
 * Usage:
 * import { test, expect } from '../fixtures/auth.fixture';
 * 
 * test('my test', async ({ authenticatedPage }) => {
 *   // Page is already logged in
 * });
 */

type AuthFixtures = {
    /**
     * Page that is already logged in with valid credentials
     */
    authenticatedPage: Page;

    /**
     * Login page helper
     */
    loginPage: LoginPage;

    /**
     * My Account / Dashboard page helper
     */
    myAccountPage: MyAccountPage;
};

export const test = base.extend<AuthFixtures>({
    /**
     * Provides pre-authenticated page
     */
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);

        // Use valid credentials from test data
        await loginPage.login('test@example.com', 'password123');

        // Verify login was successful
        await loginPage.validateSuccessfulLogin();

        // Provide the authenticated page to the test
        await use(page);

        // Cleanup happens automatically
    },

    /**
     * Provides LoginPage instance
     */
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    /**
     * Provides MyAccountPage instance
     */
    myAccountPage: async ({ page }, use) => {
        await use(new MyAccountPage(page));
    },
});

export { expect } from '@playwright/test';
