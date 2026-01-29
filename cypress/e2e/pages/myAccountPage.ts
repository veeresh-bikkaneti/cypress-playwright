/// <reference types="cypress" />

import { loginPage } from "./loginPage"

/**
 * MyAccountPage - Page Object for the dashboard/account pages
 * 
 * Uses data-testid selectors compatible with the self-contained test application
 * located at cypress/test-app/public/dashboard.html
 */
class MyAccountPage {
    // Dashboard header elements
    get pageTitle() { return cy.get('[data-testid="page-title"]') }
    get userInfo() { return cy.get('[data-testid="user-info"]') }
    get userName() { return cy.get('[data-testid="user-name"]') }
    get userEmail() { return cy.get('[data-testid="user-email"]') }
    get userAvatar() { return cy.get('[data-testid="user-avatar"]') }

    // Sidebar navigation
    get sidebar() { return cy.get('[data-testid="sidebar"]') }
    get sidebarNav() { return cy.get('[data-testid="sidebar-nav"]') }
    get navOverview() { return cy.get('[data-testid="nav-overview"]') }
    get navOrders() { return cy.get('[data-testid="nav-orders"]') }
    get navProducts() { return cy.get('[data-testid="nav-products"]') }
    get navSettings() { return cy.get('[data-testid="nav-settings"]') }
    get logoutLink() { return cy.get('[data-testid="logout-link"]') }

    // Dashboard content
    get dashboardHeader() { return cy.get('[data-testid="dashboard-header"]') }
    get mainContent() { return cy.get('[data-testid="main-content"]') }
    get statsGrid() { return cy.get('[data-testid="stats-grid"]') }

    // Orders section
    get ordersSection() { return cy.get('[data-testid="orders-section"]') }
    get ordersTable() { return cy.get('[data-testid="orders-table"]') }
    get createOrderBtn() { return cy.get('[data-testid="create-order-btn"]') }

    // Storage section
    get storageSection() { return cy.get('[data-testid="storage-section"]') }
    get setCookieBtn() { return cy.get('[data-testid="set-cookie-btn"]') }
    get getCookieBtn() { return cy.get('[data-testid="get-cookie-btn"]') }
    get clearCookiesBtn() { return cy.get('[data-testid="clear-cookies-btn"]') }
    get setStorageBtn() { return cy.get('[data-testid="set-storage-btn"]') }
    get clearStorageBtn() { return cy.get('[data-testid="clear-storage-btn"]') }
    get storageResult() { return cy.get('[data-testid="storage-result"]') }

    public validateSuccessfulLogin() {
        // Check that we're on the dashboard and can see the main heading
        this.pageTitle.should('contain.text', 'Dashboard')
    }

    public validateUserInfo(name: string, email: string) {
        this.userName.should('contain.text', name)
        this.userEmail.should('contain.text', email)
    }

    public logout() {
        this.logoutLink.click()
    }

    public validateSuccessfulLogout() {
        // After logout, we should be redirected to login page
        cy.url().should('include', '/login')
        loginPage.loginContainer.should('be.visible')
    }

    public navigateToOrders() {
        this.navOrders.click()
    }

    public navigateToProducts() {
        this.navProducts.click()
    }

    public navigateToSettings() {
        this.navSettings.click()
    }
}

export const myAccountPage: MyAccountPage = new MyAccountPage()