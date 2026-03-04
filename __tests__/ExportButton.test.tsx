/**
 * Tests for components/ExportButton.tsx
 *
 * Covers:
 * - Renders the copy button.
 * - Shows the share button when navigator.share is available.
 * - Hides the share button when navigator.share is unavailable.
 * - Copies text to clipboard on copy button click.
 * - Calls navigator.share on share button click.
 * - Falls back to clipboard when navigator.share fails.
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExportButton from "@/components/ExportButton";
import type { Category } from "@/lib/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleCategories: Category[] = [
  {
    id: "cat-1",
    name: "Test Category",
    items: [
      { id: "item-1", label: "Item one", checked: true },
      { id: "item-2", label: "Item two", checked: false },
    ],
  },
];

const emptyCategories: Category[] = [];

// ---------------------------------------------------------------------------
// Mock clipboard
// ---------------------------------------------------------------------------

const mockWriteText = jest.fn().mockResolvedValue(undefined);

Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
});

beforeEach(() => {
  mockWriteText.mockClear();
  // Remove navigator.share before each test to default to "no share"
  Object.defineProperty(navigator, "share", {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

// ---------------------------------------------------------------------------
// Copy button rendering
// ---------------------------------------------------------------------------

describe("ExportButton — copy button", () => {
  it("renders the copy button", () => {
    render(<ExportButton categories={sampleCategories} />);
    expect(screen.getByRole("button", { name: /sao chép/i })).toBeInTheDocument();
  });

  it("copies text to clipboard when the copy button is clicked", async () => {
    render(<ExportButton categories={sampleCategories} />);

    await userEvent.click(screen.getByRole("button", { name: /sao chép/i }));

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining("Item one"));
  });

  it("shows success text after copying", async () => {
    render(<ExportButton categories={sampleCategories} />);

    await userEvent.click(screen.getByRole("button", { name: /sao chép/i }));

    expect(screen.getByText(/đã sao chép/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Share button (Web Share API)
// ---------------------------------------------------------------------------

describe("ExportButton — share button", () => {
  it("shows the share button when navigator.share is available", () => {
    Object.defineProperty(navigator, "share", {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    render(<ExportButton categories={sampleCategories} />);

    expect(screen.getByRole("button", { name: /chia sẻ/i })).toBeInTheDocument();
  });

  it("hides the share button when navigator.share is not available", () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ExportButton categories={sampleCategories} />);

    expect(screen.queryByRole("button", { name: /chia sẻ/i })).not.toBeInTheDocument();
  });

  it("calls navigator.share with the packing list text when share button is clicked", async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ExportButton categories={sampleCategories} />);

    await userEvent.click(screen.getByRole("button", { name: /chia sẻ/i }));

    expect(mockShare).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        text: expect.stringContaining("Item one"),
      })
    );
  });

  it("falls back to clipboard when navigator.share throws an error", async () => {
    const mockShare = jest.fn().mockRejectedValue(new Error("Share cancelled"));
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ExportButton categories={sampleCategories} />);

    await userEvent.click(screen.getByRole("button", { name: /chia sẻ/i }));

    // Should fall back to clipboard
    expect(mockWriteText).toHaveBeenCalledTimes(1);
  });

  it("shows shared success text after a successful share", async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ExportButton categories={sampleCategories} />);

    await userEvent.click(screen.getByRole("button", { name: /chia sẻ/i }));

    expect(screen.getByText(/đã chia sẻ/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Export text format
// ---------------------------------------------------------------------------

describe("ExportButton — export text format", () => {
  it("includes the checked indicator for checked items", async () => {
    render(<ExportButton categories={sampleCategories} />);

    await userEvent.click(screen.getByRole("button", { name: /sao chép/i }));

    const exportedText = mockWriteText.mock.calls[0][0] as string;
    // Item one is checked, so its line should contain the check emoji
    expect(exportedText).toMatch(/Item one/);
    expect(exportedText).toMatch(/Item two/);
  });

  it("does not include categories with zero items", async () => {
    const categoriesWithEmpty: Category[] = [
      ...sampleCategories,
      { id: "cat-empty", name: "Empty", items: [] },
    ];
    render(<ExportButton categories={categoriesWithEmpty} />);

    await userEvent.click(screen.getByRole("button", { name: /sao chép/i }));

    const exportedText = mockWriteText.mock.calls[0][0] as string;
    expect(exportedText).not.toContain("Empty");
  });
});
