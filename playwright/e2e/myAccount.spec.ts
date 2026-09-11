import { test, expect } from "../fixtures/auth.fixture";
import { AUTH_STATE } from "../auth-state";
import { testData } from "../fixtures/test-data";

test.describe("My Account Functionality", () => {
  test.use({ storageState: AUTH_STATE });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("should display dashboard when authenticated", async ({
    myAccountPage,
  }) => {
    await myAccountPage.validateSuccessfulLogin();
  });

  test("should display user information on dashboard", async ({
    myAccountPage,
  }) => {
    await myAccountPage.validateUserInfo(
      "Test User",
      testData.validCredentials.emailId,
    );
  });

  test("should navigate to orders section", async ({ myAccountPage }) => {
    await expect(myAccountPage.ordersSection).toBeHidden();
    await myAccountPage.navigateToOrders();
    await expect(myAccountPage.ordersSection).toBeVisible();
    await expect(myAccountPage.statsGrid).toBeHidden();
  });

  test("should navigate to products and settings", async ({
    myAccountPage,
  }) => {
    await myAccountPage.navigateToProducts();
    await expect(myAccountPage.productsSection).toBeVisible();
    await expect(myAccountPage.ordersSection).toBeHidden();
    await myAccountPage.navigateToSettings();
    await expect(myAccountPage.settingsSection).toBeVisible();
    await expect(myAccountPage.productsSection).toBeHidden();
  });

  test("should handle storage operations", async ({ myAccountPage }) => {
    await myAccountPage.setStorageBtn.click();
    await expect(myAccountPage.storageResult).toContainText("localStorage");
    await myAccountPage.clearStorageBtn.click();
    await expect(myAccountPage.storageResult).toContainText("cleared");
  });

  test("should logout and redirect to login", async ({ myAccountPage }) => {
    await myAccountPage.logout();
    await myAccountPage.validateSuccessfulLogout();
  });
});
