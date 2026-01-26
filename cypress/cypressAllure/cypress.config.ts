import { defineConfig } from 'cypress';

export default defineConfig({
  // ==========================================================================
  // VIDEO & SCREENSHOT SETTINGS
  // ==========================================================================
  video: true,
  screenshotsFolder: 'reports/screenshots',
  videosFolder: 'reports/videos',

  // ==========================================================================
  // TIMEOUT SETTINGS (Optimized for Local Execution)
  // ==========================================================================
  defaultCommandTimeout: 2000,
  execTimeout: 5000,
  taskTimeout: 10000,
  pageLoadTimeout: 10000,
  requestTimeout: 3000,
  responseTimeout: 10000,

  // ==========================================================================
  // VIEWPORT SETTINGS
  // ==========================================================================
  viewportWidth: 1280,
  viewportHeight: 720,

  // ==========================================================================
  // RETRY SETTINGS
  // ==========================================================================
  retries: {
    runMode: 2,
    openMode: 0
  },

  // ==========================================================================
  // ENVIRONMENT VARIABLES
  // ==========================================================================
  env: {
    allure: true,
    allureResultsPath: 'reports/ui/allure-results'
  },

  // ==========================================================================
  // E2E CONFIGURATION
  // ==========================================================================
  e2e: {
    experimentalPromptCommand: true,
    baseUrl: 'http://127.0.0.1:3000',
    specPattern: 'cypress/e2e/tests/**/*.test.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',

    setupNodeEvents(on, config) {
      // Import and setup Allure
      const allureWriter = require('@shelex/cypress-allure-plugin/writer');
      allureWriter(on, config);

      on('task', {
        log(message: string) {
          console.log(message);
          return null;
        },
        getTimestamp() {
          return Date.now();
        },
        readFileMaybe(filename: string) {
          const fs = require('fs');
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename, 'utf8');
          }
          return null;
        }
      });

      on('before:browser:launch', (browser, launchOptions) => {
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
