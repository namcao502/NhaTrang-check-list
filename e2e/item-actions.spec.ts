import { test, expect } from '@playwright/test';
import { ChecklistPage, MINIMAL_SEED, STORAGE_KEYS } from './helpers';

test.describe('Item actions', () => {
  async function setup(page: import('@playwright/test').Page) {
    const cp = new ChecklistPage(page);
    await cp.seedLocalStorage(STORAGE_KEYS.checklist, MINIMAL_SEED);
    await cp.goto();
    return cp;
  }

  test('checking an item toggles its checkbox and adds strikethrough', async ({ page }) => {
    const cp = await setup(page);

    const checkbox = cp.getItemCheckbox('Test Item One');
    await expect(checkbox).not.toBeChecked();

    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await expect(cp.getItemLabelSpan('Test Item One')).toHaveClass(/line-through/);
  });

  test('unchecking a checked item removes strikethrough', async ({ page }) => {
    const cp = await setup(page);

    const checkbox = cp.getItemCheckbox('Test Item One');
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await expect(cp.getItemLabelSpan('Test Item One')).not.toHaveClass(/line-through/);
  });

  test('adding a new item via form', async ({ page }) => {
    const cp = await setup(page);

    const input = cp.getAddItemInput('Test Category');
    await input.fill('New Beach Towel');
    await cp.getAddItemSubmit('Test Category').click();

    await expect(cp.getItemRow('New Beach Towel')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('adding item with must tag', async ({ page }) => {
    const cp = await setup(page);

    await cp.getAddItemInput('Test Category').fill('Important Sunscreen');
    await cp.getAddItemTagButton('Test Category', 'Quan trọng').click();
    await cp.getAddItemSubmit('Test Category').click();

    const row = cp.getItemRow('Important Sunscreen');
    await expect(row.getByText('Quan trọng')).toBeVisible();
  });

  test('adding item with optional tag', async ({ page }) => {
    const cp = await setup(page);

    await cp.getAddItemInput('Test Category').fill('Nice Hat');
    await cp.getAddItemTagButton('Test Category', 'Nên có').click();
    await cp.getAddItemSubmit('Test Category').click();

    const row = cp.getItemRow('Nice Hat');
    await expect(row.getByText('Nên có')).toBeVisible();
  });

  test('adding item with note', async ({ page }) => {
    const cp = await setup(page);

    await cp.getAddItemInput('Test Category').fill('Towel');
    await cp.getAddItemNoteInput('Test Category').fill('Large beach towel');
    await cp.getAddItemSubmit('Test Category').click();

    const row = cp.getItemRow('Towel');
    await expect(row.getByText('Large beach towel')).toBeVisible();
  });

  test('cannot add empty item', async ({ page }) => {
    const cp = await setup(page);

    const submit = cp.getAddItemSubmit('Test Category');
    await expect(submit).toBeDisabled();
  });

  test('removing an item', async ({ page }) => {
    const cp = await setup(page);

    await expect(cp.getItemRow('Test Item One')).toBeVisible();
    await cp.getItemDeleteButton('Test Item One').click();
    await expect(cp.getItemRow('Test Item One')).not.toBeVisible();
  });

  test('inline renaming an item via Enter', async ({ page }) => {
    const cp = await setup(page);

    // Click the label span to enter edit mode
    await cp.getItemLabelSpan('Test Item One').click();

    // Find the inline edit input that appears
    const input = page.locator('li').first().locator('input.w-full.text-sm');
    await input.clear();
    await input.fill('Renamed Item');
    await input.press('Enter');

    await expect(page.getByText('Renamed Item', { exact: true })).toBeVisible();
  });

  test('inline rename cancel with Escape', async ({ page }) => {
    const cp = await setup(page);

    await cp.getItemLabelSpan('Test Item One').click();

    const input = page.locator('li').first().locator('input.w-full.text-sm');
    await input.clear();
    await input.fill('Should Not Save');
    await input.press('Escape');

    await expect(page.getByText('Test Item One', { exact: true })).toBeVisible();
    await expect(page.getByText('Should Not Save')).not.toBeVisible();
  });

  test('editing an existing note inline', async ({ page }) => {
    const cp = await setup(page);

    // "Test Item One" has note "A note" — click it to edit
    const noteSpan = cp.getItemRow('Test Item One').locator('span.cursor-text').filter({ hasText: 'A note' });
    await noteSpan.click();

    const noteInput = cp.getItemRow('Test Item One').locator('input[placeholder="Ghi chú..."]');
    await noteInput.clear();
    await noteInput.fill('Updated note');
    await noteInput.press('Enter');

    await expect(cp.getItemRow('Test Item One').getByText('Updated note')).toBeVisible();
  });

  test('adding a note to an item without one', async ({ page }) => {
    const cp = await setup(page);

    await cp.getItemAddNoteButton('Test Item Two').click();

    const noteInput = cp.getItemRow('Test Item Two').locator('input[placeholder="Ghi chú..."]');
    await noteInput.fill('Brand new note');
    await noteInput.press('Enter');

    await expect(cp.getItemRow('Test Item Two').getByText('Brand new note')).toBeVisible();
  });

  test('cancel note edit with Escape', async ({ page }) => {
    const cp = await setup(page);

    const noteSpan = cp.getItemRow('Test Item One').locator('span.cursor-text').filter({ hasText: 'A note' });
    await noteSpan.click();

    const noteInput = cp.getItemRow('Test Item One').locator('input[placeholder="Ghi chú..."]');
    await noteInput.clear();
    await noteInput.fill('Should not save');
    await noteInput.press('Escape');

    await expect(cp.getItemRow('Test Item One').getByText('A note')).toBeVisible();
  });
});
