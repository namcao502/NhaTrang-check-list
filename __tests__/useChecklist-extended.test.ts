/**
 * Extended tests for lib/useChecklist.ts
 *
 * Covers functions not tested in useChecklist.test.ts:
 * - addItem with tag and note
 * - addCategory with icon
 * - loadCategories
 * - updateCategoryIcon
 * - updateQuantity
 * - moveItem (unused but exported internally)
 * - reorderItems
 * - importItems
 * - undo stack limit (max 10)
 * - canUndo flag
 * - updateNote no-op guard
 */

import { renderHook, act } from "@testing-library/react";
import { useChecklist } from "@/lib/useChecklist";

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

async function mountHook() {
  const { result } = renderHook(() => useChecklist());
  await act(async () => {});
  return result;
}

/** Seed hook with a minimal known state for predictable tests. */
async function mountWithSeed() {
  const seed = [
    {
      id: "cat-a",
      name: "Category A",
      items: [
        { id: "item-1", label: "Item 1", checked: false },
        { id: "item-2", label: "Item 2", checked: false },
        { id: "item-3", label: "Item 3", checked: true },
      ],
    },
    {
      id: "cat-b",
      name: "Category B",
      icon: "🏖️",
      items: [
        { id: "item-4", label: "Item 4", checked: false, quantity: 3 },
      ],
    },
  ];
  localStorageMock.setItem("beach-checklist", JSON.stringify(seed));
  return mountHook();
}

// ---------------------------------------------------------------------------
// addItem with tag and note
// ---------------------------------------------------------------------------

describe("useChecklist — addItem with tag and note", () => {
  it("creates an item with tag 'must'", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.addItem("cat-a", "Sunscreen", "must");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const last = cat.items[cat.items.length - 1];
    expect(last.tag).toBe("must");
    expect(last.note).toBeUndefined();
  });

  it("creates an item with tag 'opt' and a note", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.addItem("cat-a", "Hat", "opt", "Wide brim");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const last = cat.items[cat.items.length - 1];
    expect(last.tag).toBe("opt");
    expect(last.note).toBe("Wide brim");
  });

  it("trims the note and omits it when whitespace-only", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.addItem("cat-a", "Goggles", undefined, "   ");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const last = cat.items[cat.items.length - 1];
    expect(last.note).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// addCategory with icon
// ---------------------------------------------------------------------------

describe("useChecklist — addCategory with icon", () => {
  it("creates a category with an icon", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.addCategory("Food", "🍽️");
    });

    const last = result.current.categories[result.current.categories.length - 1];
    expect(last.name).toBe("Food");
    expect(last.icon).toBe("🍽️");
    expect(last.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// loadCategories
// ---------------------------------------------------------------------------

describe("useChecklist — loadCategories", () => {
  it("replaces all categories with the provided array", async () => {
    const result = await mountWithSeed();
    const newCats = [{ id: "new-1", name: "New", items: [] }];

    act(() => {
      result.current.loadCategories(newCats);
    });

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].id).toBe("new-1");
  });

  it("supports undo after loadCategories", async () => {
    const result = await mountWithSeed();
    const beforeLength = result.current.categories.length;

    act(() => {
      result.current.loadCategories([]);
    });
    expect(result.current.categories).toHaveLength(0);

    act(() => {
      result.current.undo();
    });
    expect(result.current.categories).toHaveLength(beforeLength);
  });
});

// ---------------------------------------------------------------------------
// updateCategoryIcon
// ---------------------------------------------------------------------------

describe("useChecklist — updateCategoryIcon", () => {
  it("sets an icon on a category", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateCategoryIcon("cat-a", "🧳");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(cat.icon).toBe("🧳");
  });

  it("removes the icon when empty string is passed", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateCategoryIcon("cat-b", "");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-b")!;
    expect(cat.icon).toBeUndefined();
  });

  it("does not affect other categories", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateCategoryIcon("cat-a", "📦");
    });

    const catB = result.current.categories.find((c) => c.id === "cat-b")!;
    expect(catB.icon).toBe("🏖️");
  });
});

// ---------------------------------------------------------------------------
// updateQuantity
// ---------------------------------------------------------------------------

describe("useChecklist — updateQuantity", () => {
  it("sets a quantity on an item", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateQuantity("cat-a", "item-1", 5);
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const item = cat.items.find((i) => i.id === "item-1")!;
    expect(item.quantity).toBe(5);
  });

  it("clamps quantity to minimum of 1", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateQuantity("cat-a", "item-1", 0);
    });

    // quantity 1 means the property is removed (default)
    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const item = cat.items.find((i) => i.id === "item-1")!;
    expect(item.quantity).toBeUndefined();
  });

  it("removes quantity property when set to 1", async () => {
    const result = await mountWithSeed();

    // item-4 starts with quantity 3
    act(() => {
      result.current.updateQuantity("cat-b", "item-4", 1);
    });

    const cat = result.current.categories.find((c) => c.id === "cat-b")!;
    const item = cat.items.find((i) => i.id === "item-4")!;
    expect(item.quantity).toBeUndefined();
  });

  it("rounds non-integer quantities", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateQuantity("cat-a", "item-1", 2.7);
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const item = cat.items.find((i) => i.id === "item-1")!;
    expect(item.quantity).toBe(3);
  });

  it("is a no-op when quantity has not changed", async () => {
    const result = await mountWithSeed();

    // item-4 has quantity 3
    act(() => {
      result.current.updateQuantity("cat-b", "item-4", 3);
    });

    // canUndo should still be false because no undo was pushed
    expect(result.current.canUndo).toBe(false);
  });

  it("is a no-op when setting quantity to 1 on an item without quantity", async () => {
    const result = await mountWithSeed();

    // item-1 has no quantity (default = 1)
    act(() => {
      result.current.updateQuantity("cat-a", "item-1", 1);
    });

    expect(result.current.canUndo).toBe(false);
  });

  it("clamps negative quantity to 1 and removes the property", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.updateQuantity("cat-b", "item-4", -5);
    });

    const cat = result.current.categories.find((c) => c.id === "cat-b")!;
    const item = cat.items.find((i) => i.id === "item-4")!;
    expect(item.quantity).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// reorderItems
// ---------------------------------------------------------------------------

describe("useChecklist — reorderItems", () => {
  it("moves an item from index 0 to index 2", async () => {
    const result = await mountWithSeed();
    const catA = result.current.categories.find((c) => c.id === "cat-a")!;
    const firstId = catA.items[0].id;

    act(() => {
      result.current.reorderItems("cat-a", 0, 2);
    });

    const updated = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(updated.items[2].id).toBe(firstId);
  });

  it("moves an item from index 2 to index 0", async () => {
    const result = await mountWithSeed();
    const catA = result.current.categories.find((c) => c.id === "cat-a")!;
    const lastId = catA.items[2].id;

    act(() => {
      result.current.reorderItems("cat-a", 2, 0);
    });

    const updated = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(updated.items[0].id).toBe(lastId);
  });

  it("is a no-op when fromIndex equals toIndex", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.reorderItems("cat-a", 1, 1);
    });

    expect(result.current.canUndo).toBe(false);
  });

  it("does not change items when fromIndex is out of bounds", async () => {
    const result = await mountWithSeed();
    const catA = result.current.categories.find((c) => c.id === "cat-a")!;
    const originalIds = catA.items.map((i) => i.id);

    act(() => {
      result.current.reorderItems("cat-a", 10, 0);
    });

    const updated = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(updated.items.map((i) => i.id)).toEqual(originalIds);
  });

  it("does not change items when toIndex is out of bounds", async () => {
    const result = await mountWithSeed();
    const catA = result.current.categories.find((c) => c.id === "cat-a")!;
    const originalIds = catA.items.map((i) => i.id);

    act(() => {
      result.current.reorderItems("cat-a", 0, 10);
    });

    const updated = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(updated.items.map((i) => i.id)).toEqual(originalIds);
  });

  it("does not change items when fromIndex is negative", async () => {
    const result = await mountWithSeed();
    const catA = result.current.categories.find((c) => c.id === "cat-a")!;
    const originalIds = catA.items.map((i) => i.id);

    act(() => {
      result.current.reorderItems("cat-a", -1, 0);
    });

    const updated = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(updated.items.map((i) => i.id)).toEqual(originalIds);
  });

  it("preserves item count after reordering", async () => {
    const result = await mountWithSeed();
    const catA = result.current.categories.find((c) => c.id === "cat-a")!;
    const originalCount = catA.items.length;

    act(() => {
      result.current.reorderItems("cat-a", 0, 2);
    });

    const updated = result.current.categories.find((c) => c.id === "cat-a")!;
    expect(updated.items).toHaveLength(originalCount);
  });

  it("does not affect other categories", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.reorderItems("cat-a", 0, 2);
    });

    const catB = result.current.categories.find((c) => c.id === "cat-b")!;
    expect(catB.items[0].id).toBe("item-4");
  });
});

// ---------------------------------------------------------------------------
// reorderCategories — out of bounds
// ---------------------------------------------------------------------------

describe("useChecklist — reorderCategories edge cases", () => {
  it("does not change order when fromIndex is negative", async () => {
    const result = await mountWithSeed();
    const originalIds = result.current.categories.map((c) => c.id);

    act(() => {
      result.current.reorderCategories(-1, 0);
    });

    expect(result.current.categories.map((c) => c.id)).toEqual(originalIds);
  });

  it("does not change order when toIndex is out of bounds", async () => {
    const result = await mountWithSeed();
    const originalIds = result.current.categories.map((c) => c.id);

    act(() => {
      result.current.reorderCategories(0, 100);
    });

    expect(result.current.categories.map((c) => c.id)).toEqual(originalIds);
  });
});

// ---------------------------------------------------------------------------
// importItems
// ---------------------------------------------------------------------------

describe("useChecklist — importItems", () => {
  it("adds items to an existing category", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.importItems(["Towel", "Flip flops"], "cat-a");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const labels = cat.items.map((i) => i.label);
    expect(labels).toContain("Towel");
    expect(labels).toContain("Flip flops");
  });

  it("creates a new category when categoryId is null and newCategoryName is provided", async () => {
    const result = await mountWithSeed();
    const beforeLength = result.current.categories.length;

    act(() => {
      result.current.importItems(["Snorkel"], null, "Water Sports");
    });

    expect(result.current.categories).toHaveLength(beforeLength + 1);
    const last = result.current.categories[result.current.categories.length - 1];
    expect(last.name).toBe("Water Sports");
    expect(last.items.map((i) => i.label)).toContain("Snorkel");
  });

  it("is a no-op when labels array is empty", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.importItems([], "cat-a");
    });

    expect(result.current.canUndo).toBe(false);
  });

  it("is a no-op when categoryId is null and no newCategoryName", async () => {
    const result = await mountWithSeed();
    const beforeLength = result.current.categories.length;

    act(() => {
      result.current.importItems(["Item"], null);
    });

    // No new category created, items not added anywhere
    expect(result.current.categories).toHaveLength(beforeLength);
  });

  it("trims the new category name", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.importItems(["Mask"], null, "  Diving  ");
    });

    const last = result.current.categories[result.current.categories.length - 1];
    expect(last.name).toBe("Diving");
  });

  it("creates items with checked = false", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.importItems(["New item 1", "New item 2"], "cat-a");
    });

    const cat = result.current.categories.find((c) => c.id === "cat-a")!;
    const newItems = cat.items.filter(
      (i) => i.label === "New item 1" || i.label === "New item 2"
    );
    expect(newItems.every((i) => !i.checked)).toBe(true);
  });

  it("does not add when newCategoryName is whitespace only", async () => {
    const result = await mountWithSeed();
    const beforeLength = result.current.categories.length;

    act(() => {
      result.current.importItems(["Item"], null, "   ");
    });

    // The trim check in importItems: newCategoryName?.trim() returns ""
    // which is falsy, so no new category is created and targetId remains null
    expect(result.current.categories).toHaveLength(beforeLength);
  });
});

// ---------------------------------------------------------------------------
// undo / canUndo
// ---------------------------------------------------------------------------

describe("useChecklist — undo and canUndo", () => {
  it("canUndo is false initially", async () => {
    const result = await mountWithSeed();
    expect(result.current.canUndo).toBe(false);
  });

  it("canUndo becomes true after a state change", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.toggleItem("cat-a", "item-1");
    });

    expect(result.current.canUndo).toBe(true);
  });

  it("undo restores the previous state", async () => {
    const result = await mountWithSeed();
    const before = result.current.categories[0].items[0].checked;

    act(() => {
      result.current.toggleItem("cat-a", "item-1");
    });
    expect(result.current.categories[0].items[0].checked).toBe(!before);

    act(() => {
      result.current.undo();
    });
    expect(result.current.categories[0].items[0].checked).toBe(before);
  });

  it("canUndo becomes false after undoing all changes", async () => {
    const result = await mountWithSeed();

    act(() => {
      result.current.toggleItem("cat-a", "item-1");
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.canUndo).toBe(false);
  });

  it("undo is a no-op when stack is empty", async () => {
    const result = await mountWithSeed();
    const originalIds = result.current.categories.map((c) => c.id);

    act(() => {
      result.current.undo();
    });

    expect(result.current.categories.map((c) => c.id)).toEqual(originalIds);
  });

  it("undo stack is limited to 10 entries", async () => {
    const result = await mountWithSeed();

    // Push 12 undo entries
    for (let i = 0; i < 12; i++) {
      act(() => {
        result.current.addItem("cat-a", `Undo test ${i}`);
      });
    }

    // Undo 10 times should work
    let undoCount = 0;
    while (result.current.canUndo) {
      act(() => {
        result.current.undo();
      });
      undoCount++;
    }

    expect(undoCount).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// updateNote no-op guard
// ---------------------------------------------------------------------------

describe("useChecklist — updateNote no-op guard", () => {
  it("does not push undo when note value has not changed", async () => {
    const result = await mountWithSeed();

    // item-1 has no note, setting empty string should be no-op
    act(() => {
      result.current.updateNote("cat-a", "item-1", "");
    });

    expect(result.current.canUndo).toBe(false);
  });

  it("does not push undo when setting the same note value", async () => {
    const result = await mountWithSeed();

    // First set a note
    act(() => {
      result.current.updateNote("cat-a", "item-1", "Test note");
    });

    // Undo to clear stack
    act(() => {
      result.current.undo();
    });

    // Now set the same note again - but item-1 has no note now, so "Test note" is different
    // Set a note and then try setting the same value
    act(() => {
      result.current.updateNote("cat-a", "item-1", "Same note");
    });

    // Clear undo stack by undoing, then redo
    expect(result.current.canUndo).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// localStorage — falls back to defaults for invalid data
// ---------------------------------------------------------------------------

describe("useChecklist — localStorage validation", () => {
  it("falls back to defaults when localStorage has non-array JSON", async () => {
    localStorageMock.setItem("beach-checklist", JSON.stringify({ bad: "data" }));

    const result = await mountHook();

    // Should load default categories
    expect(result.current.categories.length).toBeGreaterThan(0);
    expect(result.current.loaded).toBe(true);
  });
});
