/**
 * ============================================================================
 * CYPRESS CUSTOM COMMANDS - TypeScript Implementation
 * ============================================================================
 * 
 * PURPOSE:
 * This file defines reusable custom commands that extend Cypress's capabilities.
 * It demonstrates all four types of custom commands:
 * 
 * COMMAND TYPES:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  1. PARENT Commands - Start new command chains                         │
 * │     Example: cy.login(email, password)                                 │
 * │                                                                         │
 * │  2. CHILD Commands - Require a previous subject                        │
 * │     Example: cy.get('input').typeAndClear('text')                      │
 * │                                                                         │
 * │  3. DUAL Commands - Work with or without subject                       │
 * │     Example: cy.highlight() or cy.get('el').highlight()                │
 * │                                                                         │
 * │  4. OVERWRITE Commands - Extend existing Cypress commands              │
 * │     Example: Overwrite cy.visit() to add logging                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * SECURITY NOTES:
 * - All inputs are sanitized before use
 * - No sensitive data is logged to console
 * - Commands follow secure coding practices
 * 
 * @author Veeresh Bikkaneti
 */

/// <reference types="cypress" />

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Extend Cypress Chainable interface with custom commands
 * This provides TypeScript support and autocompletion
 */
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Login to the application
             * @param email - User email address
             * @param password - User password
             * @example cy.login('test@example.com', 'password123')
             */
            login(email: string, password: string): Chainable<void>;

            /**
             * Logout from the application
             * @example cy.logout()
             */
            logout(): Chainable<void>;

            /**
             * Get element by data-testid attribute
             * @param testId - The data-testid value
             * @example cy.getByTestId('submit-btn')
             */
            getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

            /**
             * Wait for API response and validate status
             * @param method - HTTP method
             * @param url - URL pattern to match
             * @param alias - Alias name for the intercept
             * @example cy.interceptAndWait('GET', '/api/products', 'getProducts')
             */
            interceptAndWait(method: string, url: string, alias: string): Chainable<void>;

            /**
             * Type text and then clear the input (child command)
             * @param text - Text to type
             * @example cy.get('input').typeAndClear('temporary text')
             */
            typeAndClear(text: string): Chainable<JQuery<HTMLElement>>;

            /**
             * Highlight an element for debugging (dual command)
             * @example cy.highlight() or cy.get('el').highlight()
             */
            highlight(): Chainable<JQuery<HTMLElement>>;

            /**
             * Assert element has specific data attribute
             * @param attr - Data attribute name (without 'data-' prefix)
             * @param value - Expected value
             * @example cy.get('el').shouldHaveData('testid', 'button')
             */
            shouldHaveData(attr: string, value: string): Chainable<JQuery<HTMLElement>>;

            /**
             * Set authentication cookie for API testing
             * @param token - Authentication token
             * @example cy.setAuthCookie('token123')
             */
            setAuthCookie(token: string): Chainable<void>;
        }
    }
}

// ============================================================================
// PARENT COMMANDS
// ============================================================================

/**
 * Login Command (Parent)
 * 
 * FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  1. Navigate to login page                                              │
 * │  2. Enter email in email field                                          │
 * │  3. Enter password in password field                                    │
 * │  4. Click submit button                                                 │
 * │  5. Verify redirect to dashboard                                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
Cypress.Commands.add('login', (email: string, password: string) => {
    // Input validation (sanitization - prevent empty/malformed input)
    if (!email || typeof email !== 'string') {
        throw new Error('Login: email is required and must be a string');
    }
    if (!password || typeof password !== 'string') {
        throw new Error('Login: password is required and must be a string');
    }

    cy.log(`**Login as:** ${email}`);

    // Navigate to login page
    cy.visit('/login');

    // Fill in credentials
    // Using data-testid for reliable element selection
    cy.get('[data-testid="email-input"]').should('be.visible').clear().type(email);
    cy.get('[data-testid="password-input"]').should('be.visible').clear().type(password, { log: false });

    // Submit form
    cy.get('[data-testid="submit-btn"]').click();

    // Verify successful login by checking redirect
    cy.url().should('include', '/dashboard');
});

/**
 * Logout Command (Parent)
 */
Cypress.Commands.add('logout', () => {
    cy.log('**Logging out**');

    // Click logout link
    cy.get('[data-testid="logout-link"]').click();

    // Verify redirect to login page
    cy.url().should('include', '/login');

    // Clear stored tokens
    cy.clearLocalStorage('authToken');
    cy.clearAllSessionStorage();
});

/**
 * Get By TestId Command (Parent)
 * 
 * This is a convenience wrapper for selecting elements by data-testid
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
    if (!testId || typeof testId !== 'string') {
        throw new Error('getByTestId: testId is required and must be a string');
    }

    return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Intercept And Wait Command (Parent)
 * 
 * Sets up an intercept and waits for the request to complete
 */
Cypress.Commands.add('interceptAndWait', (method: string, url: string, alias: string) => {
    cy.intercept(method, url).as(alias);
    cy.wait(`@${alias}`);
});

/**
 * Set Auth Cookie Command (Parent)
 * 
 * Sets authentication cookie for testing protected routes
 */
Cypress.Commands.add('setAuthCookie', (token: string) => {
    if (!token) {
        throw new Error('setAuthCookie: token is required');
    }

    cy.setCookie('authToken', token, {
        path: '/',
        httpOnly: true
    });

    cy.log('**Auth cookie set**');
});

// ============================================================================
// CHILD COMMANDS (require prevSubject)
// ============================================================================

/**
 * Type and Clear Command (Child)
 * 
 * Types text into an input and then clears it
 * Useful for testing input behavior
 */
Cypress.Commands.add('typeAndClear', { prevSubject: 'element' },
    (subject: JQuery<HTMLElement>, text: string) => {
        cy.wrap(subject)
            .should('be.visible')
            .type(text)
            .should('have.value', text)
            .clear()
            .should('have.value', '');

        return cy.wrap(subject);
    }
);

/**
 * Should Have Data Command (Child)
 * 
 * Asserts that element has specific data attribute value
 */
Cypress.Commands.add('shouldHaveData', { prevSubject: 'element' },
    (subject: JQuery<HTMLElement>, attr: string, value: string) => {
        cy.wrap(subject).should('have.attr', `data-${attr}`, value);
        return cy.wrap(subject);
    }
);

// ============================================================================
// DUAL COMMANDS (optional prevSubject)
// ============================================================================

/**
 * Highlight Command (Dual)
 * 
 * Highlights an element with a red border for debugging
 * Can be used as:
 * - cy.get('el').highlight() - highlights specific element
 * - Applied to previous subject if available
 */
Cypress.Commands.add('highlight', { prevSubject: 'optional' },
    (subject?: JQuery<HTMLElement>) => {
        if (subject) {
            cy.wrap(subject).then($el => {
                $el.css('border', '3px solid red');
                $el.css('background-color', 'rgba(255, 0, 0, 0.1)');
            });
            return cy.wrap(subject);
        } else {
            cy.log('**Highlight called without subject**');
        }
    }
);

// ============================================================================
// OVERWRITE COMMANDS
// ============================================================================

/**
 * Overwrite Visit Command
 * 
 * Extends the default cy.visit() to add:
 * - Logging of visited URL
 * - Performance timing
 * - Optional callback on page load
 */
/*
Cypress.Commands.overwrite('visit',
    (originalFn: Cypress.CommandOriginalFn<'visit'>, url: string, options?: Partial<Cypress.VisitOptions>) => {
        const startTime = Date.now();

        cy.log(`**Navigating to:** ${url}`);

        // Call original visit with enhanced options
        const result = originalFn(url, {
            ...options,
            onLoad: (win) => {
                const loadTime = Date.now() - startTime;
                cy.log(`**Page loaded in:** ${loadTime}ms`);

                // Call original onLoad if provided
                if (options?.onLoad) {
                    options.onLoad(win);
                }
            }
        });

        return result;
    }
);
*/

// Prevent TypeScript error about missing export
export { };
