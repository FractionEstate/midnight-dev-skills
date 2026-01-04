---
description: Create comprehensive E2E tests with Playwright for web applications
name: Create E2E Tests
agent: E2E Testing Engineer
tools:
  - playwright/*
  - chromedevtools/chrome-devtools-mcp/*
  - edit/editFiles
  - search
---

# Create E2E Tests

Create comprehensive end-to-end tests for a web application using Playwright.

## Input Variables

- **Feature to Test**: ${input:feature:user authentication}
- **Test File Path**: ${input:testPath:tests/auth.spec.ts}
- **Base URL**: ${input:baseUrl:<http://localhost:3000}>
- **Include Visual Tests**: ${input:visualTests:yes}
- **Include A11y Tests**: ${input:a11yTests:yes}

## Requirements

1. **Test Structure**:

   ```typescript
   import { test, expect } from '@playwright/test';

   test.describe('Feature: ${feature}', () => {
     test.beforeEach(async ({ page }) => {
       // Setup
     });

     test('should...', async ({ page }) => {
       // Test implementation
     });
   });
   ```

2. **Selector Strategy**:
   - Prefer role-based selectors: `getByRole()`
   - Use accessible names: `getByLabel()`, `getByText()`
   - Use test IDs only as last resort: `getByTestId()`
   - Never use fragile CSS selectors

3. **Test Categories**:
   - Happy path tests (success scenarios)
   - Error handling tests (validation, errors)
   - Edge case tests (empty states, limits)
   - Visual regression tests (if enabled)
   - Accessibility tests (if enabled)

4. **Best Practices**:
   - Use meaningful test descriptions
   - One assertion focus per test
   - Proper async/await handling
   - Test isolation (no shared state)
   - Mock external APIs

5. **Visual Tests** (if included):

   ```typescript
   await expect(page).toHaveScreenshot('feature-name.png');
   ```

6. **Accessibility Tests** (if included):

   ```typescript
   import AxeBuilder from '@axe-core/playwright';
   const results = await new AxeBuilder({ page }).analyze();
   expect(results.violations).toEqual([]);
   ```

## Output

Provide:

1. Complete test file with all test cases
2. Any required fixtures or helpers
3. Configuration updates if needed
4. Instructions to run the tests
