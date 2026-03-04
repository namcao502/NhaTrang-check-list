/**
 * Tests for components/ThemeToggle.tsx
 *
 * Covers:
 * - Renders the toggle button with correct initial label.
 * - Toggles dark class on document.documentElement when clicked.
 * - Persists dark mode state to localStorage under "beach-dark-mode".
 * - Restores dark mode from localStorage on mount.
 * - Defaults to light mode when localStorage is empty.
 * - Updates the aria-label to reflect the current mode.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/ThemeToggle";

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
  document.documentElement.classList.remove("dark");
});

// ---------------------------------------------------------------------------
// Initial rendering
// ---------------------------------------------------------------------------

describe("ThemeToggle — initial rendering", () => {
  it("renders a button element", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("defaults to light mode when localStorage is empty", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("shows the dark mode label when in light mode", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ tối");
  });
});

// ---------------------------------------------------------------------------
// Toggle behaviour
// ---------------------------------------------------------------------------

describe("ThemeToggle — toggle behaviour", () => {
  it("adds 'dark' class to document.documentElement when clicked once", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from document.documentElement when clicked twice", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("updates the aria-label to light mode label after enabling dark mode", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ sáng");
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("ThemeToggle — localStorage persistence", () => {
  it("persists 'true' to localStorage when dark mode is enabled", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));

    expect(localStorageMock.getItem("beach-dark-mode")).toBe("true");
  });

  it("persists 'false' to localStorage when dark mode is disabled", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));

    expect(localStorageMock.getItem("beach-dark-mode")).toBe("false");
  });

  it("restores dark mode from localStorage on mount", () => {
    localStorageMock.setItem("beach-dark-mode", "true");
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ sáng");
  });

  it("restores light mode from localStorage on mount", () => {
    localStorageMock.setItem("beach-dark-mode", "false");

    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ tối");
  });
});
