/**
 * Tests for components/ChecklistItem.tsx
 *
 * Covers:
 * - Renders the item label.
 * - Renders note as grey subtitle when note is a non-empty string.
 * - Does not render note element when note is absent or empty string.
 * - Renders "Quan trọng" badge (coral) when tag === 'must'.
 * - Renders "Nên có" badge (purple) when tag === 'opt'.
 * - Renders no badge when tag is undefined.
 * - Tag badge DOM structure: badge is a direct child of the <li>, right-aligned between content and action buttons.
 * - Tag badge ordering (FEAT-tag-order): badge appears after move buttons and before delete button.
 * - Action buttons (delete, move) remain outside the flex-1 content div.
 * - Applies line-through and text-gray-400 styles when checked.
 * - Calls onToggle when the checkbox is clicked.
 * - Calls onRemove when the remove button is clicked.
 * - Inline label edit: click label span, type, blur/Enter saves, Escape cancels.
 * - Inline note edit: click note span or "+" button, type, blur/Enter saves, Escape cancels.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChecklistItem from "@/components/ChecklistItem";

// ---------------------------------------------------------------------------
// Shared props factory
// ---------------------------------------------------------------------------

function makeProps(overrides: Partial<React.ComponentProps<typeof ChecklistItem>> = {}) {
  return {
    id: "item-1",
    label: "Sunscreen SPF50+",
    checked: false,
    onToggle: jest.fn(),
    onRemove: jest.fn(),
    onRename: jest.fn(),
    onNoteChange: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Label rendering
// ---------------------------------------------------------------------------

describe("ChecklistItem — label", () => {
  it("renders the item label text", () => {
    render(<ChecklistItem {...makeProps()} />);
    expect(screen.getByText("Sunscreen SPF50+")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Note rendering
// ---------------------------------------------------------------------------

describe("ChecklistItem — note", () => {
  it("renders the note as a subtitle when note is a non-empty string", () => {
    render(<ChecklistItem {...makeProps({ note: "Reapply every 2 hours" })} />);
    expect(screen.getByText("Reapply every 2 hours")).toBeInTheDocument();
  });

  it("note element is absent when note prop is not provided", () => {
    render(<ChecklistItem {...makeProps()} />);
    expect(screen.queryByText("Reapply every 2 hours")).not.toBeInTheDocument();
  });

  it("does not render a note span when note is an empty string", () => {
    // When note is empty the component renders a "+" button instead of a note span.
    // Querying by the note text should find nothing.
    render(<ChecklistItem {...makeProps({ note: "" })} />);
    expect(screen.queryByText("Reapply every 2 hours")).not.toBeInTheDocument();
  });

  it("note span carries grey text styling class", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ note: "Keep safe" })} />
    );
    // The note is rendered as a <span> inside the flex-1 div, not inside a <label>
    const noteSpan = container.querySelector("span.text-gray-400");
    expect(noteSpan).not.toBeNull();
    expect(noteSpan).toHaveClass("text-gray-400");
  });
});

// ---------------------------------------------------------------------------
// Tag badge rendering
// ---------------------------------------------------------------------------

describe("ChecklistItem — tag badge", () => {
  it("renders 'Quan trọng' badge when tag is 'must'", () => {
    render(<ChecklistItem {...makeProps({ tag: "must" })} />);
    expect(screen.getByText("Quan trọng")).toBeInTheDocument();
  });

  it("'Quan trọng' badge has coral background class", () => {
    render(<ChecklistItem {...makeProps({ tag: "must" })} />);
    const badge = screen.getByText("Quan trọng");
    expect(badge).toHaveClass("bg-coral-100");
    expect(badge).toHaveClass("text-coral-600");
  });

  it("renders 'Nên có' badge when tag is 'opt'", () => {
    render(<ChecklistItem {...makeProps({ tag: "opt" })} />);
    expect(screen.getByText("Nên có")).toBeInTheDocument();
  });

  it("'Nên có' badge has purple background class", () => {
    render(<ChecklistItem {...makeProps({ tag: "opt" })} />);
    const badge = screen.getByText("Nên có");
    expect(badge).toHaveClass("bg-purple-100");
    expect(badge).toHaveClass("text-purple-700");
  });

  it("renders no tag badge when tag is undefined", () => {
    render(<ChecklistItem {...makeProps()} />);
    expect(screen.queryByText("Quan trọng")).not.toBeInTheDocument();
    expect(screen.queryByText("Nên có")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tag badge DOM structure (FEAT-tag-right)
// The tag badge is a direct child of the <li> row, right-aligned between the
// flex-1 content div and the action buttons. It is NOT inside the content div.
// ---------------------------------------------------------------------------

describe("ChecklistItem — tag badge DOM structure", () => {
  it("'Quan trọng' badge is a direct child of the <li> element", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ tag: "must" })} />
    );
    const badge = screen.getByText("Quan trọng");
    const li = container.querySelector("li")!;

    // Badge's parentElement must be the <li>
    expect(badge.parentElement).toBe(li);
  });

  it("'Nên có' badge is a direct child of the <li> element", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ tag: "opt" })} />
    );
    const badge = screen.getByText("Nên có");
    const li = container.querySelector("li")!;

    expect(badge.parentElement).toBe(li);
  });

  it("the <li> row has flex and items-start classes", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ tag: "must" })} />
    );
    const li = container.querySelector("li")!;

    expect(li).toHaveClass("flex");
    expect(li).toHaveClass("items-start");
  });

  it("badge is a sibling of the flex-1 content div at the <li> level", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ tag: "must" })} />
    );
    const badge = screen.getByText("Quan trọng");
    const contentDiv = container.querySelector("li > div.flex-1")!;

    // Both badge and content div share the same parent (<li>)
    expect(badge.parentElement).toBe(contentDiv.parentElement);
  });

  it("the delete button is NOT inside the flex-1 content div", () => {
    render(<ChecklistItem {...makeProps({ tag: "must" })} />);
    const contentDiv = document.querySelector("li > div.flex-1")!;
    const deleteBtn = screen.getByRole("button", { name: /xoá sunscreen/i });

    expect(contentDiv.contains(deleteBtn)).toBe(false);
  });

  it("move buttons are NOT inside the flex-1 content div", () => {
    render(
      <ChecklistItem
        {...makeProps({ tag: "must", onMoveUp: jest.fn(), onMoveDown: jest.fn() })}
      />
    );
    const contentDiv = document.querySelector("li > div.flex-1")!;
    const moveUpBtn = screen.getByRole("button", { name: /di chuyển mục lên/i });
    const moveDownBtn = screen.getByRole("button", { name: /di chuyển mục xuống/i });

    expect(contentDiv.contains(moveUpBtn)).toBe(false);
    expect(contentDiv.contains(moveDownBtn)).toBe(false);
  });

  it("label span without a tag has no badge sibling at the <li> level", () => {
    const { container } = render(<ChecklistItem {...makeProps()} />);
    const li = container.querySelector("li")!;

    // No badge spans should exist as direct children of <li>
    const directSpans = li.querySelectorAll(":scope > span");
    expect(directSpans).toHaveLength(0);
  });

  it("'must' badge has flex-shrink-0 and whitespace-nowrap to prevent wrapping", () => {
    render(<ChecklistItem {...makeProps({ tag: "must" })} />);
    const badge = screen.getByText("Quan trọng");

    expect(badge).toHaveClass("flex-shrink-0");
    expect(badge).toHaveClass("whitespace-nowrap");
  });

  it("'opt' badge has flex-shrink-0 and whitespace-nowrap to prevent wrapping", () => {
    render(<ChecklistItem {...makeProps({ tag: "opt" })} />);
    const badge = screen.getByText("Nên có");

    expect(badge).toHaveClass("flex-shrink-0");
    expect(badge).toHaveClass("whitespace-nowrap");
  });

  it("badge stays right-aligned when item label is very long", () => {
    const longLabel = "A".repeat(200);
    const { container } = render(
      <ChecklistItem {...makeProps({ label: longLabel, tag: "must" })} />
    );
    const badge = screen.getByText("Quan trọng");
    const li = container.querySelector("li")!;
    const contentDiv = container.querySelector("li > div.flex-1")!;

    // Badge is still a direct child of <li>, not nested inside content
    expect(badge.parentElement).toBe(li);
    // Content div has flex-1 and min-w-0 so it shrinks, badge does not
    expect(contentDiv).toHaveClass("flex-1");
    expect(contentDiv).toHaveClass("min-w-0");
  });

  it("badge appears after content div in DOM order (visual right placement)", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ tag: "must" })} />
    );
    const li = container.querySelector("li")!;
    const contentDiv = container.querySelector("li > div.flex-1")!;
    const badge = screen.getByText("Quan trọng");

    const children = Array.from(li.children);
    const contentIndex = children.indexOf(contentDiv);
    const badgeIndex = children.indexOf(badge);

    expect(badgeIndex).toBeGreaterThan(contentIndex);
  });
});

// ---------------------------------------------------------------------------
// Tag badge DOM ordering relative to move buttons and delete (FEAT-tag-order)
// Expected order: checkbox, content div, move-up, move-down, tag badge, delete
// ---------------------------------------------------------------------------

describe("ChecklistItem — tag badge ordering (FEAT-tag-order)", () => {
  it("tag badge appears after move-up and move-down buttons in DOM order", () => {
    const { container } = render(
      <ChecklistItem
        {...makeProps({ tag: "must", onMoveUp: jest.fn(), onMoveDown: jest.fn() })}
      />
    );
    const li = container.querySelector("li")!;
    const children = Array.from(li.children);

    const moveUpBtn = screen.getByRole("button", { name: /di chuyển mục lên/i });
    const moveDownBtn = screen.getByRole("button", { name: /di chuyển mục xuống/i });
    const badge = screen.getByText("Quan trọng");

    const moveUpIndex = children.indexOf(moveUpBtn);
    const moveDownIndex = children.indexOf(moveDownBtn);
    const badgeIndex = children.indexOf(badge);

    expect(badgeIndex).toBeGreaterThan(moveUpIndex);
    expect(badgeIndex).toBeGreaterThan(moveDownIndex);
  });

  it("tag badge appears before the delete button in DOM order", () => {
    const { container } = render(
      <ChecklistItem
        {...makeProps({ tag: "must", onMoveUp: jest.fn(), onMoveDown: jest.fn() })}
      />
    );
    const li = container.querySelector("li")!;
    const children = Array.from(li.children);

    const badge = screen.getByText("Quan trọng");
    const deleteBtn = screen.getByRole("button", { name: /xoá sunscreen/i });

    const badgeIndex = children.indexOf(badge);
    const deleteIndex = children.indexOf(deleteBtn);

    expect(badgeIndex).toBeLessThan(deleteIndex);
  });

  it("full DOM order is: checkbox, content, move-up, move-down, badge, delete", () => {
    const { container } = render(
      <ChecklistItem
        {...makeProps({ tag: "must", onMoveUp: jest.fn(), onMoveDown: jest.fn() })}
      />
    );
    const li = container.querySelector("li")!;
    const children = Array.from(li.children);

    const checkbox = screen.getByRole("checkbox");
    const contentDiv = container.querySelector("li > div.flex-1")!;
    const moveUpBtn = screen.getByRole("button", { name: /di chuyển mục lên/i });
    const moveDownBtn = screen.getByRole("button", { name: /di chuyển mục xuống/i });
    const badge = screen.getByText("Quan trọng");
    const deleteBtn = screen.getByRole("button", { name: /xoá sunscreen/i });

    const checkboxIndex = children.indexOf(checkbox);
    const contentIndex = children.indexOf(contentDiv);
    const moveUpIndex = children.indexOf(moveUpBtn);
    const moveDownIndex = children.indexOf(moveDownBtn);
    const badgeIndex = children.indexOf(badge);
    const deleteIndex = children.indexOf(deleteBtn);

    expect(checkboxIndex).toBeLessThan(contentIndex);
    expect(contentIndex).toBeLessThan(moveUpIndex);
    expect(moveUpIndex).toBeLessThan(moveDownIndex);
    expect(moveDownIndex).toBeLessThan(badgeIndex);
    expect(badgeIndex).toBeLessThan(deleteIndex);
  });

  it("'opt' badge also appears after move buttons and before delete", () => {
    const { container } = render(
      <ChecklistItem
        {...makeProps({ tag: "opt", onMoveUp: jest.fn(), onMoveDown: jest.fn() })}
      />
    );
    const li = container.querySelector("li")!;
    const children = Array.from(li.children);

    const moveDownBtn = screen.getByRole("button", { name: /di chuyển mục xuống/i });
    const badge = screen.getByText("Nên có");
    const deleteBtn = screen.getByRole("button", { name: /xoá sunscreen/i });

    const moveDownIndex = children.indexOf(moveDownBtn);
    const badgeIndex = children.indexOf(badge);
    const deleteIndex = children.indexOf(deleteBtn);

    expect(badgeIndex).toBeGreaterThan(moveDownIndex);
    expect(badgeIndex).toBeLessThan(deleteIndex);
  });

  it("without move buttons, badge still appears before delete", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ tag: "must" })} />
    );
    const li = container.querySelector("li")!;
    const children = Array.from(li.children);

    const badge = screen.getByText("Quan trọng");
    const deleteBtn = screen.getByRole("button", { name: /xoá sunscreen/i });

    const badgeIndex = children.indexOf(badge);
    const deleteIndex = children.indexOf(deleteBtn);

    expect(badgeIndex).toBeLessThan(deleteIndex);
  });
});

// ---------------------------------------------------------------------------
// Checked styles
// ---------------------------------------------------------------------------

describe("ChecklistItem — checked styles", () => {
  it("applies line-through and text-gray-400 to the label span when checked", () => {
    render(<ChecklistItem {...makeProps({ checked: true })} />);
    // The label is a <span> with cursor-text class; find it by text then check its classes
    const labelSpan = screen.getByText("Sunscreen SPF50+");
    expect(labelSpan).toHaveClass("line-through");
    expect(labelSpan).toHaveClass("text-gray-400");
  });

  it("does not apply line-through to the label span when unchecked", () => {
    render(<ChecklistItem {...makeProps({ checked: false })} />);
    const labelSpan = screen.getByText("Sunscreen SPF50+");
    expect(labelSpan).not.toHaveClass("line-through");
  });

  it("applies bg-blue-50 to the list item when checked", () => {
    const { container } = render(<ChecklistItem {...makeProps({ checked: true })} />);
    const li = container.querySelector("li");
    expect(li).toHaveClass("bg-blue-50");
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe("ChecklistItem — interactions", () => {
  it("calls onToggle when the checkbox is clicked", async () => {
    const onToggle = jest.fn();
    render(<ChecklistItem {...makeProps({ onToggle })} />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when the remove button is clicked", async () => {
    const onRemove = jest.fn();
    render(<ChecklistItem {...makeProps({ onRemove })} />);

    // The aria-label is "Xoá {label}" in Vietnamese
    await userEvent.click(screen.getByRole("button", { name: /xoá sunscreen/i }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Inline label edit
// ---------------------------------------------------------------------------

describe("ChecklistItem — inline label edit", () => {
  it("shows a text input when the label span is clicked", async () => {
    render(<ChecklistItem {...makeProps()} />);

    await userEvent.click(screen.getByText("Sunscreen SPF50+"));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onRename with the new value when Enter is pressed", async () => {
    const onRename = jest.fn();
    render(<ChecklistItem {...makeProps({ onRename })} />);

    await userEvent.click(screen.getByText("Sunscreen SPF50+"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "New Label{Enter}");

    expect(onRename).toHaveBeenCalledWith("New Label");
  });

  it("calls onRename when the input loses focus (blur)", async () => {
    const onRename = jest.fn();
    render(<ChecklistItem {...makeProps({ onRename })} />);

    await userEvent.click(screen.getByText("Sunscreen SPF50+"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Blurred Label");
    await userEvent.tab(); // triggers blur

    expect(onRename).toHaveBeenCalledWith("Blurred Label");
  });

  it("does not call onRename and reverts to original label when Escape is pressed", async () => {
    const onRename = jest.fn();
    render(<ChecklistItem {...makeProps({ onRename })} />);

    await userEvent.click(screen.getByText("Sunscreen SPF50+"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Discarded{Escape}");

    expect(onRename).not.toHaveBeenCalled();
    // The label span should be back with the original text
    expect(screen.getByText("Sunscreen SPF50+")).toBeInTheDocument();
  });

  it("does not call onRename and reverts when saved value is empty", async () => {
    const onRename = jest.fn();
    render(<ChecklistItem {...makeProps({ onRename })} />);

    await userEvent.click(screen.getByText("Sunscreen SPF50+"));

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "{Enter}");

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText("Sunscreen SPF50+")).toBeInTheDocument();
  });

  it("exits edit mode and shows the label span after saving", async () => {
    render(<ChecklistItem {...makeProps()} />);

    await userEvent.click(screen.getByText("Sunscreen SPF50+"));
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "{Enter}");

    // Input should be gone, span should be back
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Sunscreen SPF50+")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Inline note edit
// ---------------------------------------------------------------------------

describe("ChecklistItem — inline note edit", () => {
  it("shows a note input when the '+' button is clicked (no existing note)", async () => {
    render(<ChecklistItem {...makeProps()} />);

    await userEvent.click(screen.getByRole("button", { name: /thêm ghi chú/i }));

    expect(screen.getByPlaceholderText("Ghi chú...")).toBeInTheDocument();
  });

  it("shows a note input when the existing note span is clicked", async () => {
    render(<ChecklistItem {...makeProps({ note: "Existing note" })} />);

    await userEvent.click(screen.getByText("Existing note"));

    expect(screen.getByPlaceholderText("Ghi chú...")).toBeInTheDocument();
  });

  it("calls onNoteChange with the new note when Enter is pressed", async () => {
    const onNoteChange = jest.fn();
    render(<ChecklistItem {...makeProps({ onNoteChange })} />);

    await userEvent.click(screen.getByRole("button", { name: /thêm ghi chú/i }));

    const input = screen.getByPlaceholderText("Ghi chú...");
    await userEvent.type(input, "My new note{Enter}");

    expect(onNoteChange).toHaveBeenCalledWith("My new note");
  });

  it("calls onNoteChange when the note input loses focus (blur)", async () => {
    const onNoteChange = jest.fn();
    render(<ChecklistItem {...makeProps({ onNoteChange })} />);

    await userEvent.click(screen.getByRole("button", { name: /thêm ghi chú/i }));

    const input = screen.getByPlaceholderText("Ghi chú...");
    await userEvent.type(input, "Blurred note");
    await userEvent.tab();

    expect(onNoteChange).toHaveBeenCalledWith("Blurred note");
  });

  it("does not call onNoteChange and reverts to original note when Escape is pressed", async () => {
    const onNoteChange = jest.fn();
    render(<ChecklistItem {...makeProps({ note: "Original note", onNoteChange })} />);

    await userEvent.click(screen.getByText("Original note"));

    const input = screen.getByPlaceholderText("Ghi chú...");
    await userEvent.clear(input);
    await userEvent.type(input, "Discarded note{Escape}");

    expect(onNoteChange).not.toHaveBeenCalled();
    // The original note span should be visible again
    expect(screen.getByText("Original note")).toBeInTheDocument();
  });

  it("exits note edit mode and shows the note text after saving", async () => {
    const onNoteChange = jest.fn();
    render(<ChecklistItem {...makeProps({ note: "Saved note", onNoteChange })} />);

    await userEvent.click(screen.getByText("Saved note"));
    const input = screen.getByPlaceholderText("Ghi chú...");
    await userEvent.type(input, "{Enter}");

    expect(screen.queryByPlaceholderText("Ghi chú...")).not.toBeInTheDocument();
  });
});
