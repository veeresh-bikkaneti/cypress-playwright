import { test as base, Page } from "@playwright/test";
import path from "path";
import fs from "fs";
import { LoginPage } from "../pages/LoginPage";
import { MyAccountPage } from "../pages/MyAccountPage";
import { testData } from "./test-data";

/**
 * Authentication fixture — storageState, not UI-login per test.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/auth.fixture';
 *   test('my test', async ({ authenticatedPage }) => { ... });
 */

const authFile = path.join(__dirname, "../.auth/user.json");

type AuthFixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
  myAccountPage: MyAccountPage;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    if (!fs.existsSync(authFile)) {
      const warmup = await browser.newPage();
      const loginPage = new LoginPage(warmup);
      await loginPage.login(
        testData.validCredentials.emailId,
        testData.validCredentials.password,
      );
      fs.mkdirSync(path.dirname(authFile), { recursive: true });
      await warmup.context().storageState({ path: authFile });
      await warmup.close();
    }

    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    await page.goto("/dashboard");
    await use(page);
    await context.close();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  myAccountPage: async ({ page }, use) => {
    await use(new MyAccountPage(page));
  },
});

export { expect } from "@playwright/test";
