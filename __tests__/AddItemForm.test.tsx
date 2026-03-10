/**
 * Tests for components/AddItemForm.tsx
 *
 * Covers:
 * - Renders input and submit button
 * - Submit calls onAdd with label, tag, and note
 * - Submit is disabled when input is empty
 * - Tag toggle buttons (must, opt, clear)
 * - Note input field
 * - Form resets after submission
 * - Empty/whitespace label prevents submission
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddItemForm from "@/components/AddItemForm";

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("AddItemForm — rendering", () => {
  it("renders the label input with Vietnamese placeholder", () => {
    render(<AddItemForm onAdd={jest.fn()} />);
    expect(screen.getByPlaceholderText("Thêm đồ vật...")).toBeInTheDocument();
  });

  it("renders the submit button with text 'Thêm'", () => {
    render(<AddItemForm onAdd={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Thêm" })).toBeInTheDocument();
  });

  it("renders the note input with Vietnamese placeholder", () => {
    render(<AddItemForm onAdd={jest.fn()} />);
    expect(screen.getByPlaceholderText("Mô tả (tuỳ chọn)...")).toBeInTheDocument();
  });

  it("renders the 'Quan trọng' tag button", () => {
    render(<AddItemForm onAdd={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Quan trọng" })).toBeInTheDocument();
  });

  it("renders the 'Nên có' tag button", () => {
    render(<AddItemForm onAdd={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Nên có" })).toBeInTheDocument();
  });

  it("submit button is disabled when input is empty", () => {
    render(<AddItemForm onAdd={jest.fn()} />);
    const button = screen.getByRole("button", { name: "Thêm" });
    expect(button).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------

describe("AddItemForm — submission", () => {
  it("calls onAdd with label only (no tag, no note) on submit", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Sunscreen");
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Sunscreen", undefined, undefined);
  });

  it("calls onAdd with label and 'must' tag", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Passport");
    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Passport", "must", undefined);
  });

  it("calls onAdd with label and 'opt' tag", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Book");
    await userEvent.click(screen.getByRole("button", { name: "Nên có" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Book", "opt", undefined);
  });

  it("calls onAdd with label, tag, and note", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Sunscreen");
    await userEvent.type(screen.getByPlaceholderText("Mô tả (tuỳ chọn)..."), "SPF 50+");
    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Sunscreen", "must", "SPF 50+");
  });

  it("does not call onAdd when label is empty", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when label is whitespace only", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "   ");
    // Submit via Enter since the button may be disabled
    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "{Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("passes undefined for note when note input is empty", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Towel");
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Towel", undefined, undefined);
  });
});

// ---------------------------------------------------------------------------
// Form reset after submission
// ---------------------------------------------------------------------------

describe("AddItemForm — reset after submit", () => {
  it("clears the label input after submission", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    const input = screen.getByPlaceholderText("Thêm đồ vật...");
    await userEvent.type(input, "Item");
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(input).toHaveValue("");
  });

  it("clears the note input after submission", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    const labelInput = screen.getByPlaceholderText("Thêm đồ vật...");
    const noteInput = screen.getByPlaceholderText("Mô tả (tuỳ chọn)...");
    await userEvent.type(labelInput, "Item");
    await userEvent.type(noteInput, "Some note");
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(noteInput).toHaveValue("");
  });

  it("resets tag selection after submission", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    const labelInput = screen.getByPlaceholderText("Thêm đồ vật...");
    await userEvent.type(labelInput, "Item");
    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));

    // The "Không" clear button should be visible when a tag is selected
    expect(screen.getByRole("button", { name: "Không" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    // After submission the "Không" button should be gone (tag reset)
    expect(screen.queryByRole("button", { name: "Không" })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tag toggle behavior
// ---------------------------------------------------------------------------

describe("AddItemForm — tag toggle", () => {
  it("toggles 'must' tag off when clicked twice", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Item");
    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));
    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Item", undefined, undefined);
  });

  it("toggles 'opt' tag off when clicked twice", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Item");
    await userEvent.click(screen.getByRole("button", { name: "Nên có" }));
    await userEvent.click(screen.getByRole("button", { name: "Nên có" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Item", undefined, undefined);
  });

  it("shows 'Không' clear button when a tag is selected", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    // Initially no clear button
    expect(screen.queryByRole("button", { name: "Không" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));

    expect(screen.getByRole("button", { name: "Không" })).toBeInTheDocument();
  });

  it("clears tag when 'Không' button is clicked", async () => {
    const onAdd = jest.fn();
    render(<AddItemForm onAdd={onAdd} />);

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "Item");
    await userEvent.click(screen.getByRole("button", { name: "Quan trọng" }));
    await userEvent.click(screen.getByRole("button", { name: "Không" }));
    await userEvent.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledWith("Item", undefined, undefined);
  });

  it("'Không' button disappears after clearing the tag", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Nên có" }));
    expect(screen.getByRole("button", { name: "Không" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Không" }));
    expect(screen.queryByRole("button", { name: "Không" })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Submit button enable/disable
// ---------------------------------------------------------------------------

describe("AddItemForm — submit button state", () => {
  it("submit button becomes enabled when text is entered", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    const button = screen.getByRole("button", { name: "Thêm" });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText("Thêm đồ vật..."), "X");
    expect(button).toBeEnabled();
  });

  it("submit button becomes disabled again after clearing input", async () => {
    render(<AddItemForm onAdd={jest.fn()} />);

    const input = screen.getByPlaceholderText("Thêm đồ vật...");
    await userEvent.type(input, "X");
    await userEvent.clear(input);

    expect(screen.getByRole("button", { name: "Thêm" })).toBeDisabled();
  });
});
