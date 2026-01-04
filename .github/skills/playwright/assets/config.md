# Playwright Configuration Template

Configuration for multi-browser E2E testing.

## Location

`playwright.config.ts`

## Template

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers
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

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Start local server before tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Key Configuration Options

| Option | Description |
|--------|-------------|
| `testDir` | Directory containing test files |
| `fullyParallel` | Run tests in parallel |
| `retries` | Retry failed tests |
| `workers` | Number of parallel workers |
| `baseURL` | Default URL for `page.goto()` |
| `trace` | Record trace for debugging |
| `webServer` | Start app before tests |

## Environment-Specific Config

```typescript
// Different settings for CI vs local
use: {
  baseURL: process.env.CI
    ? 'https://staging.example.com'
    : 'http://localhost:3000',
  trace: process.env.CI ? 'on-first-retry' : 'off',
  screenshot: process.env.CI ? 'only-on-failure' : 'off',
},
```
