/**
 * Tests for components/FilterBar.tsx
 *
 * Covers:
 * - Renders the search input with the correct placeholder.
 * - Calls onSearchChange with the typed value when the input changes.
 * - "Chỉ quan trọng" button calls onMustOnlyChange toggling the current value.
 * - "Ẩn đã xong" button calls onHideCheckedChange toggling the current value.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "@/components/FilterBar";

// ---------------------------------------------------------------------------
// Shared props factory
// ---------------------------------------------------------------------------

function makeProps(overrides: Partial<React.ComponentProps<typeof FilterBar>> = {}) {
  return {
    searchQuery: "",
    onSearchChange: jest.fn(),
    mustOnly: false,
    onMustOnlyChange: jest.fn(),
    hideChecked: false,
    onHideCheckedChange: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Search input rendering
// ---------------------------------------------------------------------------

describe("FilterBar — search input", () => {
  it("renders the search input element", () => {
    render(<FilterBar {...makeProps()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders the placeholder text 'Tìm kiếm đồ vật...'", () => {
    render(<FilterBar {...makeProps()} />);
    expect(screen.getByPlaceholderText("Tìm kiếm đồ vật...")).toBeInTheDocument();
  });

  it("displays the current searchQuery value in the input", () => {
    render(<FilterBar {...makeProps({ searchQuery: "mũ" })} />);
    expect(screen.getByRole("textbox")).toHaveValue("mũ");
  });

  it("calls onSearchChange each time the input changes", async () => {
    const onSearchChange = jest.fn();
    render(<FilterBar {...makeProps({ onSearchChange })} />);

    await userEvent.type(screen.getByRole("textbox"), "kem");

    // onSearchChange is called once per keystroke
    expect(onSearchChange).toHaveBeenCalledTimes(3);
    // Each call receives the string value from the change event
    expect(onSearchChange).toHaveBeenCalledWith("k");
    expect(onSearchChange).toHaveBeenCalledWith("e");
    expect(onSearchChange).toHaveBeenCalledWith("m");
  });
});

// ---------------------------------------------------------------------------
// mustOnly toggle button
// ---------------------------------------------------------------------------

describe("FilterBar — mustOnly toggle", () => {
  it("renders the 'Chỉ quan trọng' button", () => {
    render(<FilterBar {...makeProps()} />);
    expect(screen.getByRole("button", { name: "Chỉ quan trọng" })).toBeInTheDocument();
  });

  it("calls onMustOnlyChange with true when mustOnly is false and button is clicked", async () => {
    const onMustOnlyChange = jest.fn();
    render(<FilterBar {...makeProps({ mustOnly: false, onMustOnlyChange })} />);

    await userEvent.click(screen.getByRole("button", { name: "Chỉ quan trọng" }));

    expect(onMustOnlyChange).toHaveBeenCalledWith(true);
  });

  it("calls onMustOnlyChange with false when mustOnly is true and button is clicked", async () => {
    const onMustOnlyChange = jest.fn();
    render(<FilterBar {...makeProps({ mustOnly: true, onMustOnlyChange })} />);

    await userEvent.click(screen.getByRole("button", { name: "Chỉ quan trọng" }));

    expect(onMustOnlyChange).toHaveBeenCalledWith(false);
  });
});

// ---------------------------------------------------------------------------
// hideChecked toggle button
// ---------------------------------------------------------------------------

describe("FilterBar — hideChecked toggle", () => {
  it("renders the 'Ẩn đã xong' button", () => {
    render(<FilterBar {...makeProps()} />);
    expect(screen.getByRole("button", { name: "Ẩn đã xong" })).toBeInTheDocument();
  });

  it("calls onHideCheckedChange with true when hideChecked is false and button is clicked", async () => {
    const onHideCheckedChange = jest.fn();
    render(<FilterBar {...makeProps({ hideChecked: false, onHideCheckedChange })} />);

    await userEvent.click(screen.getByRole("button", { name: "Ẩn đã xong" }));

    expect(onHideCheckedChange).toHaveBeenCalledWith(true);
  });

  it("calls onHideCheckedChange with false when hideChecked is true and button is clicked", async () => {
    const onHideCheckedChange = jest.fn();
    render(<FilterBar {...makeProps({ hideChecked: true, onHideCheckedChange })} />);

    await userEvent.click(screen.getByRole("button", { name: "Ẩn đã xong" }));

    expect(onHideCheckedChange).toHaveBeenCalledWith(false);
  });
});
