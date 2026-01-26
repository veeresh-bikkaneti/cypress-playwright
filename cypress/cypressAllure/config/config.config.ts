/**
 * ============================================================================
 * CYPRESS CONFIGURATION - Test Application
 * ============================================================================
 * 
 * PURPOSE:
 * This configuration file sets up Cypress for the self-contained test 
 * application. It configures the local Docker-based test server.
 * 
 * CONFIGURATION FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                      CYPRESS CONFIGURATION                              │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────────┐   baseUrl     ┌─────────────────┐                 │
 * │  │   Cypress       │ ────────────► │   Test App      │                 │
 * │  │   Tests         │               │   localhost:3000│                 │
 * │  └─────────────────┘               └─────────────────┘                 │
 * │         │                                                               │
 * │         │ specPattern                                                   │
 * │         ▼                                                               │
 * │  ┌─────────────────────────────────────────────────────┐               │
 * │  │   cypress/e2e/tests/**/*.test.ts                    │               │
 * │  │   - api.test.ts                                     │               │
 * │  │   - forms.test.ts                                   │               │
 * │  │   - dialogs.test.ts                                 │               │
 * │  │   - browser.test.ts                                 │               │
 * │  │   - storage.test.ts                                 │               │
 * │  └─────────────────────────────────────────────────────┘               │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * USAGE:
 * - Local development: npm run cy: open
  * - CI / CD headless: npm run cy: run
    * - With Docker: docker - compose up
      * 
 * @author Veeresh Bikkaneti
  */

import { defineConfig } from 'cypress';

export default defineConfig({
  // ==========================================================================
  // VIDEO & SCREENSHOT SETTINGS
  // ==========================================================================

  /**
   * Enable video recording for debugging failed tests
   */
  video: true,

  /**
   * Store screenshots in reports directory
   */
  screenshotsFolder: 'reports/screenshots',

  /**
   * Store videos in reports directory
   */
  videosFolder: 'reports/videos',

  // ==========================================================================
  // TIMEOUT SETTINGS
  // ==========================================================================

  /**
   * Default timeout for cy.get() and other commands
   * Increased to 10s for slower test environments
   */
  defaultCommandTimeout: 10000,

  /**
   * Timeout for cy.exec() commands
   */
  execTimeout: 10000,

  /**
   * Timeout for cy.task() commands
   */
  taskTimeout: 10000,

  /**
   * Timeout for page loads
   * Increased for Docker environments
   */
  pageLoadTimeout: 60000,

  /**
   * Timeout for cy.request()
   */
  requestTimeout: 10000,

  /**
   * Timeout for responses
   */
  responseTimeout: 60000,

  // ==========================================================================
  // VIEWPORT SETTINGS
  // ==========================================================================

  /**
   * Default viewport width
   */
  viewportWidth: 1280,

  /**
   * Default viewport height
   */
  viewportHeight: 720,

  // ==========================================================================
  // RETRY SETTINGS
  // ==========================================================================

  /**
   * Retry failed tests
   * - runMode: CI/CD headless mode
   * - openMode: Interactive mode
   */
  retries: {
    runMode: 2,
    openMode: 0
  },

  // ==========================================================================
  // ENVIRONMENT VARIABLES
  // ==========================================================================

  env: {
    /**
     * Enable Allure reporting
     */
    allure: true,

    /**
     * Allure results path
     */
    allureResultsPath: 'reports/ui/allure-results'
  },

  // ==========================================================================
  // E2E CONFIGURATION
  // ==========================================================================

  e2e: {
    /**
     * Base URL for the test application
     * - Local: http://localhost:3000
     * - Docker: http://test-app:3000 (set via CYPRESS_baseUrl env var)
     */
    baseUrl: 'http://localhost:3000',

    /**
     * Pattern for test files
     */
    specPattern: 'cypress/e2e/tests/**/*.test.ts',

    /**
     * Support file path
     */
    supportFile: 'cypress/support/e2e.ts',

    /**
     * Fixtures folder path
     */
    fixturesFolder: 'cypress/fixtures',

    /**
     * Setup Node events for plugins
     * This is where you configure:
     * - Allure plugin
     * - Custom tasks
     * - Browser launch options
     */
    setupNodeEvents(on, config) {
      // ====================================================================
      // ALLURE PLUGIN SETUP
      // ====================================================================

      // Import and setup Allure
      // Note: This requires @shelex/cypress-allure-plugin
      const allureWriter = require('@shelex/cypress-allure-plugin/writer');
      allureWriter(on, config);

      // ====================================================================
      // CUSTOM TASKS
      // ====================================================================

      on('task', {
        /**
         * Log to Node console
         * Useful for debugging
         */
        log(message: string) {
          console.log(message);
          return null;
        },

        /**
         * Get current timestamp
         * Useful for testing time-based features
         */
        getTimestamp() {
          return Date.now();
        },

        /**
         * Read file from filesystem
         * For advanced file operations
         */
        readFileMaybe(filename: string) {
          const fs = require('fs');
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename, 'utf8');
          }
          return null;
        }
      });

      // ====================================================================
      // BROWSER LAUNCH OPTIONS
      // ====================================================================

      on('before:browser:launch', (browser, launchOptions) => {
        // Add Chrome flags for better CI performance
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }

        return launchOptions;
      });

      return config;
    }
  }
});
