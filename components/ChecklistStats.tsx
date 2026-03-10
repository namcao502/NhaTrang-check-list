"use client";

interface Props {
  checked: number;
  total: number;
  onResetRequest: () => void;
  onShowHistory: () => void;
}

export default function ChecklistStats({ checked, total, onResetRequest, onShowHistory }: Props) {
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  const allDone = total > 0 && checked === total;

  return (
    <div className="glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-medium text-gray-600 dark:text-gray-300">
          {allDone ? "🏖️ Sẵn sàng ra biển rồi!" : `Đã chuẩn bị ${checked}/${total} đồ vật`}
        </span>
        <div className="print-hide flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="text-sm px-2 py-1 text-gray-400 hover:text-ocean-600 dark:text-gray-400 dark:hover:text-ocean-400 transition-colors"
          >
            Lịch sử
          </button>
          <button
            onClick={onResetRequest}
            className="text-sm px-2 py-1 text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            Đặt lại
          </button>
        </div>
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
