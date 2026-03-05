"use client";

import { useState, useRef, useEffect } from "react";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
}

function buildExportText(categories: Category[]): string {
  const lines: string[] = ["=== Nha Trang Packing List ==="];
  for (const cat of categories) {
    if (cat.items.length === 0) continue;
    lines.push("");
    lines.push(`📦 ${cat.name}`);
    for (const item of cat.items) {
      lines.push(`  ${item.checked ? "✅" : "⬜"} ${item.label}`);
    }
  }
  return lines.join("\n");
}

export default function ExportButton({ categories }: Props) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState("");
  const [canShare, setCanShare] = useState(false);
  const [shared, setShared] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect Web Share API support after mount (SSR-safe)
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function handleExport() {
    const text = buildExportText(categories);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShowFallback(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallbackText(text);
      setShowFallback(true);
      setTimeout(() => {
        textareaRef.current?.select();
      }, 50);
    }
  }

  async function handleShare() {
    const text = buildExportText(categories);
    try {
      await navigator.share({ title: "Nha Trang Packing List", text });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // User cancelled or share failed — fall back to clipboard
      handleExport();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 glass-card rounded-full shadow border border-white/40 dark:border-white/10 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:bg-ocean-700/30 transition-colors"
        >
          {copied ? "✓ Đã sao chép!" : "📋 Sao chép danh sách"}
        </button>
        {canShare && (
          <button
            type="button"
            onClick={handleShare}
            className="glass-card rounded-full shadow border border-white/40 dark:border-white/10 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:bg-ocean-700/30 transition-colors"
          >
            {shared ? "✓ Đã chia sẻ!" : "📤 Chia sẻ"}
          </button>
        )}
      </div>
      {showFallback && (
        <textarea
          ref={textareaRef}
          readOnly
          value={fallbackText}
          rows={8}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-slate-700/80 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-ocean-300 dark:focus:ring-ocean-500 resize-none"
        />
      )}
    </div>
  );
}
