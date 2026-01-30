import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  screenshotsFolder: 'test-output/cypress-output/screenshots',
  videosFolder: 'test-output/cypress-output/videos',
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
    allureResultsPath: 'test-output/cypress-output/allure-results'
  },
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/tests/**/*.test.ts',
    supportFile: 'cypress/support/e2e.ts',
    downloadsFolder: 'test-output/cypress-output/downloads',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'test-output/cypress-output/html',
      charts: true,
      reportPageTitle: 'Cypress Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      overwrite: false,
      html: true,
      json: true
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('cypress-terminal-report/src/installLogsPrinter')(on);
      require('cypress-failed-log/on')(on);
      // cypress-plugin-api auto-loads, no specific task required but good to note


      // Use require for plugins as standard in Cypress CommonJS config loading
      const allureWriter = require('@shelex/cypress-allure-plugin/writer');
      allureWriter(on, config);

      on('task', {
        log(message: string) {
          console.log(message);
          return null;
        },
        failed: require('cypress-failed-log/src/failed')(),
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
