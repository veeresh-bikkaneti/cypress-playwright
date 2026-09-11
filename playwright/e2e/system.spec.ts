/**
 * Migrated from: cypress/e2e/tests/system.test.ts
 *
 * cy.exec / cy.task / write-then-read of a temp file are Cypress runner
 * capabilities. They are not twinned with echo/Date.now tautologies.
 * The AUT-observable twin of cy.fixture("products.json") is: stub the
 * products API with that fixture and assert the home grid.
 */
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const productsFixture = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "cypress/fixtures/products.json"),
    "utf-8",
  ),
);

test.describe("System and Filesystem Capabilities", () => {
  test("products.json fixture drives the AUT product grid", async ({
    page,
  }) => {
    await page.route("**/api/products", async (route) => {
      await route.fulfill({ json: productsFixture });
    });
    await page.goto("/");
    await expect(page.getByTestId("product-card")).toHaveCount(
      productsFixture.products.length,
    );
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Premium Laptop" }),
    ).toBeVisible();
  });
});
