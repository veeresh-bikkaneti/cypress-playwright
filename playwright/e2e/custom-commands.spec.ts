/**
 * Migrated from: cypress/e2e/tests/custom-commands.test.ts
 *
 * Cypress custom commands → Playwright helpers / POM / built-ins.
 * Every test hits the AUT. No tautological assertions.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { MyAccountPage } from "../pages/MyAccountPage";
import { testData } from "../fixtures/test-data";
import {
  typeAndClear,
  shouldHaveData,
  interceptAndWait,
  setAuthCookie,
  fruit,
  highlight,
} from "../helpers/commands";

test.describe("Custom commands", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login lands on dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      testData.validCredentials.emailId,
      testData.validCredentials.password,
    );
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("page-title")).toContainText("Dashboard");
  });

  test("logout returns to login after login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myAccountPage = new MyAccountPage(page);
    await loginPage.login(
      testData.validCredentials.emailId,
      testData.validCredentials.password,
    );
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("page-title")).toContainText("Dashboard");
    await myAccountPage.logout();
    await myAccountPage.validateSuccessfulLogout();
  });

  test("getByTestId finds the home heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("main-heading")).toBeVisible();
    await expect(page.getByTestId("main-heading")).toContainText(
      "Cypress Test Application",
    );
  });

  test("interceptAndWait waits for products on home", async ({ page }) => {
    const response = await interceptAndWait(page, "GET", "/api/products", "/");
    expect(response.ok()).toBe(true);
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    expect(await page.getByTestId("product-card").count()).toBeGreaterThan(0);
  });

  test("typeAndClear types then empties alias-input", async ({ page }) => {
    await page.goto("/actions");
    const input = page.getByTestId("alias-input");
    await typeAndClear(input, "temporary text");
    await expect(input).toHaveValue("");
  });

  test("shouldHaveData asserts data-field on alias-input", async ({ page }) => {
    await page.goto("/actions");
    await shouldHaveData(page.getByTestId("alias-input"), "field", "alias");
  });

  test("highlight sets an inline border", async ({ page }) => {
    await page.goto("/actions");
    const input = page.getByTestId("alias-input");
    await highlight(input);
    await expect(input).toHaveAttribute("style", /border/);
    await expect(input).toHaveCSS("border-top-style", "solid");
  });

  test("setAuthCookie authenticates GET /api/auth/me", async ({
    page,
    request,
  }) => {
    const unauth = await request.get("/api/auth/me");
    expect(unauth.status()).toBe(401);

    const loginRes = await request.post("/api/auth/login", {
      data: {
        email: testData.validCredentials.emailId,
        password: testData.validCredentials.password,
      },
    });
    expect(loginRes.status()).toBe(200);
    const body = await loginRes.json();
    expect(typeof body.token).toBe("string");

    const pageUnauth = await page.request.get("/api/auth/me");
    expect(pageUnauth.status()).toBe(401);

    await setAuthCookie(page.context(), body.token);

    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(200);
    const meBody = await me.json();
    expect(meBody.user.email).toBe(testData.validCredentials.emailId);
  });

  test("fruit finds Bananas on /dom", async ({ page }) => {
    await page.goto("/dom");
    await expect(fruit(page, "Bananas")).toHaveAttribute(
      "data-testid",
      "item-bananas",
    );
    await expect(page.getByTestId("item-bananas")).toBeVisible();
    await expect(page.getByTestId("item-bananas")).toContainText("Bananas");
  });

  test("api posts a todo", async ({ request }) => {
    const response = await request.post("/api/todos", {
      data: { title: "cmd" },
    });
    expect(response.status()).toBe(201);
    expect((await response.json()).title).toBe("cmd");
  });

  test("visit still loads home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("main-heading")).toBeVisible();
    await expect(page.getByTestId("main-heading")).toContainText(
      "Cypress Test Application",
    );
  });
});
