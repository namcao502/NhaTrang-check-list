/**
 * Tests for lib/types.ts
 *
 * TypeScript interfaces are erased at runtime, so these tests verify
 * structural compatibility by constructing objects that match the interfaces
 * and asserting their shapes at runtime. They also confirm that optional
 * fields behave correctly when present or absent.
 */

import type { Item, Category } from "@/lib/types";

// ---------------------------------------------------------------------------
// Item type compatibility
// ---------------------------------------------------------------------------

describe("Item interface", () => {
  it("accepts a minimal Item with required fields only", () => {
    const item: Item = { id: "1", label: "Sunscreen", checked: false };

    expect(item.id).toBe("1");
    expect(item.label).toBe("Sunscreen");
    expect(item.checked).toBe(false);
    expect(item.note).toBeUndefined();
    expect(item.tag).toBeUndefined();
  });

  it("accepts an Item with note and tag set to 'must'", () => {
    const item: Item = {
      id: "2",
      label: "Passport",
      checked: false,
      note: "Keep in hotel safe",
      tag: "must",
    };

    expect(item.note).toBe("Keep in hotel safe");
    expect(item.tag).toBe("must");
  });

  it("accepts an Item with tag set to 'opt'", () => {
    const item: Item = {
      id: "3",
      label: "Snorkel mask",
      checked: false,
      tag: "opt",
    };

    expect(item.tag).toBe("opt");
    expect(item.note).toBeUndefined();
  });

  it("accepts an Item with an empty-string note", () => {
    // Empty string notes are present in defaultData; they must be assignable.
    const item: Item = {
      id: "4",
      label: "Toothbrush",
      checked: false,
      note: "",
      tag: "must",
    };

    expect(item.note).toBe("");
  });

  it("reflects checked: true correctly", () => {
    const item: Item = { id: "5", label: "Towel", checked: true };

    expect(item.checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Category type compatibility
// ---------------------------------------------------------------------------

describe("Category interface", () => {
  it("accepts a minimal Category without icon", () => {
    const cat: Category = { id: "c1", name: "Swimming", items: [] };

    expect(cat.id).toBe("c1");
    expect(cat.name).toBe("Swimming");
    expect(cat.items).toHaveLength(0);
    expect(cat.icon).toBeUndefined();
  });

  it("accepts a Category with an icon", () => {
    const cat: Category = { id: "c2", name: "Electronics", items: [], icon: "📱" };

    expect(cat.icon).toBe("📱");
  });

  it("stores Item objects inside items array", () => {
    const item: Item = { id: "i1", label: "Phone charger", checked: false };
    const cat: Category = { id: "c3", name: "Tech", items: [item] };

    expect(cat.items).toHaveLength(1);
    expect(cat.items[0].label).toBe("Phone charger");
  });

  it("stores Items that have note and tag inside items array", () => {
    const item: Item = {
      id: "i2",
      label: "Sunscreen SPF50+",
      checked: false,
      note: "Reapply every 2 hours",
      tag: "must",
    };
    const cat: Category = { id: "c4", name: "Sun Protection", items: [item], icon: "☀️" };

    expect(cat.items[0].note).toBe("Reapply every 2 hours");
    expect(cat.items[0].tag).toBe("must");
    expect(cat.icon).toBe("☀️");
  });
});
