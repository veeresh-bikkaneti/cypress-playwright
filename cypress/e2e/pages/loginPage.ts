/// <reference types="cypress" />

/**
 * LoginPage - Page Object for the local test-app login page
 * 
 * Uses data-testid selectors compatible with the self-contained test application
 * located at cypress/test-app/public/login.html
 */
class LoginPage {
    // Element selectors using data-testid for reliable selection
    get loginContainer() { return cy.get('[data-testid="login-container"]') }
    get emailAddressTxt() { return cy.get('[data-testid="email-input"]') }
    get passwordTxt() { return cy.get('[data-testid="password-input"]') }
    get signinBtn() { return cy.get('[data-testid="submit-btn"]') }
    get rememberCheckbox() { return cy.get('[data-testid="remember-checkbox"]') }
    get loginAlert() { return cy.get('[data-testid="login-alert"]') }
    get emailError() { return cy.get('[data-testid="email-error"]') }
    get passwordError() { return cy.get('[data-testid="password-error"]') }
    get forgotPasswordLink() { return cy.get('[data-testid="forgot-password-link"]') }
    get backToHomeLink() { return cy.get('[data-testid="back-to-home-link"]') }

    // Navigation link on home page (for tests that start from home)
    get navLoginLink() { return cy.get('[data-testid="nav-login"]') }

    public launchApplication() {
        cy.visit('/')
    }

    public navigateToLogin() {
        cy.visit('/login')
    }

    public login(emailId: string, password: string) {
        this.navigateToLogin()
        this.emailAddressTxt.clear().type(emailId)
        this.passwordTxt.clear().type(password)
        this.signinBtn.click()
    }

    public loginFromHome(emailId: string, password: string) {
        this.launchApplication()
        this.navLoginLink.click()
        this.emailAddressTxt.clear().type(emailId)
        this.passwordTxt.clear().type(password)
        this.signinBtn.click()
    }

    public validateLoginError(errorMessage: string) {
        // The test-app shows errors via the login-alert element
        this.loginAlert.should('be.visible')
        this.loginAlert.should('contain.text', errorMessage)
    }

    public validateEmailError() {
        this.emailError.should('have.class', 'show')
    }

    public validatePasswordError() {
        this.passwordError.should('have.class', 'show')
    }

    public validateSuccessfulLogin() {
        this.loginAlert.should('contain.text', 'Login successful')
        cy.url().should('include', '/dashboard')
    }
}
export const loginPage: LoginPage = new LoginPage()