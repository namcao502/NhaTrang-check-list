"use client";

import { useState, useRef, useEffect } from "react";
import type { Template, Category } from "@/lib/types";

interface Props {
  templates: Template[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TemplatePicker({ templates, onSave, onLoad, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleLoad(id: string) {
    const confirmed = window.confirm(
      "Tải mẫu này sẽ thay thế danh sách hiện tại. Bạn có chắc không?"
    );
    if (!confirmed) return;
    onLoad(id);
    setOpen(false);
  }

  function handleSave() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setNewName("");
  }

  function handleSaveKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    }
  }

  function countItems(categories: Category[]): number {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-5 py-3 text-left text-sm font-medium text-ocean-700 dark:text-ocean-300 hover:border-ocean-300 dark:hover:border-ocean-500 transition-colors flex items-center justify-between"
      >
        <span>Mẫu chuyến đi</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-20 glass-card rounded-2xl shadow-xl border border-white/40 dark:border-white/10 overflow-hidden">
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {templates.map((t) => (
              <li
                key={t.id}
                className="px-5 py-3 flex items-center justify-between gap-2 hover:bg-ocean-50/50 dark:hover:bg-ocean-900/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleLoad(t.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {t.name}
                  </span>
                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                    {countItems(t.categories)} vật phẩm
                    {t.id !== "default" && ` · ${formatDate(t.createdAt)}`}
                  </span>
                </button>
                {t.id !== "default" && (
                  <button
                    type="button"
                    onClick={() => onDelete(t.id)}
                    className="shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                    title="Xoá mẫu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Save new template row */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleSaveKeyDown}
              placeholder="Tên mẫu mới..."
              className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-slate-700/70 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-300 dark:focus:ring-ocean-500 transition"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!newName.trim()}
              className="shrink-0 rounded-xl bg-coral-500 hover:bg-coral-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Lưu mẫu mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
