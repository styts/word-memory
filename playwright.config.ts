import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './app/tests',
  outputDir: './app/tests/videos',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:26090',
    video: 'on',
    trace: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'PORT=26090 node .output/server/index.mjs',
    url: 'http://localhost:26090',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
