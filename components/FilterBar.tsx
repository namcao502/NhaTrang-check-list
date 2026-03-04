"use client";

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  mustOnly: boolean;
  onMustOnlyChange: (v: boolean) => void;
  hideChecked: boolean;
  onHideCheckedChange: (v: boolean) => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  mustOnly,
  onMustOnlyChange,
  hideChecked,
  onHideCheckedChange,
}: Props) {
  return (
    <div className="glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-5 py-4 flex flex-col gap-3">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm kiếm đồ vật..."
        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-slate-700/70 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-300 dark:focus:ring-ocean-500 transition"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onMustOnlyChange(!mustOnly)}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            mustOnly
              ? "bg-coral-500 text-white shadow-sm"
              : "bg-white/70 dark:bg-slate-700/70 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-coral-50 hover:text-coral-600 dark:hover:bg-coral-600/30 dark:hover:text-coral-500"
          }`}
        >
          Chỉ quan trọng
        </button>
        <button
          type="button"
          onClick={() => onHideCheckedChange(!hideChecked)}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            hideChecked
              ? "bg-ocean-500 text-white shadow-sm"
              : "bg-white/70 dark:bg-slate-700/70 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-ocean-50 hover:text-ocean-600 dark:hover:bg-ocean-700/30 dark:hover:text-ocean-400"
          }`}
        >
          Ẩn đã xong
        </button>
      </div>
    </div>
  );
}
