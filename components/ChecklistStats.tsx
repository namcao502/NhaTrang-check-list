"use client";

interface Props {
  checked: number;
  total: number;
  onReset: () => void;
}

export default function ChecklistStats({ checked, total, onReset }: Props) {
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  const allDone = total > 0 && checked === total;

  return (
    <div className="glass-card rounded-2xl shadow-lg border border-white/40 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">
          {allDone ? "🏖️ You're beach-ready!" : `${checked} of ${total} items packed`}
        </span>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset all
        </button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(to right, #ffd60a, #f77f00)",
          }}
        />
      </div>
      <p className="text-right text-xs text-gray-400 mt-1">{percent}%</p>
    </div>
  );
}
