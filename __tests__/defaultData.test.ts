/**
 * Tests for lib/defaultData.ts
 *
 * Verifies that:
 * - Exactly 9 Vietnamese Nha Trang categories are exported.
 * - Every category has an icon field.
 * - The total item count across all categories equals 50.
 * - Each item has the required fields (id, label, checked) and valid optional fields.
 */

import { DEFAULT_CATEGORIES } from "@/lib/defaultData";

describe("DEFAULT_CATEGORIES", () => {
  it("exports exactly 9 categories", () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(9);
  });

  it("every category has a non-empty icon", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.icon).toBeTruthy();
    }
  });

  it("every category has a non-empty id and name", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.id.length).toBeGreaterThan(0);
      expect(cat.name.length).toBeGreaterThan(0);
    }
  });

  it("total item count across all categories is 50", () => {
    const total = DEFAULT_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
    expect(total).toBe(50);
  });

  it("all items start as unchecked", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      for (const item of cat.items) {
        expect(item.checked).toBe(false);
      }
    }
  });

  it("all items have a non-empty id and label", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      for (const item of cat.items) {
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("all item tag values are 'must' or 'opt' when present", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      for (const item of cat.items) {
        if (item.tag !== undefined) {
          expect(["must", "opt"]).toContain(item.tag);
        }
      }
    }
  });

  it("all items carry a tag field (ticket requirement: every item is categorised)", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      for (const item of cat.items) {
        expect(item.tag).toBeDefined();
      }
    }
  });

  it("category ids are unique", () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("item ids are unique across all categories", () => {
    const allIds = DEFAULT_CATEGORIES.flatMap((c) => c.items.map((i) => i.id));
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });
});
