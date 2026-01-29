/**
 * ============================================================================
 * CROSS-ORIGIN TESTING - cy.origin()
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates Cypress's ability to visit and interact with pages on different 
 * superdomains using cy.origin().
 * 
 * CAPABILITIES DEMONSTRATED:
 * - cy.origin()
 * - Cross-domain navigation
 * - Executing commands in a different origin context
 * 
 * @author Veeresh Bikkaneti
 */

describe('Cross-Origin Testing', () => {

    /**
     * Visit an external domain
     * NOTE: This requires internet access. If offline, this test will fail.
     */
    it('should verify title of an external website', () => {
        // Visit the primary origin first (localhost)
        cy.visit('/');

        // Navigate to secondary origin (127.0.0.1:3001)
        cy.visit('http://127.0.0.1:3001');

        // Commands inside this block run in the context of the new origin
        cy.origin('http://127.0.0.1:3001', () => {
            // Check title exists (don't assume specific content)
            cy.title().should('not.be.empty');
            // Check for element present on our test app page
            cy.get('h1, h2, .header, [data-testid="page-title"]').should('exist');
        });
    });

    /**
     * Interact with elements on external domain
     */
    it('should interact with elements on external domain', () => {
        cy.visit('http://127.0.0.1:3001/login.html'); // Assuming login page exists

        // Use flexible selectors for email input
        cy.get('#email, [data-testid="email-input"], input[type="email"], input[name="email"]')
            .first()
            .type('test@example.com');
        cy.get('#email, [data-testid="email-input"], input[type="email"], input[name="email"]')
            .first()
            .should('have.value', 'test@example.com');
    });
});
