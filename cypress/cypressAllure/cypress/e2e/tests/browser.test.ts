/**
 * ============================================================================
 * BROWSER TESTING - Viewport, Scroll, Window & Document
 * ============================================================================
 * 
 * PURPOSE:
 * Demonstrates Cypress's browser control capabilities including:
 * - cy.viewport() - Responsive testing
 * - cy.scrollTo() / cy.scrollIntoView() - Scroll control
 * - cy.window() / cy.document() - Access window and document
 * - cy.title() / cy.url() / cy.location() - Page info assertions
 * - cy.go() / cy.reload() - Navigation control
 * 
 * VIEWPORT TESTING FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                       VIEWPORT TESTING                                  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
 * │  │     Mobile      │  │     Tablet      │  │     Desktop     │         │
 * │  │   320 x 568     │  │   768 x 1024    │  │   1280 x 720    │         │
 * │  │   iPhone SE     │  │   iPad          │  │   HD Screen     │         │
 * │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
 * │                                                                         │
 * │  cy.viewport(width, height) or cy.viewport('preset')                   │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @author Veeresh Bikkaneti
 */

describe('Browser Testing - Viewport, Scroll & Navigation', () => {

    // ==========================================================================
    // cy.viewport() - Responsive Testing
    // ==========================================================================

    describe('cy.viewport() - Responsive Testing', () => {

        beforeEach(() => {
            cy.visit('/');
        });

        /**
         * Set viewport by dimensions
         */
        it('should set viewport by dimensions', () => {
            cy.viewport(1920, 1080);

            // Verify viewport affects layout
            cy.getByTestId('main-heading').should('be.visible');
        });

        /**
         * Test mobile viewport
         */
        it('should test mobile viewport', () => {
            cy.viewport(375, 667); // iPhone SE

            // Mobile-specific assertions
            cy.getByTestId('main-nav').should('be.visible');
        });

        /**
         * Test tablet viewport
         */
        it('should test tablet viewport', () => {
            cy.viewport(768, 1024); // iPad

            cy.getByTestId('products-grid').should('be.visible');
        });

        /**
         * Use preset viewport names
         */
        it('should use preset viewport names', () => {
            const presets = [
                'iphone-6',
                'iphone-x',
                'ipad-2',
                'macbook-13',
                'macbook-15'
            ];

            presets.forEach(preset => {
                cy.viewport(preset);
                cy.getByTestId('main-heading').should('be.visible');
            });
        });

        /**
         * Test landscape orientation
         */
        it('should test landscape orientation', () => {
            cy.viewport('iphone-6', 'landscape');

            cy.getByTestId('main-heading').should('be.visible');
        });

        /**
         * Responsive breakpoint testing
         */
        it('should test all responsive breakpoints', () => {
            const breakpoints = [
                { name: 'xs', width: 320, height: 568 },
                { name: 'sm', width: 576, height: 800 },
                { name: 'md', width: 768, height: 1024 },
                { name: 'lg', width: 992, height: 800 },
                { name: 'xl', width: 1200, height: 900 },
                { name: 'xxl', width: 1400, height: 900 }
            ];

            breakpoints.forEach(bp => {
                cy.viewport(bp.width, bp.height);
                cy.log(`Testing ${bp.name} breakpoint: ${bp.width}x${bp.height}`);
                cy.getByTestId('products-section').should('be.visible');
            });
        });
    });

    // ==========================================================================
    // cy.scrollTo() / cy.scrollIntoView() - Scroll Control
    // ==========================================================================

    describe('Scroll Control', () => {

        beforeEach(() => {
            cy.visit('/');
        });

        /**
         * Scroll to position
         */
        it('should scroll to specific position', () => {
            cy.scrollTo(0, 500);

            // Verify scroll position
            cy.window().its('scrollY').should('be.greaterThan', 0);
        });

        /**
         * Scroll to bottom
         */
        it('should scroll to bottom of page', () => {
            cy.scrollTo('bottom');

            cy.getByTestId('scroll-section').should('be.visible');
        });

        /**
         * Scroll to top
         */
        it('should scroll to top of page', () => {
            cy.scrollTo('bottom');
            cy.scrollTo('top');

            cy.window().its('scrollY').should('equal', 0);
        });

        /**
         * Scroll to element
         */
        it('should scroll element into view', () => {
            cy.getByTestId('scroll-section').scrollIntoView();

            cy.getByTestId('scroll-section').should('be.visible');
        });

        /**
         * Scroll with animation
         */
        it('should scroll with smooth animation', () => {
            cy.scrollTo('bottom', { duration: 1000 });

            cy.getByTestId('scroll-section').should('be.visible');
        });

        /**
         * Scroll within element
         */
        it('should scroll within a container element', () => {
            // If there's a scrollable container
            cy.getByTestId('products-grid').scrollTo('right', { ensureScrollable: false });
        });

        /**
         * Use scroll button
         */
        it('should use scroll to top button', () => {
            cy.scrollTo('bottom');
            cy.getByTestId('scroll-to-top-btn').click();

            // Wait for smooth scroll
            cy.wait(500);
            cy.window().its('scrollY').should('be.lessThan', 100);
        });
    });

    // ==========================================================================
    // cy.window() / cy.document() - Window & Document Access
    // ==========================================================================

    describe('Window & Document Access', () => {

        beforeEach(() => {
            cy.visit('/');
        });

        /**
         * Access window object
         */
        it('should access window object', () => {
            cy.window().then((win) => {
                expect(win).to.have.property('document');
                expect(win).to.have.property('localStorage');
                expect(win).to.have.property('location');
            });
        });

        /**
         * Access window properties
         */
        it('should access window properties using .its()', () => {
            cy.window()
                .its('innerWidth')
                .should('be.greaterThan', 0);

            cy.window()
                .its('innerHeight')
                .should('be.greaterThan', 0);
        });

        /**
         * Access document object
         */
        it('should access document object', () => {
            cy.document().then((doc) => {
                expect(doc).to.have.property('body');
                expect(doc).to.have.property('head');
                expect(doc.contentType).to.equal('text/html');
            });
        });

        /**
         * Get document properties
         */
        it('should get document properties', () => {
            cy.document()
                .its('readyState')
                .should('equal', 'complete');

            cy.document()
                .its('charset')
                .should('equal', 'UTF-8');
        });

        /**
         * Manipulate window object
         */
        it('should manipulate window object for testing', () => {
            cy.window().then((win) => {
                // Set custom property for testing
                win.testFlag = true;
            });

            cy.window()
                .its('testFlag')
                .should('equal', true);
        });
    });

    // ==========================================================================
    // cy.title() / cy.url() / cy.location() - Page Info
    // ==========================================================================

    describe('Page Info Assertions', () => {

        /**
         * Assert page title
         */
        it('should assert page title', () => {
            cy.visit('/');
            cy.title().should('include', 'Cypress Test Application');
        });

        /**
         * Assert URL
         */
        it('should assert URL', () => {
            cy.visit('/login');
            cy.url().should('include', '/login');
        });

        /**
         * Assert location properties
         */
        it('should assert location properties', () => {
            cy.visit('/forms');

            cy.location('pathname').should('equal', '/forms');
            cy.location('protocol').should('equal', 'http:');
            cy.location('host').should('not.be.empty');
        });

        /**
         * Assert hash fragment
         */
        it('should assert URL hash', () => {
            cy.visit('/dialogs');

            // Navigate with hash
            cy.get('[href="#overview"]').first().click({ force: true });

            // Note: The dialogs page may not have these links, 
            // this is a pattern demonstration
        });

        /**
         * Assert query parameters
         */
        it('should assert query parameters', () => {
            cy.visit('/?filter=active&sort=date');

            cy.location('search').should('include', 'filter=active');
            cy.location('search').should('include', 'sort=date');
        });
    });

    // ==========================================================================
    // cy.go() / cy.reload() - Navigation
    // ==========================================================================

    describe('Navigation Control', () => {

        /**
         * Go back in history
         */
        it('should navigate back in history', () => {
            cy.visit('/');
            cy.visit('/login');

            cy.go('back');

            cy.url().should('not.include', '/login');
        });

        /**
         * Go forward in history
         */
        it('should navigate forward in history', () => {
            cy.visit('/');
            cy.visit('/login');
            cy.go('back');

            cy.go('forward');

            cy.url().should('include', '/login');
        });

        /**
         * Reload page
         */
        it('should reload the page', () => {
            cy.visit('/');

            // Make some state changes
            cy.getByTestId('load-content-btn').click();
            cy.getByTestId('loaded-content').should('be.visible');

            // Reload clears state
            cy.reload();

            // State should be reset
            cy.getByTestId('loaded-content').should('not.exist');
        });

        /**
         * Force reload (clear cache)
         */
        it('should force reload page', () => {
            cy.visit('/');

            // Force reload bypasses cache
            cy.reload(true);

            cy.getByTestId('main-heading').should('be.visible');
        });
    });

    // ==========================================================================
    // cy.screenshot() - Screenshots
    // ==========================================================================

    describe('Screenshots', () => {

        /**
         * Take full page screenshot
         */
        it('should take a full page screenshot', () => {
            cy.visit('/');

            cy.screenshot('home-page-full');
        });

        /**
         * Take element screenshot
         */
        it('should take element screenshot', () => {
            cy.visit('/');

            cy.getByTestId('products-section').screenshot('products-section');
        });

        /**
         * Screenshot with options
         */
        it('should take screenshot with options', () => {
            cy.visit('/');

            cy.screenshot('home-page-clip', {
                capture: 'viewport',
                overwrite: true
            });
        });
    });
});
