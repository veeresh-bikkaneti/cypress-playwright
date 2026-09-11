import { test, expect } from "@playwright/test";
import { MyAccountPage } from "../pages/MyAccountPage";
import { AUTH_STATE } from "../auth-state";

test.describe("My Account Functionality", () => {
  test.use({ storageState: AUTH_STATE });

  let myAccountPage: MyAccountPage;

  test.beforeEach(async ({ page }) => {
    myAccountPage = new MyAccountPage(page);
    await page.goto("/dashboard");
  });

  test("should display dashboard when authenticated", async () => {
    await myAccountPage.validateSuccessfulLogin();
  });

  test("should display user information on dashboard", async () => {
    await expect(myAccountPage.userName).toBeVisible();
    await expect(myAccountPage.userEmail).toBeVisible();
  });

  test("should navigate to orders section", async () => {
    await myAccountPage.navigateToOrders();
    await expect(myAccountPage.ordersSection).toBeVisible();
  });

  test("should handle storage operations", async () => {
    await myAccountPage.setStorageBtn.click();
    await expect(myAccountPage.storageResult).toContainText("localStorage");

    await myAccountPage.clearStorageBtn.click();
    await expect(myAccountPage.storageResult).toContainText("cleared");
  });

  test("should logout and redirect to login", async () => {
    await myAccountPage.logout();
    await myAccountPage.validateSuccessfulLogout();
  });
});
