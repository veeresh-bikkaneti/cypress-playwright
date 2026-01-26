import { loginPage } from "../pages/loginPage";
import { myAccountPage } from "../pages/myAccountPage";

/**
 * ============================================================================
 * MY ACCOUNT FUNCTIONALITY TESTS
 * ============================================================================
 * 
 * PURPOSE:
 * Tests the dashboard/account page functionality of the self-contained test application.
 * Demonstrates navigation, user info display, and account features.
 * 
 * @author Veeresh Bikkaneti
 */
describe('My Account Functionality', () => {
    beforeEach(() => {
        cy.fixture('users.json').then(function (data) {
            this.data = data;
        })
    })

    it('should display dashboard after login', function () {
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)
        myAccountPage.validateSuccessfulLogin()
    })

    it('should display user information on dashboard', function () {
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)

        // Wait for user info to be loaded
        cy.get('[data-testid="user-name"]').should('be.visible')
        cy.get('[data-testid="user-email"]').should('be.visible')
    })

    it('should navigate to orders section', function () {
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)

        myAccountPage.navigateToOrders()
        myAccountPage.ordersSection.should('be.visible')
    })

    it('should handle storage operations', function () {
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)

        // Test set storage button
        myAccountPage.setStorageBtn.click()
        myAccountPage.storageResult.should('contain', 'localStorage')

        // Test clear storage button
        myAccountPage.clearStorageBtn.click()
        myAccountPage.storageResult.should('contain', 'cleared')
    })

    it('should logout and redirect to login', function () {
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)

        myAccountPage.logout()
        myAccountPage.validateSuccessfulLogout()
    })
})