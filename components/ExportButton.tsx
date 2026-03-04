"use client";

import { useState, useRef } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        className="glass-card rounded-full shadow border border-white/40 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 transition-colors"
      >
        {copied ? "✓ Đã sao chép!" : "📋 Sao chép danh sách"}
      </button>
      {showFallback && (
        <textarea
          ref={textareaRef}
          readOnly
          value={fallbackText}
          rows={8}
          className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-ocean-300 resize-none"
        />
      )}
    </div>
  );
}
