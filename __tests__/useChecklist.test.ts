/**
 * Tests for lib/useChecklist.ts
 *
 * Covers: toggleItem, addItem (no note/tag), removeItem, addCategory (no icon),
 * resetAll, localStorage persistence, and derived totalItems / checkedItems.
 *
 * localStorage is replaced with an in-memory implementation before each test
 * so tests are isolated and do not mutate the real storage.
 */

import { renderHook, act } from "@testing-library/react";
import { useChecklist } from "@/lib/useChecklist";
import { DEFAULT_CATEGORIES } from "@/lib/defaultData";

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the hook's initial useEffect (localStorage load) to complete. */
async function mountHook() {
  const { result } = renderHook(() => useChecklist());
  // Wait for loaded flag to become true
  await act(async () => {});
  return result;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useChecklist — initial state", () => {
  it("loads DEFAULT_CATEGORIES when localStorage is empty", async () => {
    const result = await mountHook();

    expect(result.current.categories).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(result.current.loaded).toBe(true);
  });

  it("totalItems equals the sum of all default items", async () => {
    const result = await mountHook();
    const expected = DEFAULT_CATEGORIES.reduce((s, c) => s + c.items.length, 0);

    expect(result.current.totalItems).toBe(expected);
  });

  it("checkedItems is 0 when all items start unchecked", async () => {
    const result = await mountHook();

    expect(result.current.checkedItems).toBe(0);
  });

  it("restores categories saved in localStorage", async () => {
    const saved = [{ id: "test-cat", name: "Test", items: [], icon: "🏖️" }];
    localStorageMock.setItem("beach-checklist", JSON.stringify(saved));

    const result = await mountHook();

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].id).toBe("test-cat");
  });

  it("falls back to DEFAULT_CATEGORIES when localStorage contains invalid JSON", async () => {
    localStorageMock.setItem("beach-checklist", "not-valid-json{{{");

    const result = await mountHook();

    expect(result.current.categories).toHaveLength(DEFAULT_CATEGORIES.length);
  });
});

// ---------------------------------------------------------------------------
// toggleItem
// ---------------------------------------------------------------------------

describe("useChecklist — toggleItem", () => {
  it("marks an unchecked item as checked", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const firstItem = firstCat.items[0];

    act(() => {
      result.current.toggleItem(firstCat.id, firstItem.id);
    });

    const updatedItem = result.current.categories[0].items[0];
    expect(updatedItem.checked).toBe(true);
  });

  it("marks a checked item back to unchecked", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const firstItem = firstCat.items[0];

    act(() => { result.current.toggleItem(firstCat.id, firstItem.id); });
    act(() => { result.current.toggleItem(firstCat.id, firstItem.id); });

    expect(result.current.categories[0].items[0].checked).toBe(false);
  });

  it("increments checkedItems when an item is toggled on", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.toggleItem(firstCat.id, firstCat.items[0].id);
    });

    expect(result.current.checkedItems).toBe(1);
  });

  it("does not affect other categories when toggling", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.toggleItem(firstCat.id, firstCat.items[0].id);
    });

    // All other categories should have 0 checked items
    const otherChecked = result.current.categories
      .slice(1)
      .flatMap((c) => c.items)
      .filter((i) => i.checked).length;
    expect(otherChecked).toBe(0);
  });

  it("does nothing when categoryId does not exist", async () => {
    const result = await mountHook();
    const before = result.current.checkedItems;

    act(() => {
      result.current.toggleItem("non-existent-cat", "some-item");
    });

    expect(result.current.checkedItems).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// addItem
// ---------------------------------------------------------------------------

describe("useChecklist — addItem", () => {
  it("appends a new item with no note or tag to the correct category", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const beforeCount = firstCat.items.length;

    act(() => {
      result.current.addItem(firstCat.id, "New beach item");
    });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    expect(cat.items).toHaveLength(beforeCount + 1);

    const newItem = cat.items[cat.items.length - 1];
    expect(newItem.label).toBe("New beach item");
    expect(newItem.checked).toBe(false);
    expect(newItem.note).toBeUndefined();
    expect(newItem.tag).toBeUndefined();
  });

  it("trims whitespace from the label", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.addItem(firstCat.id, "  Trimmed label  ");
    });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    const last = cat.items[cat.items.length - 1];
    expect(last.label).toBe("Trimmed label");
  });

  it("does not add an item when label is empty string", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const beforeCount = firstCat.items.length;

    act(() => {
      result.current.addItem(firstCat.id, "");
    });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    expect(cat.items).toHaveLength(beforeCount);
  });

  it("does not add an item when label is only whitespace", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const beforeCount = firstCat.items.length;

    act(() => {
      result.current.addItem(firstCat.id, "   ");
    });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    expect(cat.items).toHaveLength(beforeCount);
  });

  it("generates a unique id for each new item", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];

    act(() => { result.current.addItem(firstCat.id, "Item A"); });
    act(() => { result.current.addItem(firstCat.id, "Item B"); });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    const ids = cat.items.map((i) => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// removeItem
// ---------------------------------------------------------------------------

describe("useChecklist — removeItem", () => {
  it("removes the correct item from the category", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const targetId = firstCat.items[0].id;

    act(() => {
      result.current.removeItem(firstCat.id, targetId);
    });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    expect(cat.items.find((i) => i.id === targetId)).toBeUndefined();
  });

  it("decrements totalItems by 1 after removal", async () => {
    const result = await mountHook();
    const before = result.current.totalItems;
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.removeItem(firstCat.id, firstCat.items[0].id);
    });

    expect(result.current.totalItems).toBe(before - 1);
  });

  it("does not affect other items in the same category", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];
    const targetId = firstCat.items[0].id;
    const survivorId = firstCat.items[1]?.id;

    if (!survivorId) return; // skip if category has only 1 item

    act(() => {
      result.current.removeItem(firstCat.id, targetId);
    });

    const cat = result.current.categories.find((c) => c.id === firstCat.id)!;
    expect(cat.items.find((i) => i.id === survivorId)).toBeDefined();
  });

  it("does nothing when itemId does not exist", async () => {
    const result = await mountHook();
    const before = result.current.totalItems;
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.removeItem(firstCat.id, "ghost-item");
    });

    expect(result.current.totalItems).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// addCategory
// ---------------------------------------------------------------------------

describe("useChecklist — addCategory", () => {
  it("appends a new category with no icon", async () => {
    const result = await mountHook();
    const before = result.current.categories.length;

    act(() => {
      result.current.addCategory("New Category");
    });

    expect(result.current.categories).toHaveLength(before + 1);
    const last = result.current.categories[result.current.categories.length - 1];
    expect(last.name).toBe("New Category");
    expect(last.items).toHaveLength(0);
    expect(last.icon).toBeUndefined();
  });

  it("trims whitespace from the category name", async () => {
    const result = await mountHook();

    act(() => {
      result.current.addCategory("  Extras  ");
    });

    const last = result.current.categories[result.current.categories.length - 1];
    expect(last.name).toBe("Extras");
  });

  it("does not add a category when name is empty", async () => {
    const result = await mountHook();
    const before = result.current.categories.length;

    act(() => {
      result.current.addCategory("");
    });

    expect(result.current.categories).toHaveLength(before);
  });

  it("does not add a category when name is only whitespace", async () => {
    const result = await mountHook();
    const before = result.current.categories.length;

    act(() => {
      result.current.addCategory("   ");
    });

    expect(result.current.categories).toHaveLength(before);
  });

  it("generates a unique id for the new category", async () => {
    const result = await mountHook();

    act(() => { result.current.addCategory("Cat A"); });
    act(() => { result.current.addCategory("Cat B"); });

    const ids = result.current.categories.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// resetAll
// ---------------------------------------------------------------------------

describe("useChecklist — resetAll", () => {
  it("restores categories to DEFAULT_CATEGORIES", async () => {
    const result = await mountHook();

    // Mutate state first
    act(() => {
      result.current.addCategory("Temp Category");
      result.current.toggleItem(
        result.current.categories[0].id,
        result.current.categories[0].items[0].id
      );
    });

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.categories).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(result.current.checkedItems).toBe(0);
  });

  it("resets totalItems to the default count after reset", async () => {
    const result = await mountHook();
    const expected = DEFAULT_CATEGORIES.reduce((s, c) => s + c.items.length, 0);

    act(() => { result.current.addItem(result.current.categories[0].id, "Extra item"); });
    act(() => { result.current.resetAll(); });

    expect(result.current.totalItems).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// moveCategory
// ---------------------------------------------------------------------------

describe("useChecklist — moveCategory", () => {
  it("moves a category up by swapping it with the one above", async () => {
    const result = await mountHook();
    const secondId = result.current.categories[1].id;

    act(() => {
      result.current.moveCategory(secondId, "up");
    });

    expect(result.current.categories[0].id).toBe(secondId);
  });

  it("moves a category down by swapping it with the one below", async () => {
    const result = await mountHook();
    const firstId = result.current.categories[0].id;

    act(() => {
      result.current.moveCategory(firstId, "down");
    });

    expect(result.current.categories[1].id).toBe(firstId);
  });

  it("does not change order when moving the first category up (boundary)", async () => {
    const result = await mountHook();
    const originalIds = result.current.categories.map((c) => c.id);

    act(() => {
      result.current.moveCategory(originalIds[0], "up");
    });

    const newIds = result.current.categories.map((c) => c.id);
    expect(newIds).toEqual(originalIds);
  });

  it("does not change order when moving the last category down (boundary)", async () => {
    const result = await mountHook();
    const originalIds = result.current.categories.map((c) => c.id);
    const lastId = originalIds[originalIds.length - 1];

    act(() => {
      result.current.moveCategory(lastId, "down");
    });

    const newIds = result.current.categories.map((c) => c.id);
    expect(newIds).toEqual(originalIds);
  });

  it("does nothing when categoryId does not exist", async () => {
    const result = await mountHook();
    const originalIds = result.current.categories.map((c) => c.id);

    act(() => {
      result.current.moveCategory("non-existent-cat", "up");
    });

    const newIds = result.current.categories.map((c) => c.id);
    expect(newIds).toEqual(originalIds);
  });

  it("preserves category count after moving", async () => {
    const result = await mountHook();
    const count = result.current.categories.length;

    act(() => {
      result.current.moveCategory(result.current.categories[0].id, "down");
    });

    expect(result.current.categories).toHaveLength(count);
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("useChecklist — localStorage persistence", () => {
  it("persists state to localStorage after a toggle", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.toggleItem(firstCat.id, firstCat.items[0].id);
    });

    const stored = JSON.parse(localStorageMock.getItem("beach-checklist")!);
    const storedItem = stored[0].items[0];
    expect(storedItem.checked).toBe(true);
  });

  it("persists a newly added item to localStorage", async () => {
    const result = await mountHook();
    const firstCat = result.current.categories[0];

    act(() => {
      result.current.addItem(firstCat.id, "Persisted item");
    });

    const stored = JSON.parse(localStorageMock.getItem("beach-checklist")!);
    const labels = stored[0].items.map((i: { label: string }) => i.label);
    expect(labels).toContain("Persisted item");
  });
});
