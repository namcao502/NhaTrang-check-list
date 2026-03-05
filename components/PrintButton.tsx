"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide glass-card rounded-full shadow border border-white/40 dark:border-white/10 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:bg-ocean-700/30 transition-colors"
    >
      🖨️ In danh sách
    </button>
  );
}
