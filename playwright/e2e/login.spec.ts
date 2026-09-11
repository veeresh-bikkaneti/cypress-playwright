/**
 * Migrated from: cypress/e2e/tests/login.test.ts
 * Pages: LoginPage / MyAccountPage via auth.fixture
 * Data: cypress/fixtures/users.json through playwright/fixtures/test-data.ts
 */
import { test, expect } from "../fixtures/auth.fixture";
import { testData } from "../fixtures/test-data";

test.describe("Login Functionality", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login with valid credentials from fixture", async ({
    loginPage,
    myAccountPage,
  }) => {
    await loginPage.login(
      testData.validCredentials.emailId,
      testData.validCredentials.password,
    );
    await myAccountPage.validateSuccessfulLogin();
    await myAccountPage.validateUserInfo("Test User", "test@example.com");
    await myAccountPage.logout();
    await myAccountPage.validateSuccessfulLogout();
  });

  test("login as admin from fixture", async ({ loginPage, myAccountPage }) => {
    await loginPage.login(
      testData.adminCredentials.emailId,
      testData.adminCredentials.password,
    );
    await myAccountPage.validateSuccessfulLogin();
    await myAccountPage.validateUserInfo("Admin User", "admin@example.com");
  });

  test("login with invalid email from fixture", async ({ loginPage }) => {
    await loginPage.login(
      testData.invalidCredentials.invalidEmail.emailId,
      testData.invalidCredentials.invalidEmail.password,
    );
    await loginPage.validateLoginError("Invalid email or password");
  });

  test("login with invalid password from fixture", async ({ loginPage }) => {
    await loginPage.login(
      testData.invalidCredentials.invalidPassword.emailId,
      testData.invalidCredentials.invalidPassword.password,
    );
    await loginPage.validateLoginError("Invalid email or password");
  });

  test("login with wrong email format from fixture", async ({ loginPage }) => {
    await loginPage.login(
      testData.invalidCredentials.wrongEmailFormat.emailId,
      testData.invalidCredentials.wrongEmailFormat.password,
    );
    await loginPage.validateEmailError();
  });

  test("shows password error for short password", async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.emailAddressTxt.fill("test@example.com");
    await loginPage.passwordTxt.fill("short");
    await loginPage.signinBtn.click();
    await loginPage.validatePasswordError();
  });

  test("loginFromHome reaches dashboard", async ({
    loginPage,
    myAccountPage,
  }) => {
    await loginPage.loginFromHome(
      testData.validCredentials.emailId,
      testData.validCredentials.password,
    );
    await myAccountPage.validateSuccessfulLogin();
  });

  test("unchecked Remember me stores token in sessionStorage only", async ({
    loginPage,
    myAccountPage,
    page,
  }) => {
    await loginPage.navigateToLogin();
    await loginPage.emailAddressTxt.fill(testData.validCredentials.emailId);
    await loginPage.passwordTxt.fill(testData.validCredentials.password);
    await expect(loginPage.rememberCheckbox).not.toBeChecked();
    await loginPage.signinBtn.click();
    await myAccountPage.validateSuccessfulLogin();
    const sessionToken = await page.evaluate(() =>
      sessionStorage.getItem("authToken"),
    );
    const localToken = await page.evaluate(() =>
      localStorage.getItem("authToken"),
    );
    const user = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("user") || "null"),
    );
    expect(sessionToken).toBeTruthy();
    expect(localToken).toBeNull();
    expect(user.email).toBe(testData.validCredentials.emailId);
  });

  test("checked Remember me stores token in localStorage", async ({
    loginPage,
    myAccountPage,
    page,
  }) => {
    await loginPage.login(
      testData.validCredentials.emailId,
      testData.validCredentials.password,
      true,
    );
    await myAccountPage.validateSuccessfulLogin();
    const sessionToken = await page.evaluate(() =>
      sessionStorage.getItem("authToken"),
    );
    const localToken = await page.evaluate(() =>
      localStorage.getItem("authToken"),
    );
    expect(localToken).toBeTruthy();
    expect(sessionToken).toBeNull();
  });
});
