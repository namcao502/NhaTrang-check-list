import { test, expect } from '@playwright/test';
import { ChecklistPage } from './helpers';

test.describe('Page load & default data', () => {
  test('loads with default 9 categories when localStorage is empty', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.clearLocalStorage();
    await cp.goto();

    const sections = page.locator('section.glass-card');
    await expect(sections).toHaveCount(9);

    const categoryNames = [
      'Đồ Bơi & Lặn', 'Trang Phục', 'Giày Dép', 'Vệ Sinh Cá Nhân',
      'Chống Nắng & Biển', 'Thuốc & Sức Khoẻ', 'Điện Tử & Tiện Ích',
      'Giấy Tờ & Tài Chính', 'Đồ Lặt Vặt Tiện Ích',
    ];
    for (const name of categoryNames) {
      await expect(page.getByText(name, { exact: false })).toBeVisible();
    }
  });

  test('displays stats showing 0 items checked on fresh load', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.clearLocalStorage();
    await cp.goto();

    await expect(page.getByText('Đã chuẩn bị 0/')).toBeVisible();
  });

  test('renders category icons from default data', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.clearLocalStorage();
    await cp.goto();

    // Spot-check a few icons
    await expect(page.getByText('🏊')).toBeVisible();
    await expect(page.getByText('👗')).toBeVisible();
    await expect(page.getByText('👟')).toBeVisible();
  });

  test('renders items within first category with correct badges', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.clearLocalStorage();
    await cp.goto();

    const firstSection = cp.getCategorySection('Đồ Bơi & Lặn');
    await expect(firstSection.getByText('Đồ bơi', { exact: true })).toBeVisible();
    await expect(firstSection.getByText('Kính bơi', { exact: true })).toBeVisible();

    // Must items should have "Quan trọng" badge
    await expect(firstSection.getByText('Quan trọng').first()).toBeVisible();
    // Opt items should have "Nên có" badge
    await expect(firstSection.getByText('Nên có').first()).toBeVisible();
  });

  test('renders header elements', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.clearLocalStorage();
    await cp.goto();

    await expect(page.getByText('✈️ Kế hoạch chuyến đi')).toBeVisible();
    await expect(cp.heading).toBeVisible();
    await expect(page.getByText('🏖️ Biển · 🎢 Vinwonders · 🦁 Safari')).toBeVisible();
  });
});

test.describe('Removed buttons (FEAT-remove-buttons)', () => {
  test('does not render copy, share, template, or print buttons', async ({ page }) => {
    const cp = new ChecklistPage(page);
    await cp.clearLocalStorage();
    await cp.goto();

    // "Sao chep danh sach" (copy) button — removed
    await expect(page.getByRole('button', { name: /Sao chép danh sách/ })).toHaveCount(0);

    // "Chia se" (share) button — removed
    await expect(page.getByRole('button', { name: /Chia sẻ/ })).toHaveCount(0);

    // "Mau chuyen di" (template manager) button — removed
    await expect(page.getByRole('button', { name: /Mẫu chuyến đi/ })).toHaveCount(0);

    // "In danh sach" (print) button — removed
    await expect(page.getByRole('button', { name: /In danh sách/ })).toHaveCount(0);
  });
});
