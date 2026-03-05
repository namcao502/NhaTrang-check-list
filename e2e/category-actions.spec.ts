import { test, expect } from '@playwright/test';
import { ChecklistPage, MINIMAL_SEED, TWO_CAT_SEED, STORAGE_KEYS } from './helpers';

test.describe('Category actions', () => {
  test('adding a new category', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await cp.addCategoryButton.click();
    await page.getByPlaceholder('Ten danh muc...').fill('New Cat Name');
    // The add-category form submit button uses "Them" (no diacritics), unique on page
    await page.getByRole('button', { name: 'Them', exact: true }).click();

    const newSection = cp.getCategorySection('New Cat Name');
    await expect(newSection).toBeVisible();
    await expect(newSection.getByText('Chưa có đồ vật nào.')).toBeVisible();
  });

  test('cancelling add category', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await cp.addCategoryButton.click();
    await expect(page.getByPlaceholder('Ten danh muc...')).toBeVisible();

    await page.getByRole('button', { name: 'Huy', exact: true }).click();
    await expect(cp.addCategoryButton).toBeVisible();
  });

  test('removing a category with confirmation', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    page.on('dialog', (dialog) => dialog.accept());

    await cp.getCategoryDeleteButton('Test Category').click();
    await expect(cp.getCategorySection('Test Category')).not.toBeVisible();
  });

  test('dismissing remove dialog keeps category', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    page.on('dialog', (dialog) => dialog.dismiss());

    await cp.getCategoryDeleteButton('Test Category').click();
    await expect(cp.getCategorySection('Test Category')).toBeVisible();
  });

  test('inline renaming a category', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    // Save a reference to the section before the name changes
    const section = page.locator('section.glass-card').first();

    // Click the category name span to enter edit mode
    await cp.getCategoryNameText('Test Category').click();

    // The span becomes an input
    const input = section.locator('input.text-xl');
    await input.clear();
    await input.fill('Renamed Category');
    await input.press('Enter');

    await expect(page.getByText('Renamed Category', { exact: true })).toBeVisible();
  });

  test('category rename cancel with Escape', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    const section = page.locator('section.glass-card').first();

    await cp.getCategoryNameText('Test Category').click();

    const input = section.locator('input.text-xl');
    await input.clear();
    await input.fill('Should Not Save');
    await input.press('Escape');

    await expect(page.getByText('Test Category')).toBeVisible();
    await expect(page.getByText('Should Not Save')).not.toBeVisible();
  });

  test('bulk toggle selects all items', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await cp.getCategoryBulkToggle('Test Category').click();

    await expect(cp.getItemCheckbox('Test Item One')).toBeChecked();
    await expect(cp.getItemCheckbox('Test Item Two')).toBeChecked();
    await expect(cp.getCategoryBulkToggle('Test Category')).toHaveText('Bỏ chọn tất cả');
  });

  test('bulk toggle deselects all items', async ({ page }) => {
    const cp = new ChecklistPage(page);
    const allChecked = [{
      ...MINIMAL_SEED[0],
      items: MINIMAL_SEED[0].items.map((i) => ({ ...i, checked: true })),
    }];
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, allChecked);
    await cp.goto();

    await cp.getCategoryBulkToggle('Test Category').click();

    await expect(cp.getItemCheckbox('Test Item One')).not.toBeChecked();
    await expect(cp.getItemCheckbox('Test Item Two')).not.toBeChecked();
    await expect(cp.getCategoryBulkToggle('Test Category')).toHaveText('Chọn tất cả');
  });

  test('collapse category hides items', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await expect(cp.getItemRow('Test Item One')).toBeVisible();

    await cp.getChevronArea('Test Category').click();

    await expect(cp.getItemRow('Test Item One')).not.toBeVisible();
    await expect(cp.getAddItemInput('Test Category')).not.toBeVisible();
  });

  test('expand collapsed category shows items', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();

    await cp.getChevronArea('Test Category').click();
    await expect(cp.getItemRow('Test Item One')).not.toBeVisible();

    await cp.getChevronArea('Test Category').click();
    await expect(cp.getItemRow('Test Item One')).toBeVisible();
  });

  test('move category down changes order', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, TWO_CAT_SEED);
    await cp.goto();

    const sections = page.locator('section.glass-card');
    await expect(sections.first()).toContainText('First Category');

    await cp.getCategoryMoveDown('First Category').click();

    await expect(sections.first()).toContainText('Second Category');
    await expect(sections.nth(1)).toContainText('First Category');
  });

  test('move category up changes order', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, TWO_CAT_SEED);
    await cp.goto();

    await cp.getCategoryMoveUp('Second Category').click();

    const sections = page.locator('section.glass-card');
    await expect(sections.first()).toContainText('Second Category');
  });
});
