import { test, expect } from "@playwright/test";
import { AUTH_STATE } from "../auth-state";

test.describe("Session Testing - Caching / Restore", () => {
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
    await page.getByRole("link", { name: /Orders/ }).click();
    await expect(page.getByTestId("orders-section")).toBeVisible();
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
