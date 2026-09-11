/**
 * Migrated from: cypress/e2e/tests/origin.test.ts
 * Secondary origin is the same AUT on :3002. Fail if it is down — do not swallow.
 */
import { test, expect } from "@playwright/test";
import { testData } from "../fixtures/test-data";

test.describe("Cross-Origin Testing", () => {
  test("secondary origin serves the same AUT title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("main-heading")).toBeVisible();

    await page.goto("http://127.0.0.1:3002/");
    await expect(page).toHaveTitle(/Cypress Test Application/);
    await expect(page.getByTestId("main-heading")).toBeVisible();
  });

  test("secondary origin login form accepts the fixture email", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:3002/login");
    const email = page.getByTestId("email-input");
    await email.fill(testData.validCredentials.emailId);
    await expect(email).toHaveValue(testData.validCredentials.emailId);
    await expect(page.getByTestId("login-container")).toBeVisible();
  });
});
