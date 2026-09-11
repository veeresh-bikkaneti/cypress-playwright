/**
 * Migrated from: cypress/e2e/tests/api.test.ts
 *
 * Cypress → Playwright:
 * - cy.intercept() → page.route()
 * - cy.request() → request fixture
 * - cy.wait("@alias") → waitForResponse / waitForRequest
 * - cy.api() plugin → request.post (same HTTP assertion)
 */

import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { testData } from "../fixtures/test-data";
import { LoginPage } from "../pages/LoginPage";

const productsFixture = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "cypress/fixtures/products.json"),
    "utf-8",
  ),
);

test.describe("API Testing - Network Capabilities", () => {
  test.describe("page.route() - Response Stubbing", () => {
    test("stubs GET /api/products from a fixture", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({ json: productsFixture });
      });
      await page.goto("/");
      await expect(page.getByTestId("product-card")).toHaveCount(5);
      await expect(
        page.getByTestId("product-card").filter({ hasText: "Premium Laptop" }),
      ).toBeVisible();
    });

    test("stubs GET /api/products and the AUT renders the stub", async ({
      page,
    }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          json: {
            products: [
              { id: 99, name: "Stub Widget", price: 1, inStock: true },
            ],
            total: 1,
          },
        });
      });
      await page.goto("/");
      await expect(
        page.getByTestId("product-card").filter({ hasText: "Stub Widget" }),
      ).toBeVisible();
      await expect(page.getByTestId("product-card")).toHaveCount(1);
    });

    test("matches a URL pattern", async ({ page }) => {
      const requestPromise = page.waitForRequest("**/api/products**");
      await page.goto("/");
      const req = await requestPromise;
      expect(req.method()).toBe("GET");
    });

    test("returns an empty list", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({ json: { products: [], total: 0 } });
      });
      await page.goto("/");
      await expect(page.getByTestId("products-grid")).toHaveCount(1);
      await expect(page.getByTestId("product-card")).toHaveCount(0);
    });

    test("delays the response", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await new Promise((r) => setTimeout(r, 400));
        await route.fulfill({
          json: {
            products: [{ id: 1, name: "Slow Widget", price: 2, inStock: true }],
            total: 1,
          },
        });
      });
      await page.goto("/");
      await expect(
        page.getByTestId("product-card").filter({ hasText: "Slow Widget" }),
      ).toBeVisible();
    });

    test("stubs an error body the AUT surfaces", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 500,
          json: { error: "boom" },
        });
      });
      await page.goto("/");
      await expect(page.getByTestId("products-grid")).toContainText(
        "Failed to load products",
      );
    });

    test("asserts the outgoing login request body", async ({ page }) => {
      const requestPromise = page.waitForRequest("**/api/auth/login");
      const loginPage = new LoginPage(page);
      await loginPage.login(
        testData.validCredentials.emailId,
        testData.validCredentials.password,
      );
      const req = await requestPromise;
      expect(req.postDataJSON()).toMatchObject({
        email: testData.validCredentials.emailId,
        password: testData.validCredentials.password,
      });
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("visits home and waits for products", async ({ page }) => {
      const responsePromise = page.waitForResponse("**/api/products");
      await page.goto("/");
      const res = await responsePromise;
      expect(res.status()).toBe(200);
      await expect(page.getByTestId("product-card").first()).toBeVisible();
    });
  });

  test.describe("Direct API Testing", () => {
    test("should make direct GET request", async ({ request }) => {
      const response = await request.get("/api/products");
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("products");
      expect(Array.isArray(body.products)).toBeTruthy();
      expect(body.products.length).toBeGreaterThan(0);
      expect(response.headers()["content-type"]).toBeDefined();
    });

    test("should make POST request with JSON body", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
    });

    test("should handle error responses", async ({ request }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: "invalid@example.com",
          password: "wrongpassword",
        },
      });
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    test("should chain multiple API requests", async ({ request }) => {
      const loginRes = await request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
      });
      const loginBody = await loginRes.json();
      const orderRes = await request.post("/api/orders", {
        headers: { Authorization: `Bearer ${loginBody.token}` },
        data: { items: [{ productId: 1, quantity: 2 }] },
      });
      expect([200, 201]).toContain(orderRes.status());
      const orderBody = await orderRes.json();
      expect(orderBody).toHaveProperty("order");
    });

    test("should validate various HTTP error codes", async ({ request }) => {
      const response = await request.get("/api/non-existent-endpoint-404");
      expect(response.status()).toBe(404);
    });

    test("should use API for test setup (bypass UI)", async ({
      page,
      request,
    }) => {
      const response = await request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
      });
      const body = await response.json();
      await page.goto("/");
      await page.evaluate((payload) => {
        localStorage.setItem("authToken", payload.token);
        localStorage.setItem("user", JSON.stringify(payload.user));
      }, body);
      await page.goto("/dashboard");
      await expect(page.getByTestId("user-email")).toContainText(
        testData.validCredentials.emailId,
      );
    });

    test("adds a todo via POST (Why Cypress #Other)", async ({ request }) => {
      const response = await request.post("/api/todos", {
        data: { title: "Write API Tests" },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({ title: "Write API Tests" });
    });

    test("returns 400 when the todo title is missing", async ({ request }) => {
      const response = await request.post("/api/todos", { data: {} });
      expect(response.status()).toBe(400);
    });

    test("reads live /api/error status codes", async ({ request }) => {
      for (const code of [400, 401, 404, 500]) {
        const response = await request.get(`/api/error/${code}`);
        expect(response.status()).toBe(code);
      }
    });

    test("plugin-api twin posts a todo", async ({ request }) => {
      const response = await request.post("/api/todos", {
        data: { title: "Plugin API Tests" },
      });
      expect(response.status()).toBe(201);
      expect(await response.json()).toMatchObject({
        title: "Plugin API Tests",
      });
    });
  });

  test.describe("Live endpoint health", () => {
    test("should verify products API responsiveness", async ({ request }) => {
      const start = Date.now();
      const res = await request.get("/api/products");
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.products.length).toBeGreaterThan(0);
    });

    test("should verify multiple critical endpoints", async ({ request }) => {
      expect((await request.get("/api/products")).status()).toBe(200);
      expect((await request.get("/")).status()).toBe(200);
    });

    test("should handle manual fetch requests", async ({ page }) => {
      await page.goto("/");
      const data = await page.evaluate(async () => {
        const res = await fetch("/api/products");
        return { status: res.status, body: await res.json() };
      });
      expect(data.status).toBe(200);
      expect(Array.isArray(data.body.products)).toBe(true);
    });
  });
});
