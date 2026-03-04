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
        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-base text-gray-400 dark:text-gray-400 hover:border-ocean-400 hover:text-ocean-600 dark:hover:border-ocean-500 dark:hover:text-ocean-400 transition-colors"
      >
        + Thêm danh mục
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-ocean-200 dark:border-ocean-700 shadow-sm"
    >
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tên danh mục..."
        className="flex-1 text-base border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="text-base px-4 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Thêm
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-base px-3 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Hủy
      </button>
    </form>
  );
}
