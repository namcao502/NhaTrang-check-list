/**
 * Tests for lib/validation.ts
 *
 * Verifies runtime type guards used to validate data read from localStorage:
 * - isValidCategories: validates Category[] shape
 * - isValidCollapseState: validates Record<string, boolean> shape
 * - isValidNotifiedDates: validates string[] shape
 * - isValidDateString: validates YYYY-MM-DD date strings
 */

import {
  isValidCategories,
  isValidCollapseState,
  isValidNotifiedDates,
  isValidDateString,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// isValidCategories
// ---------------------------------------------------------------------------

describe("isValidCategories", () => {
  const validItem = { id: "i1", label: "Sunscreen", checked: false };
  const validCategory = { id: "c1", name: "Sun Protection", items: [validItem] };

  it("accepts a valid categories array with one category", () => {
    expect(isValidCategories([validCategory])).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(isValidCategories([])).toBe(true);
  });

  it("accepts a category with an icon field", () => {
    const catWithIcon = { ...validCategory, icon: "☀️" };
    expect(isValidCategories([catWithIcon])).toBe(true);
  });

  it("accepts a category with empty items array", () => {
    const catNoItems = { id: "c2", name: "Empty", items: [] };
    expect(isValidCategories([catNoItems])).toBe(true);
  });

  it("accepts items with optional note field", () => {
    const itemWithNote = { ...validItem, note: "Reapply every 2h" };
    const cat = { ...validCategory, items: [itemWithNote] };
    expect(isValidCategories([cat])).toBe(true);
  });

  it("accepts items with tag 'must'", () => {
    const item = { ...validItem, tag: "must" };
    const cat = { ...validCategory, items: [item] };
    expect(isValidCategories([cat])).toBe(true);
  });

  it("accepts items with tag 'opt'", () => {
    const item = { ...validItem, tag: "opt" };
    const cat = { ...validCategory, items: [item] };
    expect(isValidCategories([cat])).toBe(true);
  });

  it("rejects non-array values", () => {
    expect(isValidCategories(null)).toBe(false);
    expect(isValidCategories(undefined)).toBe(false);
    expect(isValidCategories("string")).toBe(false);
    expect(isValidCategories(42)).toBe(false);
    expect(isValidCategories({})).toBe(false);
  });

  it("rejects a category missing the id field", () => {
    const bad = { name: "No ID", items: [] };
    expect(isValidCategories([bad])).toBe(false);
  });

  it("rejects a category missing the name field", () => {
    const bad = { id: "c1", items: [] };
    expect(isValidCategories([bad])).toBe(false);
  });

  it("rejects a category missing the items field", () => {
    const bad = { id: "c1", name: "No Items" };
    expect(isValidCategories([bad])).toBe(false);
  });

  it("rejects a category with non-array items", () => {
    const bad = { id: "c1", name: "Bad", items: "not-array" };
    expect(isValidCategories([bad])).toBe(false);
  });

  it("rejects a category with numeric id", () => {
    const bad = { id: 123, name: "Numeric ID", items: [] };
    expect(isValidCategories([bad])).toBe(false);
  });

  it("rejects a category with non-string icon", () => {
    const bad = { id: "c1", name: "Bad Icon", items: [], icon: 42 };
    expect(isValidCategories([bad])).toBe(false);
  });

  it("rejects when a category entry is null", () => {
    expect(isValidCategories([null])).toBe(false);
  });

  it("rejects when a category entry is a primitive", () => {
    expect(isValidCategories(["string"])).toBe(false);
  });

  it("rejects an item missing the id field", () => {
    const badItem = { label: "No ID", checked: false };
    const cat = { id: "c1", name: "Cat", items: [badItem] };
    expect(isValidCategories([cat])).toBe(false);
  });

  it("rejects an item missing the label field", () => {
    const badItem = { id: "i1", checked: false };
    const cat = { id: "c1", name: "Cat", items: [badItem] };
    expect(isValidCategories([cat])).toBe(false);
  });

  it("rejects an item missing the checked field", () => {
    const badItem = { id: "i1", label: "No checked" };
    const cat = { id: "c1", name: "Cat", items: [badItem] };
    expect(isValidCategories([cat])).toBe(false);
  });

  it("rejects an item with non-boolean checked", () => {
    const badItem = { id: "i1", label: "Bad", checked: "yes" };
    const cat = { id: "c1", name: "Cat", items: [badItem] };
    expect(isValidCategories([cat])).toBe(false);
  });

  it("rejects an item with invalid tag value", () => {
    const badItem = { id: "i1", label: "Bad Tag", checked: false, tag: "important" };
    const cat = { id: "c1", name: "Cat", items: [badItem] };
    expect(isValidCategories([cat])).toBe(false);
  });

  it("rejects an item with non-string note", () => {
    const badItem = { id: "i1", label: "Bad Note", checked: false, note: 123 };
    const cat = { id: "c1", name: "Cat", items: [badItem] };
    expect(isValidCategories([cat])).toBe(false);
  });

  it("accepts multiple valid categories", () => {
    const cat1 = { id: "c1", name: "A", items: [validItem] };
    const cat2 = { id: "c2", name: "B", items: [], icon: "📦" };
    expect(isValidCategories([cat1, cat2])).toBe(true);
  });

  it("rejects if any single category in the array is invalid", () => {
    const good = { id: "c1", name: "Good", items: [] };
    const bad = { id: 99, name: "Bad", items: [] };
    expect(isValidCategories([good, bad])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidCollapseState
// ---------------------------------------------------------------------------

describe("isValidCollapseState", () => {
  it("accepts a valid collapse state object", () => {
    expect(isValidCollapseState({ "cat-1": true, "cat-2": false })).toBe(true);
  });

  it("accepts an empty object", () => {
    expect(isValidCollapseState({})).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidCollapseState(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidCollapseState(undefined)).toBe(false);
  });

  it("rejects an array", () => {
    expect(isValidCollapseState([true, false])).toBe(false);
  });

  it("rejects primitive values", () => {
    expect(isValidCollapseState("string")).toBe(false);
    expect(isValidCollapseState(42)).toBe(false);
    expect(isValidCollapseState(true)).toBe(false);
  });

  it("rejects an object with non-boolean values", () => {
    expect(isValidCollapseState({ "cat-1": "true" })).toBe(false);
    expect(isValidCollapseState({ "cat-1": 1 })).toBe(false);
    expect(isValidCollapseState({ "cat-1": null })).toBe(false);
  });

  it("rejects if any value in the object is non-boolean", () => {
    expect(isValidCollapseState({ "cat-1": true, "cat-2": "false" })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidNotifiedDates
// ---------------------------------------------------------------------------

describe("isValidNotifiedDates", () => {
  it("accepts a valid string array", () => {
    expect(isValidNotifiedDates(["2025-06-01", "2025-06-02"])).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(isValidNotifiedDates([])).toBe(true);
  });

  it("rejects non-array values", () => {
    expect(isValidNotifiedDates(null)).toBe(false);
    expect(isValidNotifiedDates(undefined)).toBe(false);
    expect(isValidNotifiedDates("2025-06-01")).toBe(false);
    expect(isValidNotifiedDates({})).toBe(false);
    expect(isValidNotifiedDates(42)).toBe(false);
  });

  it("rejects an array containing non-string elements", () => {
    expect(isValidNotifiedDates([123])).toBe(false);
    expect(isValidNotifiedDates([true])).toBe(false);
    expect(isValidNotifiedDates([null])).toBe(false);
  });

  it("rejects a mixed array of strings and non-strings", () => {
    expect(isValidNotifiedDates(["2025-06-01", 42])).toBe(false);
    expect(isValidNotifiedDates(["2025-06-01", null])).toBe(false);
  });

  it("accepts an array with a single string", () => {
    expect(isValidNotifiedDates(["2025-06-01"])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isValidDateString
// ---------------------------------------------------------------------------

describe("isValidDateString", () => {
  it("accepts a valid YYYY-MM-DD date", () => {
    expect(isValidDateString("2025-06-15")).toBe(true);
  });

  it("accepts the first day of a year", () => {
    expect(isValidDateString("2025-01-01")).toBe(true);
  });

  it("accepts the last day of a year", () => {
    expect(isValidDateString("2025-12-31")).toBe(true);
  });

  it("accepts a leap year date", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidDateString("")).toBe(false);
  });

  it("rejects a date with wrong separator", () => {
    expect(isValidDateString("2025/06/15")).toBe(false);
  });

  it("rejects a date in DD-MM-YYYY format", () => {
    expect(isValidDateString("15-06-2025")).toBe(false);
  });

  it("rejects a date with single-digit month and day", () => {
    expect(isValidDateString("2025-6-5")).toBe(false);
  });

  it("rejects random text", () => {
    expect(isValidDateString("not-a-date")).toBe(false);
  });

  it("rejects a date with extra characters", () => {
    expect(isValidDateString("2025-06-15T00:00:00")).toBe(false);
  });

  // Note: The implementation uses `new Date()` which rolls over invalid
  // calendar dates (e.g., Feb 30 becomes Mar 2). These dates pass the
  // format regex and produce a valid Date object, so the function returns
  // true. This is a known limitation -- the guard validates format and
  // parsability, not strict calendar correctness.
  it("does not reject rolled-over dates like February 30 (Date constructor limitation)", () => {
    expect(isValidDateString("2025-02-30")).toBe(true);
  });

  it("does not reject February 29 on a non-leap year (Date constructor limitation)", () => {
    expect(isValidDateString("2025-02-29")).toBe(true);
  });

  it("rejects month 13", () => {
    expect(isValidDateString("2025-13-01")).toBe(false);
  });

  it("rejects day 00", () => {
    expect(isValidDateString("2025-06-00")).toBe(false);
  });

  it("rejects month 00", () => {
    expect(isValidDateString("2025-00-15")).toBe(false);
  });
});
