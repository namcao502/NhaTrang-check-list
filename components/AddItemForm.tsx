"use client";

import { useState } from "react";

interface Props {
  onAdd: (label: string) => void;
}

export default function AddItemForm({ onAdd }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add item..."
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="text-sm px-3 py-1.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
    </form>
  );
}
