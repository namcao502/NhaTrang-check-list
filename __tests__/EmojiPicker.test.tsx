/**
 * Tests for components/EmojiPicker.tsx
 *
 * Covers:
 * - Renders emoji grid
 * - Calls onSelect and onClose when an emoji is clicked
 * - Calls onClose when close button is clicked
 * - Calls onClose when clicking outside (mousedown)
 * - Renders "Bo icon" clear button
 * - Clear button calls onSelect('') and onClose
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmojiPicker from "@/components/EmojiPicker";

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("EmojiPicker — rendering", () => {
  it("renders the title text", () => {
    render(<EmojiPicker onSelect={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText("Chon icon")).toBeInTheDocument();
  });

  it("renders emoji buttons", () => {
    render(<EmojiPicker onSelect={jest.fn()} onClose={jest.fn()} />);
    // Check a few known emojis from the list
    expect(screen.getByText("🏊")).toBeInTheDocument();
    expect(screen.getByText("👗")).toBeInTheDocument();
    expect(screen.getByText("📱")).toBeInTheDocument();
  });

  it("renders the close button with 'x'", () => {
    render(<EmojiPicker onSelect={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it("renders the 'Bo icon' clear button", () => {
    render(<EmojiPicker onSelect={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText("Bo icon")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe("EmojiPicker — interactions", () => {
  it("calls onSelect and onClose when an emoji is clicked", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(<EmojiPicker onSelect={onSelect} onClose={onClose} />);

    await userEvent.click(screen.getByText("🏊"));

    expect(onSelect).toHaveBeenCalledWith("🏊");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = jest.fn();
    render(<EmojiPicker onSelect={jest.fn()} onClose={onClose} />);

    await userEvent.click(screen.getByText("x"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSelect('') and onClose when 'Bo icon' is clicked", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(<EmojiPicker onSelect={onSelect} onClose={onClose} />);

    await userEvent.click(screen.getByText("Bo icon"));

    expect(onSelect).toHaveBeenCalledWith("");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking outside the picker", () => {
    const onClose = jest.fn();
    const { container } = render(
      <div>
        <div data-testid="outside">Outside</div>
        <EmojiPicker onSelect={jest.fn()} onClose={onClose} />
      </div>
    );

    // Simulate mousedown on the outside element
    fireEvent.mouseDown(container.querySelector('[data-testid="outside"]')!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the picker", () => {
    const onClose = jest.fn();
    render(<EmojiPicker onSelect={jest.fn()} onClose={onClose} />);

    // Click on the title text (inside the picker)
    fireEvent.mouseDown(screen.getByText("Chon icon"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Emoji count
// ---------------------------------------------------------------------------

describe("EmojiPicker — emoji list", () => {
  it("renders all 30 emoji buttons", () => {
    render(<EmojiPicker onSelect={jest.fn()} onClose={jest.fn()} />);
    // The grid has emoji buttons plus the close button and "Bo icon" button
    // Each emoji is in a button with type="button" inside the grid
    const gridButtons = screen.getAllByRole("button").filter(
      (btn) => btn.textContent !== "x" && btn.textContent !== "Bo icon"
    );
    expect(gridButtons).toHaveLength(30);
  });
});
