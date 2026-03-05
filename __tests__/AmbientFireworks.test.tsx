/**
 * Tests for components/AmbientFireworks.tsx
 *
 * Covers:
 * - Renders a full-screen canvas element.
 * - Canvas has pointer-events: none so it does not block user interaction.
 * - Canvas has the print-hide class for print exclusion.
 * - Calls confetti.create on mount with the canvas element.
 * - Fires a burst immediately on mount.
 * - Sets up a repeating interval for bursts.
 * - Cleans up (reset + clearInterval) on unmount.
 */

import React from "react";
import { render } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mock canvas-confetti
//
// canvas-confetti uses `export = confetti` (CJS-style). The component does
// `import confetti from "canvas-confetti"` then `confetti.create(canvas, opts)`.
//
// We build the entire mock inside the factory so there are no hoisting issues.
// Then we retrieve the mock functions through the module reference for assertions.
// ---------------------------------------------------------------------------

const mockReset = jest.fn();
const mockConfettiFn = Object.assign(jest.fn(), { reset: mockReset });
const mockCreate = jest.fn().mockReturnValue(mockConfettiFn);

jest.mock("canvas-confetti", () => {
  // Build a callable mock that also has a .create static method
  return {
    __esModule: true,
    default: Object.assign(jest.fn(), {
      create: (...args: unknown[]) => mockCreate(...args),
    }),
  };
});

// Import the component AFTER the mock is set up
import AmbientFireworks from "@/components/AmbientFireworks";

// ---------------------------------------------------------------------------
// Timer control
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.useFakeTimers();
  mockCreate.mockClear();
  mockCreate.mockReturnValue(mockConfettiFn);
  mockConfettiFn.mockClear();
  mockReset.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("AmbientFireworks — rendering", () => {
  it("renders a canvas element", () => {
    const { container } = render(<AmbientFireworks />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("canvas has pointer-events: none so it does not block interaction", () => {
    const { container } = render(<AmbientFireworks />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.pointerEvents).toBe("none");
  });

  it("canvas has the print-hide class", () => {
    const { container } = render(<AmbientFireworks />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.classList.contains("print-hide")).toBe(true);
  });

  it("canvas has fixed positioning classes for full-screen coverage", () => {
    const { container } = render(<AmbientFireworks />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.classList.contains("fixed")).toBe(true);
    expect(canvas.classList.contains("inset-0")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// confetti.create on mount
// ---------------------------------------------------------------------------

describe("AmbientFireworks — confetti initialization", () => {
  it("calls confetti.create with the canvas element on mount", () => {
    const { container } = render(<AmbientFireworks />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(canvas, {
      resize: true,
      useWorker: true,
    });
  });

  it("fires a burst immediately on mount", () => {
    render(<AmbientFireworks />);

    // The confetti function should have been called once right away
    expect(mockConfettiFn).toHaveBeenCalledTimes(1);
    expect(mockConfettiFn).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: expect.any(Number),
        spread: expect.any(Number),
        origin: expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
        disableForReducedMotion: true,
      })
    );
  });

  it("fires additional bursts every 3 seconds via setInterval", () => {
    render(<AmbientFireworks />);

    // 1 call from the immediate burst
    expect(mockConfettiFn).toHaveBeenCalledTimes(1);

    // Advance 3 seconds -> second burst
    jest.advanceTimersByTime(3000);
    expect(mockConfettiFn).toHaveBeenCalledTimes(2);

    // Advance another 3 seconds -> third burst
    jest.advanceTimersByTime(3000);
    expect(mockConfettiFn).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// Cleanup on unmount
// ---------------------------------------------------------------------------

describe("AmbientFireworks — cleanup on unmount", () => {
  it("calls myConfetti.reset() on unmount", () => {
    const { unmount } = render(<AmbientFireworks />);

    expect(mockReset).not.toHaveBeenCalled();

    unmount();

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("clears the interval on unmount so no further bursts fire", () => {
    const { unmount } = render(<AmbientFireworks />);

    unmount();

    // Record the call count at the moment of unmount
    const callCountAtUnmount = mockConfettiFn.mock.calls.length;

    // Advance time well past multiple intervals
    jest.advanceTimersByTime(15000);

    // No additional calls should have been made
    expect(mockConfettiFn).toHaveBeenCalledTimes(callCountAtUnmount);
  });
});

// ---------------------------------------------------------------------------
// Particle count range
// ---------------------------------------------------------------------------

describe("AmbientFireworks — particle parameters", () => {
  it("fires bursts with particle count between 15 and 30", () => {
    render(<AmbientFireworks />);

    // Fire several bursts to sample different random values
    jest.advanceTimersByTime(12000); // 4 additional bursts + 1 initial = 5 total

    for (const call of mockConfettiFn.mock.calls) {
      const opts = call[0] as { particleCount: number };
      expect(opts.particleCount).toBeGreaterThanOrEqual(15);
      expect(opts.particleCount).toBeLessThanOrEqual(30);
    }
  });
});
