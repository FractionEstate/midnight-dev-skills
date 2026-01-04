# Playwright Page Object Template

Reusable page objects for E2E tests.

## Location

`e2e/pages/[page-name].page.ts`

## Template

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL('/dashboard');
  }
}
```

## Usage in Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully', async () => {
    await loginPage.login('user@example.com', 'password123');
    await loginPage.expectLoggedIn();
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login('wrong@example.com', 'wrongpassword');
    await loginPage.expectError('Invalid credentials');
  });
});
```

## Key Patterns

| Pattern | Description |
|---------|-------------|
| Locator properties | Defined in constructor |
| Action methods | `login()`, `goto()` |
| Assertion methods | `expectError()`, `expectLoggedIn()` |
| Encapsulation | Hide selectors from tests |
