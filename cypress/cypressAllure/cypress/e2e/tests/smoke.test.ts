/**
 * ============================================================================
 * SMOKE TEST - Verify Basic Cypress + Test App Integration
 * ============================================================================
 * 
 * PURPOSE:
 * A simple smoke test to verify that:
 * 1. The test app is running
 * 2. Cypress can connect to it
 * 3. Basic assertions work
 * 
 * @author Veeresh Bikkaneti
 */

describe('Smoke Test - Basic Verification', () => {

    it('should load the home page', () => {
        cy.visit('/');
        cy.get('[data-testid="main-heading"]').should('be.visible');
        cy.title().should('include', 'Cypress Test Application');
    });

    it('should load products from API', () => {
        cy.visit('/');
        // Wait for products to load
        cy.get('[data-testid="products-grid"]').should('be.visible');
        cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });

    it('should navigate to login page', () => {
        cy.visit('/login');
        cy.get('[data-testid="login-form"]').should('be.visible');
        cy.get('[data-testid="email-input"]').should('be.visible');
        cy.get('[data-testid="password-input"]').should('be.visible');
        cy.get('[data-testid="submit-btn"]').should('be.visible');
    });

    it('should make a direct API request', () => {
        cy.request('GET', '/api/products').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.products).to.be.an('array');
            expect(response.body.products.length).to.be.greaterThan(0);
        });
    });

    it('should login successfully via UI', () => {
        cy.visit('/login');
        cy.get('[data-testid="email-input"]').type('test@example.com');
        cy.get('[data-testid="password-input"]').type('password123');
        cy.get('[data-testid="submit-btn"]').click();

        // Wait for redirect to dashboard
        cy.url().should('include', '/dashboard', { timeout: 10000 });
    });

    it('should login via API and access dashboard', () => {
        // Login via API
        cy.request({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'test@example.com',
                password: 'password123'
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.token).to.exist;

            // Store token
            cy.window().then((win) => {
                win.localStorage.setItem('authToken', response.body.token);
                win.localStorage.setItem('user', JSON.stringify(response.body.user));
            });
        });

        // Now visit dashboard
        cy.visit('/dashboard');
        cy.get('[data-testid="auth-warning"]').should('have.class', 'hidden');
    });
});
