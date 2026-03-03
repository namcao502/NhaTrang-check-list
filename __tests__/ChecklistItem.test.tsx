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
 * - Applies line-through and text-gray-400 styles when checked.
 * - Calls onToggle when the checkbox is clicked.
 * - Calls onRemove when the remove button is clicked.
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
    // The only text content in a <span> should be the tag badges;
    // none of them should contain a note-like string.
    expect(screen.queryByText("Reapply every 2 hours")).not.toBeInTheDocument();
  });

  it("does not render a subtitle span when note is an empty string", () => {
    const { container } = render(<ChecklistItem {...makeProps({ note: "" })} />);
    // There should be no <span> inside the label with empty text rendered visibly.
    // The conditional in ChecklistItem is `{note && ...}`, so empty string is falsy.
    const spans = container.querySelectorAll("label span");
    expect(spans).toHaveLength(0);
  });

  it("note span carries grey text styling class", () => {
    const { container } = render(
      <ChecklistItem {...makeProps({ note: "Keep safe" })} />
    );
    const noteSpan = container.querySelector("label span");
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
// Checked styles
// ---------------------------------------------------------------------------

describe("ChecklistItem — checked styles", () => {
  it("applies line-through and text-gray-400 to label when checked", () => {
    render(<ChecklistItem {...makeProps({ checked: true })} />);
    const label = screen.getByText("Sunscreen SPF50+").closest("label");
    expect(label).toHaveClass("line-through");
    expect(label).toHaveClass("text-gray-400");
  });

  it("does not apply line-through when unchecked", () => {
    render(<ChecklistItem {...makeProps({ checked: false })} />);
    const label = screen.getByText("Sunscreen SPF50+").closest("label");
    expect(label).not.toHaveClass("line-through");
  });

  it("applies blue-50 background to the list item when checked", () => {
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

    await userEvent.click(screen.getByRole("button", { name: /remove sunscreen/i }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
