import { test, expect } from "@playwright/test";

test.describe("Debug Page Load", () => {
  test("should load home page and print title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Cypress Test Application/);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("Body Text Length:", bodyText.length);
    console.log("Body Start:", bodyText.substring(0, 100));

    await expect(page.getByTestId("main-heading")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("main-heading")).toContainText(
      "Cypress Test Application",
    );
    await expect(page.getByTestId("product-card").first()).toBeVisible({
      timeout: 10000,
    });
    expect(await page.getByTestId("product-card").count()).toBeGreaterThan(0);
  });
});
