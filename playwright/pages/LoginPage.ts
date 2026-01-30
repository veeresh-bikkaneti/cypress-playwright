import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly loginContainer: Locator;
    readonly emailAddressTxt: Locator;
    readonly passwordTxt: Locator;
    readonly signinBtn: Locator;
    readonly rememberCheckbox: Locator;
    readonly loginAlert: Locator;
    readonly emailError: Locator;
    readonly passwordError: Locator;
    readonly forgotPasswordLink: Locator;
    readonly backToHomeLink: Locator;
    readonly navLoginLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginContainer = page.locator('[data-testid="login-container"]');
        this.emailAddressTxt = page.locator('[data-testid="email-input"]');
        this.passwordTxt = page.locator('[data-testid="password-input"]');
        this.signinBtn = page.locator('[data-testid="submit-btn"]');
        this.rememberCheckbox = page.locator('[data-testid="remember-checkbox"]');
        this.loginAlert = page.locator('[data-testid="login-alert"]');
        this.emailError = page.locator('[data-testid="email-error"]');
        this.passwordError = page.locator('[data-testid="password-error"]');
        this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
        this.backToHomeLink = page.locator('[data-testid="back-to-home-link"]');
        this.navLoginLink = page.locator('[data-testid="nav-login"]');
    }

    async launchApplication() {
        await this.page.goto('/');
    }

    async navigateToLogin() {
        await this.page.goto('/login');
    }

    async login(emailId: string, password: string) {
        await this.navigateToLogin();
        await this.emailAddressTxt.fill(emailId);
        await this.passwordTxt.fill(password);
        await this.signinBtn.click();
    }

    async loginFromHome(emailId: string, password: string) {
        await this.launchApplication();
        await this.navLoginLink.click();
        await this.emailAddressTxt.fill(emailId);
        await this.passwordTxt.fill(password);
        await this.signinBtn.click();
    }

    async validateLoginError(errorMessage: string) {
        await expect(this.loginAlert).toBeVisible();
        await expect(this.loginAlert).toContainText(errorMessage);
    }

    async validateEmailError() {
        await expect(this.emailError).toHaveClass(/show/);
    }

    async validatePasswordError() {
        await expect(this.passwordError).toHaveClass(/show/);
    }

    async validateSuccessfulLogin() {
        await expect(this.loginAlert).toContainText('Login successful');
        await expect(this.page).toHaveURL(/.*\/dashboard/);
    }
}
