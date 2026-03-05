"use client";

interface Props {
  canUndo: boolean;
  onUndo: () => void;
}

export default function UndoButton({ canUndo, onUndo }: Props) {
  if (!canUndo) return null;

  return (
    <button
      type="button"
      onClick={onUndo}
      className="print-hide fixed bottom-6 left-4 z-50 glass-card shadow-lg rounded-full border border-white/40 dark:border-white/10 text-sm font-medium text-ocean-600 dark:text-ocean-400 px-3 py-2 hover:bg-ocean-50 dark:hover:bg-ocean-700/30 transition-colors"
    >
      ↩ Hoàn tác
    </button>
  );
}
