"use client";

import { useState } from "react";

interface Props {
  onAdd: (label: string, tag?: "must" | "opt", note?: string) => void;
}

export default function AddItemForm({ onAdd }: Props) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [tag, setTag] = useState<"must" | "opt" | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value, tag, note.trim() || undefined);
    setValue("");
    setNote("");
    setTag(undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Thêm đồ vật..."
          className="flex-1 text-base border border-gray-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="text-base px-4 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Thêm
        </button>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Mô tả (tuỳ chọn)..."
        className="text-base border border-gray-200 rounded-lg px-3 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
      />
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTag(tag === "must" ? undefined : "must")}
          className={`text-sm px-3 py-2 rounded-full border transition-colors ${
            tag === "must"
              ? "bg-coral-500 text-white border-coral-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-coral-300 hover:text-coral-500"
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
              : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-500"
          }`}
        >
          Nên có
        </button>
        {tag !== undefined && (
          <button
            type="button"
            onClick={() => setTag(undefined)}
            className="text-sm px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors"
          >
            Không
          </button>
        )}
      </div>
    </form>
  );
}
