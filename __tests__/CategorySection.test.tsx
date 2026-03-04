/**
 * Tests for components/CategorySection.tsx
 *
 * Covers:
 * - Renders category name.
 * - Renders the icon when category.icon is present.
 * - Does not render an icon element when category.icon is absent.
 * - Renders all items inside the category.
 * - Passes note and tag props down to each ChecklistItem.
 * - Shows "Chưa có đồ vật nào." placeholder when category has no items.
 * - Collapses and expands the item list when the right-side chevron area is clicked.
 * - Calls onToggleItem / onAddItem / onRemoveItem with the correct item id.
 * - Category rename: click name span opens input, Enter/blur saves, Escape cancels.
 * - Bulk toggle button: label switches between "Chọn tất cả" and "Bỏ chọn tất cả".
 * - Bulk toggle button: disabled when category has no items.
 * - Bulk toggle button: calls onBulkToggle when clicked.
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

const emptyCategory: Category = {
  id: "cat-empty",
  name: "Empty Cat",
  items: [],
};

function makeProps(overrides: Partial<{
  category: Category;
  visibleItems: Category["items"];
  onToggleItem: (id: string) => void;
  onAddItem: (label: string, tag?: "must" | "opt") => void;
  onRemoveItem: (id: string) => void;
  onRenameCategory: (newName: string) => void;
  onBulkToggle: () => void;
  onRenameItem: (itemId: string, newLabel: string) => void;
  onNoteChange: (itemId: string, note: string) => void;
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
    onRenameCategory: jest.fn(),
    onBulkToggle: jest.fn(),
    onRenameItem: jest.fn(),
    onNoteChange: jest.fn(),
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
    const { container } = render(
      <CategorySection {...makeProps({ category: categoryWithoutIcon })} />
    );
    // The icon span should not be in the DOM at all
    expect(container.querySelector("span.flex-shrink-0.text-xl")).not.toBeInTheDocument();
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

  it("shows 'Chưa có đồ vật nào.' placeholder when items array is empty", () => {
    render(<CategorySection {...makeProps({ category: emptyCategory })} />);
    expect(screen.getByText("Chưa có đồ vật nào.")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Collapse / expand
// The right-side area (chevron + badge) is the collapse trigger.
// It contains the progress badge text such as "0/2".
// ---------------------------------------------------------------------------

describe("CategorySection — collapse behaviour", () => {
  // The right-side collapse trigger is identified by the progress badge span.
  // We click on the badge text node's parent div.
  function getCollapseTrigger() {
    // The chevron "▾" character lives in the same right-side div as the badge.
    return screen.getByText("▾").closest("div")!;
  }

  it("shows items by default (expanded)", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByText("Đồ bơi")).toBeVisible();
  });

  it("hides items after clicking the collapse trigger", async () => {
    render(<CategorySection {...makeProps()} />);
    await userEvent.click(getCollapseTrigger());
    expect(screen.queryByText("Đồ bơi")).not.toBeInTheDocument();
  });

  it("shows items again after a second click on the collapse trigger", async () => {
    render(<CategorySection {...makeProps()} />);
    await userEvent.click(getCollapseTrigger());
    await userEvent.click(getCollapseTrigger());
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

    // aria-label is "Xoá {label}" in Vietnamese
    const removeBtn = screen.getByRole("button", { name: /xoá đồ bơi/i });
    await userEvent.click(removeBtn);

    expect(onRemoveItem).toHaveBeenCalledWith("item-1");
  });

  it("calls onAddItem with the typed label when the add form is submitted", async () => {
    const onAddItem = jest.fn();
    render(<CategorySection {...makeProps({ onAddItem })} />);

    const input = screen.getByPlaceholderText("Thêm đồ vật...");
    await userEvent.type(input, "New snorkel");
    await userEvent.click(screen.getByRole("button", { name: /^thêm$/i }));

    expect(onAddItem).toHaveBeenCalledWith("New snorkel", undefined, undefined);
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

  it("shows 'Hoàn thành' indicator when all items are checked", () => {
    const allChecked: Category = {
      ...baseCategory,
      items: baseCategory.items.map((i) => ({ ...i, checked: true })),
    };
    render(<CategorySection {...makeProps({ category: allChecked })} />);
    expect(screen.getByText(/hoàn thành/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Category rename (inline)
// The rename input appears in the header (no placeholder). The add-item
// input further down has placeholder "Thêm đồ vật...". Use getAllByRole and
// target the first textbox, which is always the header rename input.
// ---------------------------------------------------------------------------

describe("CategorySection — category rename", () => {
  /** Returns the first textbox in the DOM, which is the header rename input. */
  function getRenameInput() {
    return screen.getAllByRole("textbox")[0];
  }

  it("shows a text input in the header when the category name span is clicked", async () => {
    render(<CategorySection {...makeProps()} />);

    await userEvent.click(screen.getByText("Đồ Bơi & Lặn"));

    // At least one textbox must be present; the first is the rename input
    expect(getRenameInput()).toBeInTheDocument();
    // Confirm it holds the current category name as initial value
    expect(getRenameInput()).toHaveValue("Đồ Bơi & Lặn");
  });

  it("calls onRenameCategory with the new name when Enter is pressed", async () => {
    const onRenameCategory = jest.fn();
    render(<CategorySection {...makeProps({ onRenameCategory })} />);

    await userEvent.click(screen.getByText("Đồ Bơi & Lặn"));

    const input = getRenameInput();
    await userEvent.clear(input);
    await userEvent.type(input, "New Cat Name{Enter}");

    expect(onRenameCategory).toHaveBeenCalledWith("New Cat Name");
  });

  it("calls onRenameCategory when the input loses focus (blur)", async () => {
    const onRenameCategory = jest.fn();
    render(<CategorySection {...makeProps({ onRenameCategory })} />);

    await userEvent.click(screen.getByText("Đồ Bơi & Lặn"));

    const input = getRenameInput();
    await userEvent.clear(input);
    await userEvent.type(input, "Blurred Cat Name");
    await userEvent.tab();

    expect(onRenameCategory).toHaveBeenCalledWith("Blurred Cat Name");
  });

  it("does not call onRenameCategory and restores original name when Escape is pressed", async () => {
    const onRenameCategory = jest.fn();
    render(<CategorySection {...makeProps({ onRenameCategory })} />);

    await userEvent.click(screen.getByText("Đồ Bơi & Lặn"));

    const input = getRenameInput();
    await userEvent.clear(input);
    await userEvent.type(input, "Discarded Name{Escape}");

    expect(onRenameCategory).not.toHaveBeenCalled();
    // The original name span should be visible again
    expect(screen.getByText("Đồ Bơi & Lặn")).toBeInTheDocument();
  });

  it("does not call onRenameCategory when saved value is empty", async () => {
    const onRenameCategory = jest.fn();
    render(<CategorySection {...makeProps({ onRenameCategory })} />);

    await userEvent.click(screen.getByText("Đồ Bơi & Lặn"));

    const input = getRenameInput();
    await userEvent.clear(input);
    await userEvent.type(input, "{Enter}");

    expect(onRenameCategory).not.toHaveBeenCalled();
    // Reverts to original name span
    expect(screen.getByText("Đồ Bơi & Lặn")).toBeInTheDocument();
  });

  it("exits edit mode after saving (rename input is no longer the first textbox's value)", async () => {
    render(<CategorySection {...makeProps()} />);

    await userEvent.click(screen.getByText("Đồ Bơi & Lặn"));
    const input = getRenameInput();
    await userEvent.type(input, "{Enter}");

    // After saving, the category name span is back; clicking it again opens a fresh input
    expect(screen.getByText("Đồ Bơi & Lặn")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Bulk toggle button
// ---------------------------------------------------------------------------

describe("CategorySection — bulk toggle button", () => {
  it("shows 'Chọn tất cả' when not all items are checked", () => {
    render(<CategorySection {...makeProps()} />);
    expect(screen.getByRole("button", { name: "Chọn tất cả" })).toBeInTheDocument();
  });

  it("shows 'Bỏ chọn tất cả' when all items are checked", () => {
    const allChecked: Category = {
      ...baseCategory,
      items: baseCategory.items.map((i) => ({ ...i, checked: true })),
    };
    render(<CategorySection {...makeProps({ category: allChecked })} />);
    expect(screen.getByRole("button", { name: "Bỏ chọn tất cả" })).toBeInTheDocument();
  });

  it("is disabled when the category has no items", () => {
    render(<CategorySection {...makeProps({ category: emptyCategory })} />);
    const btn = screen.getByRole("button", { name: "Chọn tất cả" });
    expect(btn).toBeDisabled();
  });

  it("is not disabled when the category has items", () => {
    render(<CategorySection {...makeProps()} />);
    const btn = screen.getByRole("button", { name: "Chọn tất cả" });
    expect(btn).not.toBeDisabled();
  });

  it("calls onBulkToggle when the button is clicked", async () => {
    const onBulkToggle = jest.fn();
    render(<CategorySection {...makeProps({ onBulkToggle })} />);

    await userEvent.click(screen.getByRole("button", { name: "Chọn tất cả" }));

    expect(onBulkToggle).toHaveBeenCalledTimes(1);
  });

  it("does not collapse the section when the bulk toggle button is clicked", async () => {
    render(<CategorySection {...makeProps()} />);

    await userEvent.click(screen.getByRole("button", { name: "Chọn tất cả" }));

    // Items should still be visible — the click should not have propagated to the collapse div
    expect(screen.getByText("Đồ bơi")).toBeInTheDocument();
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

  it("shows 'Chưa có đồ vật nào.' placeholder when visibleItems is an empty array", () => {
    render(<CategorySection {...makeProps({ visibleItems: [] })} />);
    expect(screen.getByText("Chưa có đồ vật nào.")).toBeInTheDocument();
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
