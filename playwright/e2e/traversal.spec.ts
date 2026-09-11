/**
 * Migrated from: cypress/e2e/tests/traversal.test.ts
 *
 * Cypress → Playwright:
 * - cy.get / contains / first / last / eq → locator / getByText / nth
 * - filter / not / find / parent / closest / siblings → locator filters
 * - cy.shadow() → Playwright pierces open shadow roots
 * - iframe its('0.contentDocument') → page.frameLocator()
 */

import { test, expect } from "@playwright/test";

test.describe("Query, traversal, and connectors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dom");
  });

  test.describe("Queries", () => {
    test("finds the tree root", async ({ page }) => {
      await expect(page.getByTestId("tree-root")).toBeVisible();
    });

    test("finds fruit by text", async ({ page }) => {
      await expect(page.getByText("Bananas", { exact: true })).toHaveAttribute(
        "data-testid",
        "item-bananas",
      );
    });

    test("first / last / nth", async ({ page }) => {
      const fruits = page.locator(".fruit");
      await expect(fruits.first()).toContainText("Apples");
      await expect(fruits.last()).toContainText("Oranges");
      await expect(fruits.nth(1)).toContainText("Bananas");
    });

    test("filter and not", async ({ page }) => {
      await expect(page.locator(".fruit.active")).toContainText("Oranges");
      await expect(page.locator(".fruit:not(.active)")).toHaveCount(2);
    });

    test("walks descendants", async ({ page }) => {
      await expect(
        page.getByTestId("item-apples").locator(".variety"),
      ).toHaveCount(2);
    });

    test("focused() yields the active element", async ({ page }) => {
      await page.getByTestId("focus-input").focus();
      await expect(page.getByTestId("focus-input")).toBeFocused();
    });

    test("root / within scoping", async ({ page }) => {
      await expect(page.locator("html")).toBeVisible();
      await expect(
        page.getByTestId("tree-root").locator(".active"),
      ).toContainText("Oranges");
    });

    test("reads the URL hash", async ({ page }) => {
      await page.goto("/dom#shadow-section");
      await expect(page).toHaveURL(/#shadow-section$/);
    });
  });

  test.describe("Traversal", () => {
    test("children of the tree list", async ({ page }) => {
      await expect(
        page.getByTestId("tree-list").locator(":scope > li"),
      ).toHaveCount(3);
    });

    test("parent / parents / closest", async ({ page }) => {
      const fuji = page.getByTestId("item-fuji");
      await expect(fuji.locator("xpath=..")).toHaveRole("list");
      await expect(
        page.getByTestId("tree-root").getByTestId("item-fuji"),
      ).toBeVisible();
    });

    test("next / prev / siblings", async ({ page }) => {
      await expect(
        page
          .getByTestId("item-apples")
          .locator("xpath=following-sibling::li[1]"),
      ).toContainText("Bananas");
      await expect(
        page
          .getByTestId("item-bananas")
          .locator("xpath=preceding-sibling::li[1]"),
      ).toContainText("Apples");
      await expect(
        page
          .getByTestId("item-bananas")
          .locator("xpath=preceding-sibling::li | following-sibling::li"),
      ).toHaveCount(2);
    });

    test("nextAll / prevAll", async ({ page }) => {
      await expect(
        page.getByTestId("item-apples").locator("xpath=following-sibling::li"),
      ).toHaveCount(2);
      await expect(
        page.getByTestId("item-oranges").locator("xpath=preceding-sibling::li"),
      ).toHaveCount(2);
    });

    test("nextUntil yields siblings up to the selector", async ({ page }) => {
      await expect(
        page
          .getByTestId("item-apples")
          .locator(
            "xpath=following-sibling::li[following-sibling::*[@data-testid='item-oranges']]",
          ),
      ).toHaveCount(1);
      await expect(
        page
          .getByTestId("item-apples")
          .locator("xpath=following-sibling::li[1]"),
      ).toContainText("Bananas");
    });

    test("prevUntil yields preceding siblings up to the selector", async ({
      page,
    }) => {
      await expect(
        page
          .getByTestId("item-oranges")
          .locator("xpath=preceding-sibling::li[1]"),
      ).toContainText("Bananas");
    });

    test("parentsUntil yields ancestors up to the selector", async ({
      page,
    }) => {
      const count = await page.evaluate(() => {
        const el = document.querySelector("[data-testid=item-fuji]");
        const stop = document.querySelector("[data-testid=tree-root]");
        let n = 0;
        let parent = el && el.parentElement;
        while (parent && parent !== stop) {
          n += 1;
          parent = parent.parentElement;
        }
        return n;
      });
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe("Connectors", () => {
    test("aliases an element via a variable", async ({ page }) => {
      const firstFruit = page.locator(".fruit").first();
      await expect(firstFruit).toContainText("Apples");
    });

    test("wraps a fruit name from the AUT", async ({ page }) => {
      const name = (await page.locator(".fruit").first().innerText()).trim();
      expect(name).toMatch(/Apples/);
    });

    test("reads a collection length", async ({ page }) => {
      await expect(page.locator(".fruit")).toHaveCount(3);
    });

    test("reads element text", async ({ page }) => {
      await expect(page.getByTestId("item-oranges")).toHaveText(/Oranges/);
    });

    test("iterates elements", async ({ page }) => {
      for (const fruit of await page.locator(".fruit").all()) {
        expect((await fruit.innerText()).trim().length).toBeGreaterThan(0);
      }
    });

    test("yields the subject to a callback", async ({ page }) => {
      expect(await page.locator(".fruit").count()).toBe(3);
    });

    test("unpacks fruit names from the AUT", async ({ page }) => {
      const names = (await page.locator(".fruit").allTextContents()).map(
        (t) => t.trim().split("\n")[0],
      );
      expect(names).toEqual(["Apples", "Bananas", "Oranges"]);
    });

    test("scopes subsequent commands", async ({ page }) => {
      const tree = page.getByTestId("tree-root");
      await expect(tree.locator(".active")).toContainText("Oranges");
      await expect(tree.getByText("Fuji")).toBeVisible();
    });

    test("finds a fruit by text (addQuery twin)", async ({ page }) => {
      await expect(
        page.locator(".fruit").filter({ hasText: "Bananas" }),
      ).toHaveAttribute("data-testid", "item-bananas");
    });
  });

  test.describe("shadow DOM", () => {
    test("clicks a button inside an open shadow root", async ({ page }) => {
      const widget = page.getByTestId("demo-widget");
      await widget.getByTestId("shadow-btn").click();
      await expect(widget.getByTestId("shadow-status")).toHaveText("clicked");
    });
  });

  test.describe("iframe", () => {
    test("reads and clicks inside a same-origin iframe", async ({ page }) => {
      const frame = page.frameLocator("[data-testid=demo-iframe]");
      await expect(frame.getByTestId("iframe-secret")).toContainText(
        "inside iframe",
      );
      await frame.getByTestId("iframe-btn").click();
      await expect(frame.getByTestId("iframe-status")).toHaveText("pinged");
    });
  });
});
