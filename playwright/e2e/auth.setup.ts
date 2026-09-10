import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { LoginPage } from "../pages/LoginPage";
import { testData } from "../fixtures/test-data";

const authDir = path.join(__dirname, "../.auth");
const authFile = path.join(authDir, "user.json");

setup("authenticate", async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.login(
    testData.validCredentials.emailId,
    testData.validCredentials.password,
  );
  await expect(page).toHaveURL(/.*\/dashboard/);
  await page.context().storageState({ path: authFile });
});
