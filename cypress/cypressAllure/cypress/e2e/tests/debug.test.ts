describe('Debug Page Load', () => {
    it('should load home page and print title', () => {
        cy.visit('/');
        cy.title().then(t => cy.log('Page Title:', t));
        cy.get('body').then($body => {
            cy.log('Body Text Length:', $body.text().length);
            // Log first 100 chars
            cy.log('Body Start:', $body.text().substring(0, 100));
        });
        cy.get('[data-testid="main-heading"]', { timeout: 10000 }).should('be.visible');
    });
});
