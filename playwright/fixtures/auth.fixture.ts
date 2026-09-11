import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { MyAccountPage } from "../pages/MyAccountPage";

export { AUTH_STATE } from "../auth-state";

type AuthFixtures = {
  loginPage: LoginPage;
  myAccountPage: MyAccountPage;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  myAccountPage: async ({ page }, use) => {
    await use(new MyAccountPage(page));
  },
});

export { expect } from "@playwright/test";
