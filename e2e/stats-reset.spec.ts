import { test, expect } from '@playwright/test';
import { ChecklistPage, MIXED_STATE_SEED, STORAGE_KEYS } from './helpers';
import type { Category } from '../lib/types';

test.describe('Stats & reset', () => {
  test('stats show correct count on load', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MIXED_STATE_SEED);
    await cp.goto();

    // MIXED_STATE_SEED: 2 checked out of 5
    await expect(page.getByText('Đã chuẩn bị 2/5 đồ vật')).toBeVisible();
    await expect(page.getByText('40%')).toBeVisible();
  });

  test('stats update when checking an item', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MIXED_STATE_SEED);
    await cp.goto();

    await cp.getItemCheckbox('Beta Must Pending').check();

    await expect(page.getByText('Đã chuẩn bị 3/5 đồ vật')).toBeVisible();
    await expect(page.getByText('60%')).toBeVisible();
  });

  test('all-done message when everything is checked', async ({ page }) => {
    const allDone: Category[] = [{
      id: 'done', name: 'Done', icon: '✅',
      items: [{ id: 'd1', label: 'Done Item', checked: true, tag: 'must' }],
    }];
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, allDone);
    await cp.goto();

    await expect(page.getByText('Sẵn sàng ra biển rồi!')).toBeVisible();
    await expect(page.getByText('Đã chuẩn bị xong!')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('reset button restores default data', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MIXED_STATE_SEED);
    await cp.goto();

    await cp.resetButton.click();

    const sections = page.locator('section.glass-card');
    await expect(sections).toHaveCount(9);
    await expect(page.getByText('Đồ Bơi & Lặn')).toBeVisible();
  });
});
