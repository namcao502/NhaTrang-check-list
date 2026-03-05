import { test, expect } from '@playwright/test';
import { ChecklistPage, STORAGE_KEYS } from './helpers';

test.describe('Dark mode', () => {
  test('starts in light mode by default', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.goto();

    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(cp.themeToggle()).toContainText('Tối');
  });

  test('toggle to dark mode', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.goto();

    await cp.themeToggle().click();

    await expect(page.locator('html')).toHaveClass(/dark/);
    // Verify button text changed
    await expect(cp.themeToggle()).toContainText('Hệ thống');
  });

  test('toggle cycles: light → dark → system → light', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.goto();

    await expect(cp.themeToggle()).toContainText('Tối');

    await cp.themeToggle().click();
    await expect(cp.themeToggle()).toContainText('Hệ thống');

    await cp.themeToggle().click();
    await expect(cp.themeToggle()).toContainText('Sáng');

    await cp.themeToggle().click();
    await expect(cp.themeToggle()).toContainText('Tối');
  });

  test('dark mode persists across page reload', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.goto();

    await cp.themeToggle().click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await cp.heading.waitFor({ state: 'visible' });

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('seeded dark mode applies on load', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.darkMode, 'true');
    await cp.goto();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
