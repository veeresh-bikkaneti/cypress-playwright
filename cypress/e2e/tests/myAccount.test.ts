import { loginPage } from "../pages/loginPage";
import { myAccountPage } from "../pages/myAccountPage";

describe("My Account Functionality", () => {
  beforeEach(function () {
    cy.fixture("users.json").then((data) => {
      this.data = data;
    });
  });

  it("should display dashboard after login", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.validateSuccessfulLogin();
  });

  it("should display user information on dashboard", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.validateUserInfo(
      "Test User",
      this.data.valid_credentials.emailId,
    );
  });

  it("should navigate to orders section", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.ordersSection.should("not.be.visible");
    myAccountPage.navigateToOrders();
    myAccountPage.ordersSection.should("be.visible");
    myAccountPage.statsGrid.should("not.be.visible");
  });

  it("should navigate to products and settings", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.navigateToProducts();
    myAccountPage.productsSection.should("be.visible");
    myAccountPage.ordersSection.should("not.be.visible");
    myAccountPage.navigateToSettings();
    myAccountPage.settingsSection.should("be.visible");
    myAccountPage.productsSection.should("not.be.visible");
  });

  it("should handle storage operations", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.setStorageBtn.click();
    myAccountPage.storageResult.should("contain", "localStorage");
    myAccountPage.clearStorageBtn.click();
    myAccountPage.storageResult.should("contain", "cleared");
  });

  it("should logout and redirect to login", function () {
    loginPage.login(
      this.data.valid_credentials.emailId,
      this.data.valid_credentials.password,
    );
    myAccountPage.logout();
    myAccountPage.validateSuccessfulLogout();
  });
});
