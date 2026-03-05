"use client";

import { useState } from "react";

interface Props {
  onAdd: (label: string, tag?: "must" | "opt", note?: string, qty?: number) => void;
}

export default function AddItemForm({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [tag, setTag] = useState<"must" | "opt" | undefined>(undefined);
  const [qty, setQty] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value, tag, note.trim() || undefined, qty > 1 ? qty : undefined);
    setValue("");
    setNote("");
    setTag(undefined);
    setQty(1);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Thêm đồ vật..."
          className="flex-1 text-base border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="text-base px-4 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Thêm
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Mô tả (tuỳ chọn)..."
        className="text-base border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-300 dark:placeholder-gray-400 rounded-lg px-3 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500 focus:border-transparent"
      />
      <input
        type="number"
        min={1}
        max={99}
        value={qty === 1 ? '' : qty}
        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        placeholder="SL"
        className="w-14 text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500"
      />
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTag(tag === "must" ? undefined : "must")}
          className={`text-sm px-3 py-2 rounded-full border transition-colors ${
            tag === "must"
              ? "bg-coral-500 text-white border-coral-500"
              : "bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-coral-300 hover:text-coral-500 dark:hover:border-coral-500 dark:hover:text-coral-500"
          }`}
        >
          Quan trọng
        </button>
        <button
          type="button"
          onClick={() => setTag(tag === "opt" ? undefined : "opt")}
          className={`text-sm px-3 py-2 rounded-full border transition-colors ${
            tag === "opt"
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:text-purple-500 dark:hover:border-purple-500 dark:hover:text-purple-400"
          }`}
        >
          Nên có
        </button>
        {tag !== undefined && (
          <button
            type="button"
            onClick={() => setTag(undefined)}
            className="text-sm px-3 py-2 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Không
          </button>
        )}
      </div>
    </form>
  );
}
