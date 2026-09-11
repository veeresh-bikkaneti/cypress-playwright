import { Page, Locator, expect } from "@playwright/test";
import { LoginPage } from "./LoginPage";

export class MyAccountPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly userInfo: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly userAvatar: Locator;
  readonly sidebar: Locator;
  readonly sidebarNav: Locator;
  readonly navOverview: Locator;
  readonly navOrders: Locator;
  readonly navProducts: Locator;
  readonly navSettings: Locator;
  readonly logoutLink: Locator;
  readonly dashboardHeader: Locator;
  readonly mainContent: Locator;
  readonly statsGrid: Locator;
  readonly overviewSection: Locator;
  readonly productsSection: Locator;
  readonly settingsSection: Locator;
  readonly ordersSection: Locator;
  readonly ordersTable: Locator;
  readonly createOrderBtn: Locator;
  readonly storageSection: Locator;
  readonly setCookieBtn: Locator;
  readonly getCookieBtn: Locator;
  readonly clearCookiesBtn: Locator;
  readonly setStorageBtn: Locator;
  readonly clearStorageBtn: Locator;
  readonly storageResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", {
      name: "Welcome to Dashboard",
    });
    this.userInfo = page.getByTestId("user-info");
    this.userName = page.getByTestId("user-name");
    this.userEmail = page.getByTestId("user-email");
    this.userAvatar = page.getByTestId("user-avatar");
    this.sidebar = page.getByTestId("sidebar");
    this.sidebarNav = page.getByTestId("sidebar-nav");
    this.navOverview = page.getByRole("link", { name: /Overview/ });
    this.navOrders = page.getByRole("link", { name: /Orders/ });
    this.navProducts = page.getByRole("link", { name: /Products/ });
    this.navSettings = page.getByRole("link", { name: /Settings/ });
    this.logoutLink = page.getByRole("link", { name: /Logout/ });
    this.dashboardHeader = page.getByTestId("dashboard-header");
    this.mainContent = page.getByTestId("main-content");
    this.statsGrid = page.getByTestId("stats-grid");
    this.overviewSection = page.getByTestId("stats-grid");
    this.productsSection = page.getByTestId("products-section");
    this.settingsSection = page.getByTestId("settings-section");
    this.ordersSection = page.getByTestId("orders-section");
    this.ordersTable = page.getByTestId("orders-table");
    this.createOrderBtn = page.getByRole("button", {
      name: /Create Test Order/,
    });
    this.storageSection = page.getByTestId("storage-section");
    this.setCookieBtn = page.getByRole("button", { name: "Set Test Cookie" });
    this.getCookieBtn = page.getByRole("button", { name: "Get Cookies" });
    this.clearCookiesBtn = page.getByRole("button", { name: /Clear Cookies/ });
    this.setStorageBtn = page.getByRole("button", { name: "Set localStorage" });
    this.clearStorageBtn = page.getByRole("button", {
      name: "Clear localStorage",
    });
    this.storageResult = page.getByTestId("storage-result");
  }

  async validateSuccessfulLogin() {
    await expect(this.pageTitle).toContainText("Dashboard");
  }

  async validateUserInfo(name: string, email: string) {
    await expect(this.userName).toContainText(name);
    await expect(this.userEmail).toContainText(email);
  }

  async logout() {
    await this.logoutLink.click();
  }

  async validateSuccessfulLogout() {
    await expect(this.page).toHaveURL(/.*\/login/);
    const loginPage = new LoginPage(this.page);
    await expect(loginPage.loginContainer).toBeVisible();
  }

  async navigateToOrders() {
    await this.navOrders.click();
  }

  async navigateToProducts() {
    await this.navProducts.click();
  }

  async navigateToSettings() {
    await this.navSettings.click();
  }
}
