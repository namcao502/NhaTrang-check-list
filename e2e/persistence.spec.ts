import { test, expect } from '@playwright/test';
import { ChecklistPage, MINIMAL_SEED, STORAGE_KEYS } from './helpers';

/**
 * Persistence tests navigate, seed localStorage via page.evaluate, then reload.
 * This avoids addInitScript which would re-seed on every reload.
 */
test.describe('Persistence & undo', () => {
  /** Navigate, seed localStorage, then reload to apply seed data */
  async function setupWithReload(page: import('@playwright/test').Page) {
    const cp = new ChecklistPage(page);
    await cp.goto(); // first load (uses default data)
    // Override localStorage with our seed data
    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: STORAGE_KEYS.checklist, data: MINIMAL_SEED });
    // Reload so the app picks up the seeded data
    await page.reload();
    await cp.heading.waitFor({ state: 'visible' });
    return cp;
  }

  test('checked state persists after reload', async ({ page }) => {
    const cp = await setupWithReload(page);

    await cp.getItemCheckbox('Test Item One').check();
    await expect(cp.getItemCheckbox('Test Item One')).toBeChecked();

    await page.reload();
    await cp.heading.waitFor({ state: 'visible' });

    await expect(cp.getItemCheckbox('Test Item One')).toBeChecked();
  });

  test('added item persists after reload', async ({ page }) => {
    const cp = await setupWithReload(page);

    await cp.getAddItemInput('Test Category').fill('Persistence Test Item');
    await cp.getAddItemSubmit('Test Category').click();
    await expect(cp.getItemRow('Persistence Test Item')).toBeVisible();

    await page.reload();
    await cp.heading.waitFor({ state: 'visible' });

    await expect(cp.getItemRow('Persistence Test Item')).toBeVisible();
  });

  test('removed item is gone after reload', async ({ page }) => {
    const cp = await setupWithReload(page);

    await cp.getItemDeleteButton('Test Item Two').click();
    await expect(cp.getItemRow('Test Item Two')).not.toBeVisible();

    await page.reload();
    await cp.heading.waitFor({ state: 'visible' });

    await expect(cp.getItemRow('Test Item Two')).not.toBeVisible();
  });

  test('undo button appears after state change', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await expect(cp.undoButton).not.toBeVisible();

    await cp.getItemCheckbox('Test Item One').check();
    await expect(cp.undoButton).toBeVisible();
  });

  test('undo reverts last action', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await cp.getItemCheckbox('Test Item One').check();
    await expect(cp.getItemCheckbox('Test Item One')).toBeChecked();

    await cp.undoButton.click();
    await expect(cp.getItemCheckbox('Test Item One')).not.toBeChecked();
  });

  test('undo via Ctrl+Z keyboard shortcut', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await cp.getItemCheckbox('Test Item One').check();
    await expect(cp.getItemCheckbox('Test Item One')).toBeChecked();

    await page.locator('body').click();
    await page.keyboard.press('Control+z');
    await expect(cp.getItemCheckbox('Test Item One')).not.toBeChecked();
  });

  test('collapse state persists across reload', async ({ page }) => {
    const cp = await setupWithReload(page);

    await expect(cp.getItemRow('Test Item One')).toBeVisible();

    await cp.getChevronArea('Test Category').click();
    await expect(cp.getItemRow('Test Item One')).not.toBeVisible();

    await page.reload();
    await cp.heading.waitFor({ state: 'visible' });

    await expect(cp.getItemRow('Test Item One')).not.toBeVisible();
  });
});
