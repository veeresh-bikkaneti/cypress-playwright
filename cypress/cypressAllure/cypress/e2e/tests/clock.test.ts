/**
 * ============================================================================
 * TIME MANIPULATION - cy.clock() and cy.tick()
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates how to control the browser's clock to test time-dependent code
 * without waiting for real time to pass.
 * 
 * CAPABILITIES DEMONSTRATED:
 * - cy.clock() - Freeze time
 * - cy.tick() - Advance time
 * - Testing debounced inputs
 * - Testing setTimeouts / intervals
 * 
 * @author Veeresh Bikkaneti
 */

describe('Time Manipulation', () => {

    /**
     * Test a slow response simulation by manipulating clock
     * Note: This works best if the app uses setTimeout/setInterval.
     * If using native Promises/fetch, cy.clock() might behave differently depending on config.
     */
    it('should control application time', () => {
        const now = new Date(2023, 0, 1).getTime(); // Jan 1, 2023

        // Freeze the clock at a specific time
        cy.clock(now);

        cy.visit('/');

        // Verify the clock is overridden
        cy.window().then((win) => {
            expect(win.Date.now()).to.equal(now);
        });
    });

    /**
     * Simulating a timeout expiration
     */
    it('should trigger delayed actions instantly with cy.tick()', () => {
        cy.clock();
        cy.visit('/');

        // Imagine we have a button that shows a message after 5 seconds
        // For demonstration, we'll manually set a timeout in the window if the app doesn't have one handy
        cy.window().then((win) => {
            win.setTimeout(() => {
                const el = win.document.createElement('div');
                el.id = 'delayed-msg';
                el.innerText = 'Timeout Complete';
                win.document.body.appendChild(el);
            }, 5000);
        });

        // Verify message is NOT there yet
        cy.get('#delayed-msg').should('not.exist');

        // Advance time by 5 seconds
        cy.tick(5000);

        // Verify message appears immediately (from test perspective)
        cy.get('#delayed-msg').should('be.visible');
    });

    /**
     * Restoring the clock
     */
    it('should restore the clock', () => {
        cy.clock().invoke('restore');

        // Time should be moving again
        cy.window().then((win) => {
            const start = win.Date.now();
            // Use cy.wait instead of Promise to ensure time moves
            cy.wrap(null).then(() => {
                expect(win.Date.now()).to.be.greaterThan(start);
            });
        });
    });
});
