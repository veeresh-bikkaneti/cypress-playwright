/**
 * ============================================================================
 * CYPRESS E2E SUPPORT FILE
 * ============================================================================
 * 
 * PURPOSE:
 * This file is processed and loaded automatically BEFORE test files.
 * It sets up global configurations and behaviors.
 * 
 * EXECUTION ORDER:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  1. Load support/e2e.ts                                                 │
 * │  2. Load custom commands                                                │
 * │  3. Load Allure plugin                                                  │
 * │  4. Execute global beforeEach hooks                                     │
 * │  5. Run test files                                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @author Veeresh Bikkaneti
 */

// Import custom commands
import './commands';

import 'cypress-mochawesome-reporter/register';
import 'cypress-plugin-api';
import 'cypress-real-events/support';
// Import Allure plugin for reporting
import '@shelex/cypress-allure-plugin';

// Import logging plugins for Agentic Support
import 'cypress-failed-log';
import 'cypress-terminal-report/src/installLogsCollector';

// ============================================================================
// GLOBAL CONFIGURATION
// ============================================================================

/**
 * Global beforeEach hook
 * Runs before each test in every spec file
 */
beforeEach(() => {
    // Clear cookies and storage for test isolation
    // This ensures each test starts with a clean state
    cy.clearCookies();
    cy.clearLocalStorage();

    // Log test start for debugging
    cy.log('**Test started with clean state**');
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle uncaught exceptions
 * 
 * IMPORTANT: This prevents tests from failing on uncaught JS errors.
 * In production testing, you may want to:
 * - Log the error for debugging
 * - Return true to fail the test on specific errors
 * - Return false to ignore expected errors
 * 
 * FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Uncaught Exception                                                     │
 * │       │                                                                 │
 * │       ▼                                                                 │
 * │  ┌─────────────────────┐     Return true      ┌───────────────────┐    │
 * │  │   Check error type  │ ───────────────────► │   Test FAILS      │    │
 * │  └─────────────────────┘                      └───────────────────┘    │
 * │       │                                                                 │
 * │       │ Return false                                                    │
 * │       ▼                                                                 │
 * │  ┌─────────────────────┐                                               │
 * │  │   Test CONTINUES    │                                               │
 * │  └─────────────────────┘                                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
Cypress.on('uncaught:exception', (err, runnable) => {
    // Log the error for debugging purposes
    console.error('Uncaught exception:', err.message);

    // List of known/expected errors to ignore
    const ignoredErrors = [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Script error.'
    ];

    // Check if error should be ignored
    for (const ignored of ignoredErrors) {
        if (err.message.includes(ignored)) {
            return false; // Prevent test failure
        }
    }

    // Return false to prevent the error from failing the test
    // Change to 'return true' to fail tests on all uncaught exceptions
    return false;
});

// ============================================================================
// WINDOW EVENT HANDLERS
// ============================================================================

/**
 * Handle window:alert events
 * This allows Cypress to automatically dismiss alerts
 */
Cypress.on('window:alert', (text) => {
    cy.log(`**Alert received:** ${text}`);
    // Returning nothing automatically accepts the alert
});

/**
 * Handle window:confirm events
 * Default behavior: accept (return true)
 */
Cypress.on('window:confirm', (text) => {
    cy.log(`**Confirm received:** ${text}`);
    return true; // Accept the confirmation
});

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================

/**
 * Set default viewport size before each test
 * This ensures consistent viewport across tests
 */
beforeEach(() => {
    // Set to desktop viewport by default
    cy.viewport(1280, 720);
});

// ============================================================================
// ALLURE REPORTING HOOKS
// ============================================================================

/**
 * Add environment info to Allure report
 */
before(() => {
    if (Cypress.env('allure')) {
        // These will appear in the Allure report environment section
        cy.allure()
            .writeEnvironmentInfo({
                Browser: Cypress.browser.name,
                BrowserVersion: Cypress.browser.version,
                Platform: Cypress.platform,
                CypressVersion: Cypress.version,
                BaseUrl: Cypress.config('baseUrl')
            });
    }
});

// Export for module resolution
export { };
