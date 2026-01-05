---
description: Playwright E2E testing guidelines
name: Playwright Testing
applyTo: '**/e2e/**,**/playwright.config.ts,**/*.spec.ts'
---

# Playwright Instructions

## Project Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Locator Priority

1. **Role-based** (best)

   ```typescript
   page.getByRole('button', { name: 'Submit' });
   ```

2. **Label-based** (forms)

   ```typescript
   page.getByLabel('Email');
   page.getByPlaceholder('Search...');
   ```

3. **Text-based**

   ```typescript
   page.getByText('Welcome');
   ```

4. **Test ID** (when others fail)

   ```typescript
   page.getByTestId('user-avatar');
   ```

5. **CSS** (last resort)

   ```typescript
   page.locator('.card');
   ```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should work', async ({ page }) => {
    await page.getByRole('button').click();
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Common Assertions

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// State
await expect(locator).toBeEnabled();
await expect(locator).toBeChecked();

// Content
await expect(locator).toHaveText('Hello');
await expect(locator).toContainText('Hello');
await expect(locator).toHaveValue('input');

// Page
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle(/Home/);

// Visual
await expect(page).toHaveScreenshot('page.png');
```

## Page Object Model

```typescript
export class LoginPage {
  constructor(private page: Page) {}

  readonly email = this.page.getByLabel('Email');
  readonly password = this.page.getByLabel('Password');
  readonly submit = this.page.getByRole('button', { name: 'Sign in' });

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
```

## Network Mocking

```typescript
test('mock API', async ({ page }) => {
  await page.route('/api/users', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'Mock' }]),
    });
  });
});
```

## Best Practices

1. **Use role locators** - More accessible and stable
2. **Page Object Model** - For maintainability
3. **Auto-wait** - Trust Playwright's built-in waiting
4. **Isolated tests** - Each test should be independent
5. **Test IDs sparingly** - Only when semantic locators fail
6. **Visual regression** - Use screenshots for UI tests
