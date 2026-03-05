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
    <div className="glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-medium text-gray-600 dark:text-gray-300">
          {allDone ? "🏖️ Sẵn sàng ra biển rồi!" : `Đã chuẩn bị ${checked}/${total} đồ vật`}
        </span>
        <button
          onClick={onReset}
          className="print-hide text-sm px-2 py-1 text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        >
          Đặt lại
        </button>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(to right, #ffd60a, #f77f00)",
          }}
        />
      </div>
      <p className="text-right text-sm text-gray-400 dark:text-gray-400 mt-1">{percent}%</p>
    </div>
  );
}
