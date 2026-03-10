"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  renderPackingCard,
  downloadCanvasAsPng,
  copyCanvasToClipboard,
} from "@/lib/packingCard";
import { PACKING_CARD } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  checkedItems: number;
  totalItems: number;
}

type FeedbackState = "idle" | "copied" | "error";

export default function PackingCardModal({
  open,
  onClose,
  checkedItems,
  totalItems,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Read departure date from localStorage directly
    let departureDate: string | null = null;
    try {
      const stored = localStorage.getItem("beach-departure");
      if (stored && typeof stored === "string" && stored.match(/^\d{4}-\d{2}-\d{2}$/)) {
        departureDate = stored;
      }
    } catch {
      // Ignore localStorage errors
    }

    renderPackingCard(ctx, 1200, 630, {
      checkedItems,
      totalItems,
      departureDate,
    });
  }, [checkedItems, totalItems]);

  useEffect(() => {
    if (!open) return;

    // Wait for fonts to load before drawing
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        drawCard();
      });
    } else {
      drawCard();
    }
  }, [open, drawCard]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsPng(canvas, "nha-trang-packing.png");
  }

  async function handleCopy() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      await copyCanvasToClipboard(canvas);
      setFeedback("copied");
      setTimeout(() => setFeedback("idle"), 2000);
    } catch {
      setFeedback("error");
      setTimeout(() => setFeedback("idle"), 2000);
    }
  }

  function getCopyButtonText(): string {
    switch (feedback) {
      case "copied":
        return PACKING_CARD.COPY_SUCCESS;
      case "error":
        return PACKING_CARD.COPY_ERROR;
      default:
        return PACKING_CARD.COPY_BUTTON;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 dark:border-slate-600/50 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-playfair text-gray-900 dark:text-gray-100">
            {PACKING_CARD.TITLE}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Canvas preview - scaled to fit */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 mb-4">
          <canvas
            ref={canvasRef}
            width={1200}
            height={630}
            className="w-full h-auto"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors bg-ocean-600 text-white hover:bg-ocean-700 dark:bg-ocean-600 dark:hover:bg-ocean-700"
          >
            {PACKING_CARD.DOWNLOAD}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors border ${
              feedback === "copied"
                ? "bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                : feedback === "error"
                  ? "bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : "bg-white/70 dark:bg-slate-700/70 border-ocean-200 dark:border-ocean-700 text-ocean-600 dark:text-ocean-300 hover:bg-ocean-50 dark:hover:bg-ocean-700/30"
            }`}
          >
            {getCopyButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
