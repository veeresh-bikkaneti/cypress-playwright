/**
 * ============================================================================
 * SESSION TESTING - Caching Authentication State
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates cy.session() to cache and restore cookies, localStorage, and 
 * sessionStorage to reduce test setup time.
 * 
 * CAPABILITIES DEMONSTRATED:
 * - cy.session()
 * - cy.login() (custom command efficient usage)
 * - Validating session restoration
 * 
 * @author Veeresh Bikkaneti
 */

describe('Session Testing - Caching / Restore', () => {

    const testUser = {
        email: 'test@example.com',
        password: 'password123'
    };

    /**
     * Define the login session
     * This function will run once per session id, then restore from cache
     */
    const login = (user: typeof testUser) => {
        cy.session([user.email], () => {
            cy.visit('/login');
            cy.get('[data-testid="email-input"]').type(user.email);
            cy.get('[data-testid="password-input"]').type(user.password);
            cy.get('[data-testid="submit-btn"]').click();

            // Wait for redirect or success indicator to ensure session is established
            cy.url().should('include', '/dashboard');
            cy.getCookie('authToken').should('exist');
        });
    };

    /**
     * Test 1: First test uses the session
     */
    it('should log in via session for Test 1', () => {
        login(testUser);

        // Visit protected page directly
        cy.visit('/dashboard');

        // verify we are logged in
        cy.get('h1').should('contain', 'Dashboard');
    });

    /**
     * Test 2: Second test restores the session (much faster)
     */
    it('should restore session for Test 2 behavior', () => {
        login(testUser);

        // Visit the dashboard again - session should be restored
        cy.visit('/dashboard');

        // Verify access without relogging
        cy.get('[data-testid="page-title"]').should('contain', 'Dashboard');
        cy.get('[data-testid="sidebar"]').should('be.visible');
    });

    /**
     * Test 3: Navigate using sidebar after session restore
     */
    it('should allow navigation with restored session', () => {
        login(testUser);

        cy.visit('/dashboard');

        // Use sidebar navigation
        cy.get('[data-testid="nav-orders"]').click();

        // Verify orders section is visible (it's within the same dashboard page)
        cy.get('[data-testid="orders-section"]').should('be.visible');
    });

    /**
     * Test 4: Clear session
     */
    it('should handle session clearing', () => {
        // Clear all sessions
        Cypress.session.clearAllSavedSessions();

        // Clear any remaining auth tokens
        cy.clearLocalStorage('authToken');
        cy.clearCookies();

        cy.visit('/dashboard');

        // Without a valid session, dashboard should show auth warning
        cy.get('[data-testid="auth-warning"]').should('be.visible');
    });
});
