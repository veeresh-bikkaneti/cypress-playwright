import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { LoginPage } from "../pages/LoginPage";
import { testData } from "../fixtures/test-data";
import { AUTH_STATE } from "../auth-state";

setup("authenticate", async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_STATE), { recursive: true });
  const loginPage = new LoginPage(page);
  // storageState persists cookies + localStorage, not sessionStorage.
  // Unchecked "Remember me" only writes sessionStorage, so restore would fail.
  await loginPage.login(
    testData.validCredentials.emailId,
    testData.validCredentials.password,
    true,
  );
  await expect(page).toHaveURL(/.*\/dashboard/);
  await page.context().storageState({ path: AUTH_STATE });
});
