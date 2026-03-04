"use client";

import { useState, useRef } from "react";
import type { Category } from "@/lib/types";
import ChecklistItem from "./ChecklistItem";
import AddItemForm from "./AddItemForm";

interface Props {
  category: Category;
  onToggleItem: (itemId: string) => void;
  onAddItem: (label: string, tag?: "must" | "opt") => void;
  onRemoveItem: (itemId: string) => void;
  onRenameCategory: (newName: string) => void;
  onBulkToggle: () => void;
  onRenameItem: (itemId: string, newLabel: string) => void;
  onNoteChange: (itemId: string, note: string) => void;
}

export default function CategorySection({
  category,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onRenameCategory,
  onBulkToggle,
  onRenameItem,
  onNoteChange,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);

  const prevName = useRef(category.name);
  if (prevName.current !== category.name) {
    prevName.current = category.name;
    if (!editingName) setNameDraft(category.name);
  }

  const checked = category.items.filter((i) => i.checked).length;
  const total = category.items.length;
  const allDone = total > 0 && checked === total;

  function commitName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(category.name);
    } else {
      onRenameCategory(trimmed);
    }
    setEditingName(false);
  }

  return (
    <section className="glass-card rounded-2xl shadow-lg border border-white/40 overflow-hidden">
      {/* Header — the outer div handles collapse */}
      <div
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/40 transition-colors cursor-pointer"
        onClick={() => setCollapsed((v) => !v)}
      >
        {/* Left side: icon + name + done badge */}
        <div className="flex items-center gap-3 min-w-0">
          {category.icon && (
            <span className="text-xl flex-shrink-0">{category.icon}</span>
          )}

          {editingName ? (
            <input
              autoFocus
              className="text-lg font-semibold border border-ocean-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ocean-400"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setNameDraft(category.name);
                  setEditingName(false);
                }
              }}
              onBlur={commitName}
            />
          ) : (
            <span
              className={`text-lg font-semibold cursor-text ${
                allDone ? "text-green-600" : "text-gray-800"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setNameDraft(category.name);
                setEditingName(true);
              }}
            >
              {category.name}
            </span>
          )}

          {allDone && (
            <span className="text-green-500 text-sm font-medium flex-shrink-0">
              ✓ Hoàn thành
            </span>
          )}
        </div>

        {/* Right side: bulk toggle + badge + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            disabled={total === 0}
            onClick={(e) => {
              e.stopPropagation();
              onBulkToggle();
            }}
            className="text-xs text-ocean-600 hover:text-ocean-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {allDone ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
          <span className="bg-sky-100 text-sky-700 rounded-full px-2 py-0.5 text-xs">
            {checked}/{total}
          </span>
          <span
            className={`text-gray-400 transition-transform ${
              collapsed ? "-rotate-90" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4">
          {category.items.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">Chưa có đồ vật nào.</p>
          ) : (
            <ul>
              {category.items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  checked={item.checked}
                  note={item.note}
                  tag={item.tag}
                  onToggle={() => onToggleItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onRename={(newLabel) => onRenameItem(item.id, newLabel)}
                  onNoteChange={(note) => onNoteChange(item.id, note)}
                />
              ))}
            </ul>
          )}
          <AddItemForm onAdd={(label, tag) => onAddItem(label, tag)} />
        </div>
      )}
    </section>
  );
}
