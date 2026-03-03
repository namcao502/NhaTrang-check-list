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
  onToggleItem: (id: string) => void;
  onAddItem: (label: string) => void;
  onRemoveItem: (id: string) => void;
}> = {}) {
  return {
    category: baseCategory,
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
