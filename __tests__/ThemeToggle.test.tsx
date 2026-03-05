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
// matchMedia mock (jsdom does not implement matchMedia)
// ---------------------------------------------------------------------------

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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

  it("enters system mode after clicking twice (dark → system)", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button")); // light → dark
    await userEvent.click(screen.getByRole("button")); // dark → system

    // System mode resolves via matchMedia mock (matches: false → light)
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("removes 'dark' class after clicking three times (full cycle back to light)", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button")); // light → dark
    await userEvent.click(screen.getByRole("button")); // dark → system
    await userEvent.click(screen.getByRole("button")); // system → light

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("updates the aria-label to system mode label after enabling dark mode", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ hệ thống");
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

  it("persists 'system' to localStorage after clicking twice (dark → system)", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button")); // light → dark
    await userEvent.click(screen.getByRole("button")); // dark → system

    expect(localStorageMock.getItem("beach-dark-mode")).toBe("system");
  });

  it("persists 'false' to localStorage after clicking three times (full cycle back to light)", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button")); // light → dark
    await userEvent.click(screen.getByRole("button")); // dark → system
    await userEvent.click(screen.getByRole("button")); // system → light

    expect(localStorageMock.getItem("beach-dark-mode")).toBe("false");
  });

  it("restores dark mode from localStorage on mount", () => {
    localStorageMock.setItem("beach-dark-mode", "true");
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ hệ thống");
  });

  it("restores light mode from localStorage on mount", () => {
    localStorageMock.setItem("beach-dark-mode", "false");

    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByRole("button")).toHaveAccessibleName("Chuyển sang chế độ tối");
  });
});
