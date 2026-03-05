import { test, expect } from '@playwright/test';
import { ChecklistPage, MIXED_STATE_SEED, STORAGE_KEYS } from './helpers';

test.describe('Filters', () => {
  async function setup(page: import('@playwright/test').Page) {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MIXED_STATE_SEED);
    await cp.goto();
    return cp;
  }

  // MIXED_STATE_SEED items:
  //   "Alpha Must Done"      — checked, must
  //   "Beta Must Pending"    — unchecked, must
  //   "Gamma Opt Done"       — checked, opt
  //   "Delta No Tag"         — unchecked, no tag
  //   "Epsilon Must Pending" — unchecked, must (in Second Category)

  test('search filters items by label', async ({ page }) => {
    const cp = await setup(page);

    await cp.searchInput.fill('Must');

    await expect(cp.getItemRow('Alpha Must Done')).toBeVisible();
    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Gamma Opt Done')).not.toBeVisible();
    await expect(cp.getItemRow('Delta No Tag')).not.toBeVisible();
  });

  test('search is case-insensitive', async ({ page }) => {
    const cp = await setup(page);

    await cp.searchInput.fill('must');

    await expect(cp.getItemRow('Alpha Must Done')).toBeVisible();
    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
  });

  test('clearing search restores all items', async ({ page }) => {
    const cp = await setup(page);

    await cp.searchInput.fill('Must');
    await expect(cp.getItemRow('Gamma Opt Done')).not.toBeVisible();

    await cp.searchInput.clear();
    await expect(cp.getItemRow('Gamma Opt Done')).toBeVisible();
    await expect(cp.getItemRow('Delta No Tag')).toBeVisible();
  });

  test('must-only filter shows only must-tagged items', async ({ page }) => {
    const cp = await setup(page);

    await cp.mustOnlyButton.click();

    await expect(cp.getItemRow('Alpha Must Done')).toBeVisible();
    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Gamma Opt Done')).not.toBeVisible();
    await expect(cp.getItemRow('Delta No Tag')).not.toBeVisible();
  });

  test('hide-checked filter hides checked items', async ({ page }) => {
    const cp = await setup(page);

    await cp.hideCheckedButton.click();

    await expect(cp.getItemRow('Alpha Must Done')).not.toBeVisible();
    await expect(cp.getItemRow('Gamma Opt Done')).not.toBeVisible();
    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Delta No Tag')).toBeVisible();
    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
  });

  test('combined: search + must-only', async ({ page }) => {
    const cp = await setup(page);

    await cp.mustOnlyButton.click();
    await cp.searchInput.fill('Pending');

    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Alpha Must Done')).not.toBeVisible();
    await expect(cp.getItemRow('Delta No Tag')).not.toBeVisible();
  });

  test('combined: search + hide-checked', async ({ page }) => {
    const cp = await setup(page);

    await cp.hideCheckedButton.click();
    await cp.searchInput.fill('Must');

    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Alpha Must Done')).not.toBeVisible();
  });

  test('combined: must-only + hide-checked', async ({ page }) => {
    const cp = await setup(page);

    await cp.mustOnlyButton.click();
    await cp.hideCheckedButton.click();

    await expect(cp.getItemRow('Beta Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Alpha Must Done')).not.toBeVisible();
    await expect(cp.getItemRow('Gamma Opt Done')).not.toBeVisible();
    await expect(cp.getItemRow('Delta No Tag')).not.toBeVisible();
  });

  test('combined: all three filters', async ({ page }) => {
    const cp = await setup(page);

    await cp.mustOnlyButton.click();
    await cp.hideCheckedButton.click();
    await cp.searchInput.fill('Epsilon');

    await expect(cp.getItemRow('Epsilon Must Pending')).toBeVisible();
    await expect(cp.getItemRow('Beta Must Pending')).not.toBeVisible();
    await expect(cp.getItemRow('Alpha Must Done')).not.toBeVisible();
  });

  test('category with no matching items is hidden', async ({ page }) => {
    const cp = await setup(page);

    await cp.searchInput.fill('Epsilon');

    // Only "Second Category" has "Epsilon Must Pending"
    await expect(cp.getCategorySection('Second Category')).toBeVisible();
    await expect(cp.getCategorySection('Mixed Category')).not.toBeVisible();
  });
});
