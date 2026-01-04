// Playwright Test Template
// Location: e2e/example.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Feature: User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to starting page before each test
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Check form elements are visible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Check for validation messages
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in the form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');

    // Submit
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});

test.describe('Feature: Dashboard Navigation', () => {
  test.use({ storageState: 'e2e/.auth/user.json' }); // Use authenticated state

  test('should navigate between dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/dashboard/settings');

    // Navigate to profile
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL('/dashboard/profile');
  });

  test('should display user data on profile page', async ({ page }) => {
    await page.goto('/dashboard/profile');

    await expect(page.getByText('user@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeEnabled();
  });
});

test.describe('Feature: API Integration', () => {
  test('should fetch and display data', async ({ page }) => {
    // Mock API response
    await page.route('**/api/items', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', title: 'Item 1' },
          { id: '2', title: 'Item 2' },
        ]),
      });
    });

    await page.goto('/items');

    // Verify items are displayed
    await expect(page.getByText('Item 1')).toBeVisible();
    await expect(page.getByText('Item 2')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/items', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/items');

    await expect(page.getByText('Failed to load items')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});

// Screenshot and visual regression
test('visual regression: homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });
});

// Accessibility test
test('should have no accessibility violations on login page', async ({ page }) => {
  await page.goto('/login');

  // Using axe-core via @axe-core/playwright
  // const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  // expect(accessibilityScanResults.violations).toEqual([]);
});
