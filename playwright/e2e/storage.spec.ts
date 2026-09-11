/**
 * Migrated from: cypress/e2e/tests/storage.test.ts
 * Cookie origin is the Playwright baseURL (127.0.0.1:3000), not localhost.
 * Dashboard visits use a real login token, never a mock JWT.
 */
import { test, expect } from "@playwright/test";
import { testData } from "../fixtures/test-data";

const ORIGIN = "http://127.0.0.1:3000/";

test.describe("Storage Testing - Cookies & Local Storage", () => {
  test.describe("Cookie Management", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/");
    });

    test("should set and get a cookie", async ({ page }) => {
      await page
        .context()
        .addCookies([{ name: "testCookie", value: "testValue", url: ORIGIN }]);
      const cookies = await page.context().cookies(ORIGIN);
      const cookie = cookies.find((c) => c.name === "testCookie");
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBe("testValue");
    });

    test("should clear a specific cookie", async ({ page }) => {
      await page.context().addCookies([
        { name: "cookieToDelete", value: "value", url: ORIGIN },
        { name: "cookieToKeep", value: "value", url: ORIGIN },
      ]);
      await page.context().clearCookies({ name: "cookieToDelete" });
      const cookies = await page.context().cookies(ORIGIN);
      expect(cookies.find((c) => c.name === "cookieToDelete")).toBeUndefined();
      expect(cookies.find((c) => c.name === "cookieToKeep")).toBeDefined();
    });

    test("should clear all cookies", async ({ page }) => {
      await page.context().addCookies([
        { name: "cookie1", value: "value1", url: ORIGIN },
        { name: "cookie2", value: "value2", url: ORIGIN },
      ]);
      await page.context().clearCookies();
      expect((await page.context().cookies(ORIGIN)).length).toBe(0);
    });

    test("should verify cookie set by server", async ({ page }) => {
      const login = await page.request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
      });
      expect(login.status()).toBe(200);
      const cookies = await page.context().cookies(ORIGIN);
      const authCookie = cookies.find((c) => c.name === "authToken");
      expect(authCookie, "authToken cookie after API login").toBeTruthy();
      expect(authCookie?.httpOnly).toBe(true);
      const me = await page.request.get("/api/auth/me");
      expect(me.status()).toBe(200);
    });

    test("getAllCookies twin lists cookies on this origin", async ({
      page,
    }) => {
      await page
        .context()
        .addCookies([{ name: "allCookie", value: "v", url: ORIGIN }]);
      const cookies = await page.context().cookies(ORIGIN);
      expect(cookies.map((c) => c.name)).toContain("allCookie");
    });
  });

  test.describe("localStorage Management", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page, request }) => {
      const login = await request.post("/api/auth/login", {
        data: {
          email: testData.validCredentials.emailId,
          password: testData.validCredentials.password,
        },
      });
      const body = await login.json();
      await page.goto("/");
      await page.evaluate(
        ({ token, user }) => {
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(user));
        },
        { token: body.token, user: body.user },
      );
      await page.goto("/dashboard");
      await expect(page.getByTestId("page-title")).toContainText("Dashboard");
    });

    test("should set and get localStorage item", async ({ page }) => {
      await page.evaluate(() => localStorage.setItem("testKey", "testValue"));
      expect(await page.evaluate(() => localStorage.getItem("testKey"))).toBe(
        "testValue",
      );
    });

    test("should store complex object in localStorage", async ({ page }) => {
      const userData = {
        id: 1,
        name: "Test User",
        preferences: { theme: "dark", lang: "en" },
      };
      await page.evaluate(
        (data) => localStorage.setItem("userData", JSON.stringify(data)),
        userData,
      );
      const stored = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("userData")!),
      );
      expect(stored).toEqual(userData);
    });

    test("should use UI buttons to test storage", async ({ page }) => {
      await page.getByTestId("set-storage-btn").click();
      expect(await page.evaluate(() => localStorage.getItem("testKey"))).toBe(
        "cypress-test-value",
      );
      await expect(page.getByTestId("storage-result")).toContainText(
        "localStorage set",
      );
    });

    test("should clear localStorage via UI", async ({ page }) => {
      await page.evaluate(() => localStorage.setItem("testItem", "testValue"));
      await page.getByTestId("clear-storage-btn").click();
      await expect(page.getByTestId("storage-result")).toContainText("cleared");
    });

    test("should clear authentication on logout", async ({ page }) => {
      await expect(page.getByTestId("user-email")).toContainText(
        "test@example.com",
      );
      await page.getByTestId("logout-link").click();
      await expect(page).toHaveURL(/\/login/);
      expect(
        await page.evaluate(() => localStorage.getItem("authToken")),
      ).toBeNull();
      expect(
        await page.evaluate(() => sessionStorage.getItem("authToken")),
      ).toBeNull();
    });
  });

  test.describe("sessionStorage Management", () => {
    test("should set and get sessionStorage item", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() =>
        sessionStorage.setItem("sessionKey", "sessionValue"),
      );
      expect(
        await page.evaluate(() => sessionStorage.getItem("sessionKey")),
      ).toBe("sessionValue");
    });

    test("should clear all sessionStorage", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => {
        sessionStorage.setItem("key1", "value1");
        sessionStorage.setItem("key2", "value2");
      });
      await page.evaluate(() => sessionStorage.clear());
      expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
    });
  });

  test.describe("getAll storage", () => {
    test("getAllLocalStorage then clear", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => localStorage.setItem("k", "v"));
      expect(await page.evaluate(() => localStorage.getItem("k"))).toBe("v");
      await page.evaluate(() => localStorage.clear());
      expect(await page.evaluate(() => localStorage.getItem("k"))).toBeNull();
    });

    test("getAllSessionStorage round-trips a key", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => sessionStorage.setItem("s", "1"));
      expect(await page.evaluate(() => sessionStorage.getItem("s"))).toBe("1");
    });
  });
});
