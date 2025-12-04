const { defineConfig, devices } = require('@playwright/test');

const APP_URL = process.env.APP_URL || 'https://script.google.com/macros/s/AKfycbw-qMH0lKHdvYRZaHElMh3uXpDjCgLCyeLe0biUDrdjhDGQ1Z_UmCEGbHAI2pOoQTJt/exec';

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 60 * 1000,
  expect: { timeout: 15 * 1000 },
  fullyParallel: true,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  use: {
    baseURL: APP_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
