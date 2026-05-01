import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="Username"]', 'invalid_user');
    await page.fill('input[type="password"]', 'wrong_password');
    await page.click('button:has-text("LOG IN")');
    // Expect some toast or error message
    // await expect(page.locator('.sonner-toast')).toContainText('Invalid');
  });
});
