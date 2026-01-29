import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  screenshotsFolder: 'cypress/reports/screenshots',
  videosFolder: 'cypress/reports/videos',
  defaultCommandTimeout: 10000,
  execTimeout: 10000,
  taskTimeout: 10000,
  pageLoadTimeout: 30000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  viewportWidth: 1280,
  viewportHeight: 720,
  watchForFileChanges: false,
  retries: {
    runMode: 2,
    openMode: 0
  },
  env: {
    allure: true,
    allureResultsPath: 'cypress/reports/ui/allure-results'
  },
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/tests/**/*.test.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    reporter: 'cypress-mochawesome-reporter',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      // Use require for plugins as standard in Cypress CommonJS config loading
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
      return config;
    }
  }
});
