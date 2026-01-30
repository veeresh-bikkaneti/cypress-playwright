import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import fs from 'fs';
import path from 'path';

// Load fixture data
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../../cypress/fixtures/users.json'), 'utf-8'));

test.describe('Login Functionality', () => {
    let loginPage: LoginPage;
    let myAccountPage: MyAccountPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        myAccountPage = new MyAccountPage(page);
    });

    test('login with valid credentials', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);
        await myAccountPage.validateSuccessfulLogin();
        await myAccountPage.logout();
        await myAccountPage.validateSuccessfulLogout();
    });

    // Since we loaded data from fixture, this test is effectively the same as above but with explicit data usage
    test('login with valid credentials read data from fixture', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);
        await myAccountPage.validateSuccessfulLogin();
        await myAccountPage.logout();
        await myAccountPage.validateSuccessfulLogout();
    });

    test('login with invalid email credentials read data from fixture', async ({ page }) => {
        await loginPage.login(
            users.invalid_credentials.invalid_email.emailId,
            users.invalid_credentials.invalid_email.password
        );
        await loginPage.validateLoginError('Invalid email or password');
    });

    test('login with invalid password credentials read data from fixture', async ({ page }) => {
        await loginPage.login(
            users.invalid_credentials.invalid_password.emailId,
            users.invalid_credentials.invalid_password.password
        );
        await loginPage.validateLoginError('Invalid email or password');
    });

    test('login with wrong email format credentials read data from fixture', async ({ page }) => {
        await loginPage.login(
            users.invalid_credentials.wrong_email_format.emailId,
            users.invalid_credentials.wrong_email_format.password
        );
        // The test-app validates email format client-side
        await loginPage.validateEmailError();
    });

    test('should show password error for short password', async ({ page }) => {
        await loginPage.navigateToLogin();
        await loginPage.emailAddressTxt.fill('test@example.com');
        await loginPage.passwordTxt.fill('short'); // Less than 6 characters
        await loginPage.signinBtn.click();
        await loginPage.validatePasswordError();
    });
});
