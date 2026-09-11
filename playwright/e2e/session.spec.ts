import { test, expect } from "@playwright/test";
import { AUTH_STATE } from "../auth-state";
import { LoginPage } from "../pages/LoginPage";

test.describe("Session Testing - Caching / Restore", () => {
  test.describe("storageState restore (cy.session twin)", () => {
    test.use({ storageState: AUTH_STATE });

    test("restores dashboard from storageState without UI login", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await expect(
        page.getByRole("heading", { name: "Welcome to Dashboard" }),
      ).toBeVisible();
      await expect(page.getByTestId("sidebar")).toBeVisible();
    });

    test("should allow navigation with restored session", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByTestId("orders-section")).toBeHidden();
      await page.getByRole("link", { name: /Orders/ }).click();
      await expect(page.getByTestId("orders-section")).toBeVisible();
      await expect(page.getByTestId("stats-grid")).toBeHidden();
    });

    test("should handle session clearing", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/.*\/dashboard/);

      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto("/dashboard");
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe("UI login helper (cy.login twin)", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("login helper twin lands on dashboard", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.login("test@example.com", "password123");
      await expect(page.getByTestId("page-title")).toContainText("Dashboard");
    });
  });
});
