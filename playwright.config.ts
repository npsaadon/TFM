import { defineConfig, devices } from '@playwright/test';

/**
 * E2E and accessibility tests run against the real production build, not the
 * dev server — dev injects HMR machinery and skips minification, so a dev-only
 * pass can hide problems that only appear in what visitors actually receive.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: 'http://localhost:4399',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    // Port 4399, NOT 4321: the dev server the owner watches lives on 4321 and
    // test runs must never take it down.
    command: 'node scripts/serve-dist.mjs --port 4399',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
