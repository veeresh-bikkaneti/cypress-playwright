import { loginPage } from '../pages/loginPage'
import { myAccountPage } from '../pages/myAccountPage'

/**
 * ============================================================================
 * LOGIN FUNCTIONALITY TESTS
 * ============================================================================
 * 
 * PURPOSE:
 * Tests the login functionality of the self-contained test application.
 * Uses data from cypress/fixtures/users.json for test credentials.
 * 
 * TEST COVERAGE:
 * - Valid login with correct credentials
 * - Invalid login with wrong email
 * - Invalid login with wrong password
 * - Invalid email format validation
 * - Login and logout flow
 * 
 * @author Veeresh Bikkaneti
 */
describe('Login Functionality', () => {
    beforeEach(() => {
        cy.fixture('users.json').then(function (data) {
            this.data = data;
        })
    })

    it('login with valid credentials', function () {
        // Use valid test-app credentials
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)
        myAccountPage.validateSuccessfulLogin()
        myAccountPage.logout()
        myAccountPage.validateSuccessfulLogout()
    })

    it('login with valid credentials read data from fixture', function () {
        loginPage.login(this.data.valid_credentials.emailId, this.data.valid_credentials.password)
        myAccountPage.validateSuccessfulLogin()
        myAccountPage.logout()
        myAccountPage.validateSuccessfulLogout()
    })

    it('login with invalid email credentials read data from fixture', function () {
        loginPage.login(
            this.data.invalid_credentials.invalid_email.emailId,
            this.data.invalid_credentials.invalid_email.password
        )
        loginPage.validateLoginError('Invalid email or password')
    })

    it('login with invalid password credentials read data from fixture', function () {
        loginPage.login(
            this.data.invalid_credentials.invalid_password.emailId,
            this.data.invalid_credentials.invalid_password.password
        )
        loginPage.validateLoginError('Invalid email or password')
    })

    it('login with wrong email format credentials read data from fixture', function () {
        loginPage.login(
            this.data.invalid_credentials.wrong_email_format.emailId,
            this.data.invalid_credentials.wrong_email_format.password
        )
        // The test-app validates email format client-side
        loginPage.validateEmailError()
    })

    it('should show password error for short password', function () {
        loginPage.navigateToLogin()
        loginPage.emailAddressTxt.type('test@example.com')
        loginPage.passwordTxt.type('short') // Less than 6 characters
        loginPage.signinBtn.click()
        loginPage.validatePasswordError()
    })
})