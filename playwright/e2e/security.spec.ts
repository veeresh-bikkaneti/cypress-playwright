import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { testData } from "../fixtures/test-data";

test.describe("OWASP Security Checks", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.describe("Injection (XSS)", () => {
    test("reflects the payload as text, not HTML", async ({ page }) => {
      const xssPayload = '<script>alert("XSS")</script>';
      let dialogFired = false;
      page.on("dialog", (dialog) => {
        dialogFired = true;
        dialog.dismiss().catch(() => {});
      });

      await page.goto("/forms");
      await page.getByTestId("fullname-input").fill(xssPayload);
      const echo = page.getByTestId("xss-echo");
      await expect(echo).toHaveText(xssPayload);
      expect(await echo.evaluate((el) => el.childElementCount)).toBe(0);

      await page.getByTestId("text-submit-btn").click();
      const tbody = page.getByTestId("output-tbody");
      await expect(tbody).toContainText(xssPayload);
      expect(await tbody.locator("script").count()).toBe(0);
      expect(dialogFired).toBe(false);
    });
  });

  test.describe("Broken Access Control", () => {
    test("redirects unauthenticated users away from /dashboard", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByTestId("login-container")).toBeVisible();
    });
  });

  test.describe("Security Misconfiguration (Headers)", () => {
    test("sends nosniff, DENY framing, and no X-Powered-By", async ({
      request,
    }) => {
      const response = await request.get("/");
      const headers = response.headers();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["referrer-policy"]).toBe("no-referrer");
      expect(headers["x-powered-by"]).toBeUndefined();
    });
  });

  test.describe("Insecure Design (Cookie Flags)", () => {
    test("sets HttpOnly on the auth cookie after UI login", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.login(
        testData.validCredentials.emailId,
        testData.validCredentials.password,
      );
      await expect(page).toHaveURL(/\/dashboard/);
      const cookies = await page.context().cookies();
      const authCookie = cookies.find((c) => c.name === "authToken");
      expect(authCookie, "authToken cookie after login").toBeTruthy();
      expect(authCookie?.httpOnly).toBe(true);
      expect(authCookie?.secure).toBe(false);
    });
  });
});
