/**
 * Migrated from: cypress/e2e/tests/a11y.test.ts
 *
 * Why Cypress accessibility example is an in-spec alt assertion,
 * not Cypress Accessibility Cloud.
 */

import { test, expect } from "@playwright/test";

test.describe("Accessibility (Why Cypress in-spec checks)", () => {
  test("home logo has the documented alt text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("img#logo")).toHaveAttribute(
      "alt",
      "Cypress Logo",
    );
    await expect(page.getByTestId("app-logo")).toHaveAttribute(
      "alt",
      "Cypress Logo",
    );
  });

  test("main nav exposes a navigation landmark", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
    await expect(page.getByTestId("main-nav")).toHaveAttribute(
      "role",
      "navigation",
    );
  });

  test("login fields are labelled and failed login uses role=alert", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByTestId("email-input")).toHaveAttribute(
      "aria-labelledby",
      /.+/,
    );
    await expect(page.getByTestId("password-input")).toHaveAttribute(
      "aria-labelledby",
      /.+/,
    );
    await page.getByTestId("email-input").fill("nobody@example.com");
    await page.getByTestId("password-input").fill("wrongpassword");
    await page.getByTestId("submit-btn").click();
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).not.toHaveText("");
  });
});
