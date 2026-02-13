/**
 * ============================================================================
 * LOGIN FUNCTIONALITY TESTS - Playwright Migration
 * ============================================================================
 * 
 * Migrated from: cypress/e2e/tests/login.test.ts
 * 
 * PURPOSE:
 * Tests the login functionality of the self-contained test application.
 * Uses test data from playwright/fixtures/test-data.ts for credentials.
 * 
 * TEST COVERAGE:
 * - Valid login with correct credentials
 * - Invalid login with wrong email
 * - Invalid login with wrong password
 * - Invalid email format validation
 * - Login and logout flow
 * - Password length validation
 * 
 * MIGRATION NOTES:
 * - Replaced cy.fixture() with TypeScript test data module
 * - Replaced custom commands with Page Object methods
 * - All actions properly awaited
 * - Uses auth fixture for authenticated scenarios
 * 
 * @author Veeresh Bikkaneti (Migrated to Playwright)
 */

import { test, expect } from '../fixtures/auth.fixture';
import { testData } from '../fixtures/test-data';

test.describe('Login Functionality', () => {

    test('login with valid credentials', async ({ loginPage, myAccountPage }) => {
        // Use valid credentials from test data
        await loginPage.login(
            testData.validCredentials.emailId,
            testData.validCredentials.password
        );

        // Validate successful login
        await myAccountPage.validateSuccessfulLogin();

        // Logout
        await myAccountPage.logout();

        // Validate successful logout
        await myAccountPage.validateSuccessfulLogout();
    });

    test('login with valid credentials read data from fixture', async ({ loginPage, myAccountPage }) => {
        // Same test - demonstrates fixture usage pattern
        await loginPage.login(
            testData.validCredentials.emailId,
            testData.validCredentials.password
        );

        await myAccountPage.validateSuccessfulLogin();
        await myAccountPage.logout();
        await myAccountPage.validateSuccessfulLogout();
    });

    test('login with invalid email credentials read data from fixture', async ({ loginPage }) => {
        await loginPage.login(
            testData.invalidCredentials.invalidEmail.emailId,
            testData.invalidCredentials.invalidEmail.password
        );

        await loginPage.validateLoginError('Invalid email or password');
    });

    test('login with invalid password credentials read data from fixture', async ({ loginPage }) => {
        await loginPage.login(
            testData.invalidCredentials.invalidPassword.emailId,
            testData.invalidCredentials.invalidPassword.password
        );

        await loginPage.validateLoginError('Invalid email or password');
    });

    test('login with wrong email format credentials read data from fixture', async ({ loginPage }) => {
        await loginPage.login(
            testData.invalidCredentials.wrongEmailFormat.emailId,
            testData.invalidCredentials.wrongEmailFormat.password
        );

        // The test-app validates email format client-side
        await loginPage.validateEmailError();
    });

    test('should show password error for short password', async ({ loginPage }) => {
        await loginPage.navigateToLogin();

        // Type into fields directly
        await loginPage.emailAddressTxt.fill('test@example.com');
        await loginPage.passwordTxt.fill('short'); // Less than 6 characters
        await loginPage.signinBtn.click();

        // Validate password error
        await loginPage.validatePasswordError();
    });
});
