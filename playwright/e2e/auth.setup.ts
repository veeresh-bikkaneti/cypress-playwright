import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { LoginPage } from "../pages/LoginPage";
import { testData } from "../fixtures/test-data";
import { AUTH_STATE } from "../auth-state";

setup("authenticate", async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_STATE), { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
  await loginPage.emailAddressTxt.fill(testData.validCredentials.emailId);
  await loginPage.passwordTxt.fill(testData.validCredentials.password);
  // storageState persists cookies + localStorage, not sessionStorage.
  // Unchecked "Remember me" only writes sessionStorage, so restore would fail.
  await loginPage.rememberCheckbox.check();
  await loginPage.signinBtn.click();
  await expect(page).toHaveURL(/.*\/dashboard/);
  await page.context().storageState({ path: AUTH_STATE });
});
