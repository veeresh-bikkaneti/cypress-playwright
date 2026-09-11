import { loginPage } from "../pages/loginPage";
import { myAccountPage } from "../pages/myAccountPage";

/**
 * LOGIN FUNCTIONALITY
 * Source of truth for page objects + users.json fixture.
 * Duplicate "valid credentials" cases were removed (they were the same test twice).
 */
describe("Login Functionality", () => {
  beforeEach(function () {
    cy.fixture("users.json").then((data) => {
      this.data = data;
    });
  });

  it("login with valid credentials from fixture", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.validateSuccessfulLogin();
    myAccountPage.validateUserInfo("Test User", "test@example.com");
    myAccountPage.logout();
    myAccountPage.validateSuccessfulLogout();
  });

  it("login as admin from fixture", function () {
    loginPage.login(
      this.data.admin_credentials.emailId,
      this.data.admin_credentials.password,
    );
    myAccountPage.validateSuccessfulLogin();
    myAccountPage.validateUserInfo("Admin User", "admin@example.com");
  });

  it("login with invalid email from fixture", function () {
    loginPage.login(
      this.data.invalid_credentials.invalid_email.emailId,
      this.data.invalid_credentials.invalid_email.password,
    );
    loginPage.validateLoginError("Invalid email or password");
  });

  it("login with invalid password from fixture", function () {
    loginPage.login(
      this.data.invalid_credentials.invalid_password.emailId,
      this.data.invalid_credentials.invalid_password.password,
    );
    loginPage.validateLoginError("Invalid email or password");
  });

  it("login with wrong email format from fixture", function () {
    loginPage.login(
      this.data.invalid_credentials.wrong_email_format.emailId,
      this.data.invalid_credentials.wrong_email_format.password,
    );
    loginPage.validateEmailError();
  });

  it("shows password error for short password", function () {
    loginPage.navigateToLogin();
    loginPage.emailAddressTxt.type("test@example.com");
    loginPage.passwordTxt.type("short");
    loginPage.signinBtn.click();
    loginPage.validatePasswordError();
  });

  it("loginFromHome reaches dashboard", function () {
    loginPage.loginFromHome(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.validateSuccessfulLogin();
  });

  it("unchecked Remember me stores token in sessionStorage only", function () {
    loginPage.navigateToLogin();
    loginPage.emailAddressTxt.clear().type(this.data.valid_credentials.emailId);
    loginPage.passwordTxt.clear().type(this.data.valid_credentials.password);
    loginPage.rememberCheckbox.should("not.be.checked");
    loginPage.signinBtn.click();
    myAccountPage.validateSuccessfulLogin();
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem("authToken")).to.be.a("string").and.not
        .be.empty;
      expect(win.localStorage.getItem("authToken")).to.eq(null);
      expect(
        JSON.parse(win.localStorage.getItem("user") || "null"),
      ).to.have.property("email", this.data.valid_credentials.emailId);
    });
  });

  it("checked Remember me stores token in localStorage", function () {
    loginPage.navigateToLogin();
    loginPage.emailAddressTxt.clear().type(this.data.valid_credentials.emailId);
    loginPage.passwordTxt.clear().type(this.data.valid_credentials.password);
    loginPage.rememberCheckbox.check().should("be.checked");
    loginPage.signinBtn.click();
    myAccountPage.validateSuccessfulLogin();
    cy.window().then((win) => {
      expect(win.localStorage.getItem("authToken")).to.be.a("string").and.not.be
        .empty;
      expect(win.sessionStorage.getItem("authToken")).to.eq(null);
    });
  });
});
