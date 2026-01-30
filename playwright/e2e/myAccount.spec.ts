import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import fs from 'fs';
import path from 'path';

const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../../cypress/fixtures/users.json'), 'utf-8'));

test.describe('My Account Functionality', () => {
    let loginPage: LoginPage;
    let myAccountPage: MyAccountPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        myAccountPage = new MyAccountPage(page);
    });

    test('should display dashboard after login', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);
        await myAccountPage.validateSuccessfulLogin();
    });

    test('should display user information on dashboard', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);

        await expect(myAccountPage.userName).toBeVisible();
        await expect(myAccountPage.userEmail).toBeVisible();
    });

    test('should navigate to orders section', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);
        await myAccountPage.navigateToOrders();
        await expect(myAccountPage.ordersSection).toBeVisible();
    });

    test('should handle storage operations', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);

        await myAccountPage.setStorageBtn.click();
        await expect(myAccountPage.storageResult).toContainText('localStorage');

        await myAccountPage.clearStorageBtn.click();
        await expect(myAccountPage.storageResult).toContainText('cleared');
    });

    test('should logout and redirect to login', async ({ page }) => {
        await loginPage.login(users.valid_credentials.emailId, users.valid_credentials.password);
        await myAccountPage.logout();
        await myAccountPage.validateSuccessfulLogout();
    });
});
