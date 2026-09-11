/**
 * Migrated from: cypress/e2e/tests/utilities.test.ts
 *
 * Cypress-only runtime helpers (Cypress._, minimatch, Blob, isCy, sinon,
 * currentTest title, Screenshot.defaults) are NOT twinned with tautologies.
 * This file keeps AUT-observable cases only.
 */
import { test, expect } from "@playwright/test";
import fs from "fs";

test.describe("Utilities and leftover commands", () => {
  test("screenshot captures the home heading, not an empty file", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    const shot = testInfo.outputPath("utilities-home.png");
    await page.screenshot({ path: shot, fullPage: false });
    const stat = fs.statSync(shot);
    expect(stat.size).toBeGreaterThan(1000);
    await expect(page.getByTestId("main-heading")).toHaveText(
      /Cypress Test Application/,
    );
  });

  test("document readyState is complete on a real home page", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);
    expect(await page.evaluate(() => document.readyState)).toBe("complete");
    await expect(page.getByTestId("main-heading")).toBeVisible();
  });
});
