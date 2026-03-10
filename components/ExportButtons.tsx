"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { formatChecklistText } from "@/lib/formatChecklist";
import { EXPORT } from "@/lib/constants";

interface Props {
  categories: Category[];
}

export default function ExportButtons({ categories }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatChecklistText(categories);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(EXPORT.COPY_ERROR);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-hide flex gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors bg-white/70 dark:bg-slate-700/70 text-ocean-600 dark:text-ocean-300 border border-ocean-200 dark:border-ocean-700 hover:bg-ocean-50 hover:text-ocean-700 dark:hover:bg-ocean-700/30 dark:hover:text-ocean-200"
      >
        {copied ? EXPORT.COPY_SUCCESS : EXPORT.COPY_BUTTON}
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors bg-white/70 dark:bg-slate-700/70 text-ocean-600 dark:text-ocean-300 border border-ocean-200 dark:border-ocean-700 hover:bg-ocean-50 hover:text-ocean-700 dark:hover:bg-ocean-700/30 dark:hover:text-ocean-200"
      >
        {EXPORT.PRINT_BUTTON}
      </button>
    </div>
  );
}
