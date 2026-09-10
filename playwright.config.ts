import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "test-output/playwright-output/report" }],
  ],
  outputDir: "test-output/playwright-output/test-results",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },

  webServer: {
    command: "cd app-under-test && npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
