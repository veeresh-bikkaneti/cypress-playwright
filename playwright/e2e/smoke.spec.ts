import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

// ============================================================================
// SMOKE TEST - Verify Basic Connectivity + Test App Integration
// ============================================================================

test.describe("Smoke Test - Basic Verification", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("main-heading")).toBeVisible();
    await expect(page).toHaveTitle(/Cypress Test Application/);
  });

  test("should load products from API", async ({ page }) => {
    await page.goto("/");
    // Wait for products to load
    await expect(page.getByTestId("products-grid")).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible({
      timeout: 10000,
    });
    expect(await page.getByTestId("product-card").count()).toBeGreaterThan(0);
  });

  test("should navigate to login page", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await expect(loginPage.emailAddressTxt).toBeVisible();
    await expect(loginPage.passwordTxt).toBeVisible();
    await expect(loginPage.signinBtn).toBeVisible();
  });

  test("should make a direct API request", async ({ request }) => {
    const response = await request.get("/api/products");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("should login successfully via UI", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login("test@example.com", "password123");
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test("should login via API and access dashboard", async ({
    request,
    page,
  }) => {
    // Login via API
    const response = await request.post("/api/auth/login", {
      data: {
        email: "test@example.com",
        password: "password123",
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeDefined();

    // Inject token into browser context
    await page.goto("/");
    await page.evaluate(
      ({ token, user }) => {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
      },
      { token: body.token, user: body.user },
    );

    // Now visit dashboard
    await page.goto("/dashboard");
    await expect(page.getByTestId("auth-warning")).toHaveClass(/hidden/);
  });
});
