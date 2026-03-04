/**
 * Tests for components/CategorySection.tsx
 *
 * Covers:
 * - Renders category name.
 * - Renders the icon when category.icon is present.
 * - Does not render an icon element when category.icon is absent.
 * - Renders all items inside the category.
 * - Passes note and tag props down to each ChecklistItem.
 * - Shows "No items yet." placeholder when category has no items.
 * - Collapses and expands the item list when the header button is clicked.
 * - Calls onToggleItem / onAddItem / onRemoveItem with the correct item id.
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategorySection from "@/components/CategorySection";
import type { Category } from "@/lib/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseCategory: Category = {
  id: "cat-1",
  name: "Đồ Bơi & Lặn",
  icon: "🏊",
  items: [
    {
      id: "item-1",
      label: "Đồ bơi",
      checked: false,
      note: "Mang 2 bộ",
      tag: "must",
    },
    {
      id: "item-2",
      label: "Ống thở",
      checked: false,
      tag: "opt",
    },
  ],
};

const categoryWithoutIcon: Category = {
  id: "cat-2",
  name: "No Icon Category",
  items: [{ id: "item-3", label: "Plain item", checked: false }],
};

function makeProps(overrides: Partial<{
  category: Category;
  visibleItems: Category["items"];
  onToggleItem: (id: string) => void;
  onAddItem: (label: string) => void;
  onRemoveItem: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = {}) {
  const category = overrides.category ?? baseCategory;
  return {
    category,
    // Default: show all items (mirrors the no-filter behaviour in page.tsx)
    visibleItems: category.items,
    onToggleItem: jest.fn(),
    onAddItem: jest.fn(),
    onRemoveItem: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Icon rendering
// ---------------------------------------------------------------------------

describe("CategorySection — icon", () => {
  it("renders the category icon when icon is provided", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("🏊")).toBeInTheDocument();
  });

  it("does not render an icon span when category has no icon", () => {
    render(<CategorySection {...makeProps({ category: categoryWithoutIcon })} />);
    // The header button text should only contain the category name.
    const header = screen.getByRole("button", { name: /no icon category/i });
    // No emoji text node should be present as a sibling of the category name.
    // We verify by checking that no element matches the typical icon size class.
    expect(within(header).queryByText(/🏊|📱|👗|🧴|☀️|💊|💳|🎒|👟/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Category name rendering
// ---------------------------------------------------------------------------

describe("CategorySection — name", () => {
  it("renders the category name", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("Đồ Bơi & Lặn")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Items rendering
// ---------------------------------------------------------------------------

describe("CategorySection — items", () => {
  it("renders all item labels", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("Đồ bơi")).toBeInTheDocument();
    expect(screen.getByText("Ống thở")).toBeInTheDocument();
  });

  it("passes note to the ChecklistItem component", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("Mang 2 bộ")).toBeInTheDocument();
  });

  it("passes tag='must' and renders 'Quan trọng' badge", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getAllByText("Quan trọng").length).toBeGreaterThan(0);
  });

  it("passes tag='opt' and renders 'Nên có' badge", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getAllByText("Nên có").length).toBeGreaterThan(0);
  });

  it("shows 'No items yet.' placeholder when items array is empty", () => {
    const emptyCategory: Category = { id: "empty", name: "Empty", items: [] };
    render(<CategorySection {...makeProps({ category: emptyCategory })} />);
    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Collapse / expand
// ---------------------------------------------------------------------------

describe("CategorySection — collapse behaviour", () => {
  // The header button contains the category name. Use the category name
  // (not an item label) to avoid ambiguity with the remove buttons.
  function getHeaderButton() {
    return screen.getByRole("button", { name: /đồ bơi & lặn/i });
  }

  it("shows items by default (expanded)", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("Đồ bơi")).toBeVisible();
  });

  it("hides items after clicking the header button", async () => {
    render(<CategorySection {...makeProps()} />);
    await userEvent.click(getHeaderButton());
    expect(screen.queryByText("Đồ bơi")).not.toBeInTheDocument();
  });

  it("shows items again after a second click on the header button", async () => {
    render(<CategorySection {...makeProps()} />);
    await userEvent.click(getHeaderButton());
    await userEvent.click(getHeaderButton());
    expect(screen.getByText("Đồ bơi")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Interaction callbacks
// ---------------------------------------------------------------------------

describe("CategorySection — callbacks", () => {
  it("calls onToggleItem with the item id when a checkbox is clicked", async () => {
    const onToggleItem = jest.fn();
    render(<CategorySection {...makeProps({ onToggleItem })} />);

    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);

    expect(onToggleItem).toHaveBeenCalledWith("item-1");
  });

  it("calls onRemoveItem with the item id when the remove button is clicked", async () => {
    const onRemoveItem = jest.fn();
    render(<CategorySection {...makeProps({ onRemoveItem })} />);

    const removeBtn = screen.getByRole("button", { name: /remove đồ bơi/i });
    await userEvent.click(removeBtn);

    expect(onRemoveItem).toHaveBeenCalledWith("item-1");
  });

  it("calls onAddItem with the typed label when the add form is submitted", async () => {
    const onAddItem = jest.fn();
    render(<CategorySection {...makeProps({ onAddItem })} />);

    const input = screen.getByPlaceholderText("Add item...");
    await userEvent.type(input, "New snorkel");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAddItem).toHaveBeenCalledWith("New snorkel");
  });
});

// ---------------------------------------------------------------------------
// Progress counter
// ---------------------------------------------------------------------------

describe("CategorySection — progress counter", () => {
  it("shows checked/total count in the header", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });

  it("shows 'Done' indicator when all items are checked", () => {
    const allChecked: Category = {
      ...baseCategory,
      items: baseCategory.items.map((i) => ({ ...i, checked: true })),
    };
    render(<CategorySection {...makeProps({ category: allChecked })} />);
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// visibleItems prop
// ---------------------------------------------------------------------------

describe("CategorySection — visibleItems", () => {
  it("renders only the items passed via visibleItems, not the full category.items list", () => {
    // category has 2 items; pass only the second one as visibleItems
    const onlySecond = [baseCategory.items[1]];
    render(<CategorySection {...makeProps({ visibleItems: onlySecond })} />);

    // Second item visible
    expect(screen.getByText("Ống thở")).toBeInTheDocument();
    // First item must NOT be visible
    expect(screen.queryByText("Đồ bơi")).not.toBeInTheDocument();
  });

  it("shows 'No items yet.' placeholder when visibleItems is an empty array", () => {
    render(<CategorySection {...makeProps({ visibleItems: [] })} />);
    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });

  it("badge counter still reflects the full category.items count, not visibleItems", () => {
    // Pass only 1 visible item but category still has 2
    const onlyFirst = [baseCategory.items[0]];
    render(<CategorySection {...makeProps({ visibleItems: onlyFirst })} />);

    // Badge should show 0/2 (full category count), not 0/1
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Move-up / move-down buttons
// ---------------------------------------------------------------------------

describe("CategorySection — move buttons", () => {
  it("renders the up arrow button when onMoveUp is provided", () => {
    render(<CategorySection {...makeProps({ onMoveUp: jest.fn() })} />);
    expect(screen.getByRole("button", { name: "Di chuyển lên" })).toBeInTheDocument();
  });

  it("renders the down arrow button when onMoveDown is provided", () => {
    render(<CategorySection {...makeProps({ onMoveDown: jest.fn() })} />);
    expect(screen.getByRole("button", { name: "Di chuyển xuống" })).toBeInTheDocument();
  });

  it("does not render the up arrow button when onMoveUp is undefined", () => {
    render(<CategorySection {...makeProps({ onMoveUp: undefined })} />);
    expect(screen.queryByRole("button", { name: "Di chuyển lên" })).not.toBeInTheDocument();
  });

  it("does not render the down arrow button when onMoveDown is undefined", () => {
    render(<CategorySection {...makeProps({ onMoveDown: undefined })} />);
    expect(screen.queryByRole("button", { name: "Di chuyển xuống" })).not.toBeInTheDocument();
  });

  it("calls onMoveUp when the up arrow button is clicked", async () => {
    const onMoveUp = jest.fn();
    render(<CategorySection {...makeProps({ onMoveUp })} />);

    await userEvent.click(screen.getByRole("button", { name: "Di chuyển lên" }));

    expect(onMoveUp).toHaveBeenCalledTimes(1);
  });

  it("calls onMoveDown when the down arrow button is clicked", async () => {
    const onMoveDown = jest.fn();
    render(<CategorySection {...makeProps({ onMoveDown })} />);

    await userEvent.click(screen.getByRole("button", { name: "Di chuyển xuống" }));

    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });
});
