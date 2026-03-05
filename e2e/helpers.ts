import { type Page, type Locator } from '@playwright/test';
import type { Category } from '../lib/types';

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  checklist: 'beach-checklist',
  collapse: 'beach-collapse-state',
  darkMode: 'beach-dark-mode',
} as const;

/** Minimal seed: single category with 2 items */
export const MINIMAL_SEED: Category[] = [
  {
    id: 'test-cat-1',
    name: 'Test Category',
    icon: '🧪',
    items: [
      { id: 'test-item-1', label: 'Test Item One', checked: false, tag: 'must', note: 'A note' },
      { id: 'test-item-2', label: 'Test Item Two', checked: false, tag: 'opt' },
    ],
  },
];

/** Seed with mixed checked / tag states for filter & stats testing.
 *  Item labels are chosen to avoid substring ambiguity. */
export const MIXED_STATE_SEED: Category[] = [
  {
    id: 'cat-mixed-1',
    name: 'Mixed Category',
    icon: '📦',
    items: [
      { id: 'mix-1', label: 'Alpha Must Done', checked: true, tag: 'must' },
      { id: 'mix-2', label: 'Beta Must Pending', checked: false, tag: 'must' },
      { id: 'mix-3', label: 'Gamma Opt Done', checked: true, tag: 'opt' },
      { id: 'mix-4', label: 'Delta No Tag', checked: false },
    ],
  },
  {
    id: 'cat-mixed-2',
    name: 'Second Category',
    icon: '📋',
    items: [
      { id: 'mix-5', label: 'Epsilon Must Pending', checked: false, tag: 'must' },
    ],
  },
];

/** Two-category seed for reorder testing */
export const TWO_CAT_SEED: Category[] = [
  {
    id: 'order-cat-1',
    name: 'First Category',
    icon: '1️⃣',
    items: [{ id: 'o1', label: 'Item A', checked: false }],
  },
  {
    id: 'order-cat-2',
    name: 'Second Category',
    icon: '2️⃣',
    items: [{ id: 'o2', label: 'Item B', checked: false }],
  },
];

// ---------------------------------------------------------------------------
// Page Object
// ---------------------------------------------------------------------------

export class ChecklistPage {
  readonly page: Page;

  // Header
  readonly heading: Locator;

  // Stats
  readonly resetButton: Locator;

  // Filter bar
  readonly searchInput: Locator;
  readonly mustOnlyButton: Locator;
  readonly hideCheckedButton: Locator;

  // Undo
  readonly undoButton: Locator;

  // Add category
  readonly addCategoryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Nha Trang Packing List' });
    this.resetButton = page.getByRole('button', { name: 'Đặt lại' });
    this.searchInput = page.getByPlaceholder('Tìm kiếm đồ vật...');
    this.mustOnlyButton = page.getByRole('button', { name: 'Chỉ quan trọng' });
    this.hideCheckedButton = page.getByRole('button', { name: 'Ẩn đã xong' });
    this.undoButton = page.getByText('↩ Hoàn tác');
    this.addCategoryButton = page.getByRole('button', { name: '+ Them danh muc' });
  }

  /** Navigate and wait for hydration */
  async goto() {
    await this.page.goto('/');
    await this.heading.waitFor({ state: 'visible' });
  }

  /** Seed localStorage before navigation (call before goto) */
  async seedLocalStorage(key: string, value: unknown) {
    await this.page.addInitScript(
      ({ k, v }) => { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); },
      { k: key, v: value },
    );
  }

  /** Clear localStorage before navigation */
  async clearLocalStorage() {
    await this.page.addInitScript(() => { localStorage.clear(); });
  }

  // -- Stats helpers --------------------------------------------------------

  statsText(): Locator {
    return this.page.locator('text=/Đã chuẩn bị|Sẵn sàng ra biển/');
  }

  progressBar(): Locator {
    return this.page.locator('.h-3.rounded-full.transition-all');
  }

  // -- Category helpers -----------------------------------------------------

  getCategorySection(name: string): Locator {
    return this.page.locator('section.glass-card').filter({ hasText: name });
  }

  /** Click the category name text to start inline editing */
  getCategoryNameText(name: string): Locator {
    return this.getCategorySection(name).locator('span.font-semibold.cursor-text');
  }

  getCategoryBulkToggle(name: string): Locator {
    return this.getCategorySection(name).getByRole('button', { name: /Chọn tất cả|Bỏ chọn tất cả/ });
  }

  getCategoryDeleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Xoá danh mục ${name}` });
  }

  getCategoryMoveUp(name: string): Locator {
    return this.getCategorySection(name).getByRole('button', { name: 'Di chuyển lên' });
  }

  getCategoryMoveDown(name: string): Locator {
    return this.getCategorySection(name).getByRole('button', { name: 'Di chuyển xuống' });
  }

  getChevronArea(name: string): Locator {
    return this.getCategorySection(name).locator('.cursor-pointer').first();
  }

  // -- Add item helpers -----------------------------------------------------

  getAddItemInput(categoryName: string): Locator {
    return this.getCategorySection(categoryName).getByPlaceholder('Thêm đồ vật...');
  }

  getAddItemNoteInput(categoryName: string): Locator {
    return this.getCategorySection(categoryName).getByPlaceholder('Mô tả (tuỳ chọn)...');
  }

  getAddItemSubmit(categoryName: string): Locator {
    return this.getCategorySection(categoryName).getByRole('button', { name: 'Thêm', exact: true });
  }

  getAddItemTagButton(categoryName: string, tag: 'Quan trọng' | 'Nên có'): Locator {
    return this.getCategorySection(categoryName).getByRole('button', { name: tag, exact: true });
  }

  // -- Item helpers ---------------------------------------------------------

  /** Find an item row by its exact label text */
  getItemRow(label: string): Locator {
    return this.page.locator('li').filter({
      has: this.page.getByText(label, { exact: true }),
    });
  }

  getItemCheckbox(label: string): Locator {
    return this.getItemRow(label).locator('input[type="checkbox"]');
  }

  getItemLabelSpan(label: string): Locator {
    return this.page.getByText(label, { exact: true });
  }

  getItemDeleteButton(label: string): Locator {
    return this.page.getByRole('button', { name: `Xoá ${label}` });
  }

  getItemAddNoteButton(label: string): Locator {
    return this.getItemRow(label).getByRole('button', { name: 'Thêm ghi chú' });
  }

  // -- Theme toggle ---------------------------------------------------------

  themeToggle(): Locator {
    return this.page.getByRole('button', { name: /Chuyển sang chế độ/ });
  }

  // -- localStorage read helpers --------------------------------------------

  async getLocalStorageValue<T = unknown>(key: string): Promise<T | null> {
    return this.page.evaluate((k) => {
      const val = localStorage.getItem(k);
      return val ? JSON.parse(val) : null;
    }, key);
  }

  async htmlHasDarkClass(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.classList.contains('dark'));
  }
}
