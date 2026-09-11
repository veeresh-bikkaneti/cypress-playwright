/**
 * Migrated from: cypress/e2e/tests/clock.test.ts
 * page.clock against the AUT time widget — not a test-injected node.
 */
import { test, expect } from "@playwright/test";

test.describe("Time Manipulation", () => {
  test("freezes the AUT client clock", async ({ page }) => {
    await page.clock.install({ time: new Date("2023-01-01T00:00:00.000Z") });
    await page.goto("/");
    await expect(page.getByTestId("client-clock")).toContainText("2023-01-01");
  });

  test("ticks the AUT delayed banner without waiting 5s", async ({ page }) => {
    await page.clock.install({ time: new Date("2023-01-01T00:00:00.000Z") });
    await page.goto("/");
    await expect(page.getByTestId("delayed-banner")).toBeHidden();
    await page.getByTestId("delayed-banner-btn").click();
    await expect(page.getByTestId("delayed-banner")).toBeHidden();
    await page.clock.fastForward(5000);
    await expect(page.getByTestId("delayed-banner")).toBeVisible();
    await expect(page.getByTestId("delayed-banner")).toHaveText(
      "Timeout Complete",
    );
  });
});
