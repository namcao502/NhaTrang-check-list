"use client";

import { useState } from "react";

interface Props {
  onAdd: (name: string) => void;
}

export default function AddCategoryForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-ocean-400 hover:text-ocean-600 transition-colors"
      >
        + Add category
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 bg-white rounded-2xl border border-ocean-200 shadow-sm"
    >
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Category name..."
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ocean-400"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="text-sm px-3 py-1.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </form>
  );
}
