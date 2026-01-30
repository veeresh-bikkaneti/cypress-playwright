import { Page, Locator, expect } from '@playwright/test';
import { LoginPage } from './LoginPage';

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
        this.pageTitle = page.locator('[data-testid="page-title"]');
        this.userInfo = page.locator('[data-testid="user-info"]');
        this.userName = page.locator('[data-testid="user-name"]');
        this.userEmail = page.locator('[data-testid="user-email"]');
        this.userAvatar = page.locator('[data-testid="user-avatar"]');
        this.sidebar = page.locator('[data-testid="sidebar"]');
        this.sidebarNav = page.locator('[data-testid="sidebar-nav"]');
        this.navOverview = page.locator('[data-testid="nav-overview"]');
        this.navOrders = page.locator('[data-testid="nav-orders"]');
        this.navProducts = page.locator('[data-testid="nav-products"]');
        this.navSettings = page.locator('[data-testid="nav-settings"]');
        this.logoutLink = page.locator('[data-testid="logout-link"]');
        this.dashboardHeader = page.locator('[data-testid="dashboard-header"]');
        this.mainContent = page.locator('[data-testid="main-content"]');
        this.statsGrid = page.locator('[data-testid="stats-grid"]');
        this.ordersSection = page.locator('[data-testid="orders-section"]');
        this.ordersTable = page.locator('[data-testid="orders-table"]');
        this.createOrderBtn = page.locator('[data-testid="create-order-btn"]');
        this.storageSection = page.locator('[data-testid="storage-section"]');
        this.setCookieBtn = page.locator('[data-testid="set-cookie-btn"]');
        this.getCookieBtn = page.locator('[data-testid="get-cookie-btn"]');
        this.clearCookiesBtn = page.locator('[data-testid="clear-cookies-btn"]');
        this.setStorageBtn = page.locator('[data-testid="set-storage-btn"]');
        this.clearStorageBtn = page.locator('[data-testid="clear-storage-btn"]');
        this.storageResult = page.locator('[data-testid="storage-result"]');
    }

    async validateSuccessfulLogin() {
        await expect(this.pageTitle).toContainText('Dashboard');
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
