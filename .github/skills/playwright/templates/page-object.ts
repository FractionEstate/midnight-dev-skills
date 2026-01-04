// Playwright Page Object Model Template
// Location: e2e/pages/login.page.ts

import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Define locators using best practices
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
  }

  // Navigation
  async goto() {
    await this.page.goto('/login');
  }

  // Actions
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  // Assertions
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }

  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL('/dashboard');
  }

  async expectFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}

// ============================================
// Dashboard Page Object
// ============================================

export class DashboardPage {
  readonly page: Page;

  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly settingsLink: Locator;
  readonly profileLink: Locator;
  readonly notificationBell: Locator;

  constructor(page: Page) {
    this.page = page;

    this.welcomeMessage = page.getByRole('heading', { name: /welcome/i });
    this.userMenu = page.getByRole('button', { name: 'User menu' });
    this.logoutButton = page.getByRole('menuitem', { name: 'Log out' });
    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    this.profileLink = page.getByRole('link', { name: 'Profile' });
    this.notificationBell = page.getByRole('button', { name: 'Notifications' });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async goToSettings() {
    await this.settingsLink.click();
    await expect(this.page).toHaveURL('/dashboard/settings');
  }

  async goToProfile() {
    await this.profileLink.click();
    await expect(this.page).toHaveURL('/dashboard/profile');
  }

  async expectWelcomeMessage(name: string) {
    await expect(this.welcomeMessage).toContainText(name);
  }
}

// ============================================
// Base Component for reusable elements
// ============================================

export class Navigation {
  readonly page: Page;

  readonly homeLink: Locator;
  readonly aboutLink: Locator;
  readonly contactLink: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.aboutLink = page.getByRole('link', { name: 'About' });
    this.contactLink = page.getByRole('link', { name: 'Contact' });
    this.mobileMenuButton = page.getByRole('button', { name: 'Menu' });
  }

  async goTo(linkName: 'Home' | 'About' | 'Contact') {
    const links = {
      Home: this.homeLink,
      About: this.aboutLink,
      Contact: this.contactLink,
    };
    await links[linkName].click();
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }
}

// ============================================
// Usage in tests
// ============================================

/*
import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from './pages/login.page';

test('user can login and access dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await loginPage.expectSuccessfulLogin();

  await dashboardPage.expectWelcomeMessage('John');
});
*/
