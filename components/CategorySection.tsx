"use client";

import { useState } from "react";
import type { Category, Item } from "@/lib/types";
import ChecklistItem from "./ChecklistItem";
import AddItemForm from "./AddItemForm";

interface Props {
  category: Category;
  visibleItems: Item[];
  onToggleItem: (itemId: string) => void;
  onAddItem: (label: string) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function CategorySection({
  category,
  visibleItems,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const checked = category.items.filter((i) => i.checked).length;
  const total = category.items.length;
  const allDone = total > 0 && checked === total;

  return (
    <section className="glass-card rounded-2xl shadow-lg border border-white/40 overflow-hidden">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {category.icon && (
            <span className="text-xl flex-shrink-0">{category.icon}</span>
          )}
          <span className={`text-lg font-semibold ${allDone ? "text-green-600" : "text-gray-800"}`}>
            {category.name}
          </span>
          {allDone && <span className="text-green-500 text-sm font-medium">✓ Done</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-sky-100 text-sky-700 rounded-full px-2 py-0.5 text-xs">
            {checked}/{total}
          </span>
          {onMoveUp && (
            <span
              role="button"
              aria-label="Di chuyển lên"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className="text-gray-400 hover:text-gray-700 text-sm px-1 leading-none cursor-pointer select-none"
            >
              ↑
            </span>
          )}
          {onMoveDown && (
            <span
              role="button"
              aria-label="Di chuyển xuống"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className="text-gray-400 hover:text-gray-700 text-sm px-1 leading-none cursor-pointer select-none"
            >
              ↓
            </span>
          )}
          <span className={`text-gray-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}>
            ▾
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4">
          {visibleItems.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">No items yet.</p>
          ) : (
            <ul>
              {visibleItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  checked={item.checked}
                  note={item.note}
                  tag={item.tag}
                  onToggle={() => onToggleItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </ul>
          )}
          <AddItemForm onAdd={onAddItem} />
        </div>
      )}
    </section>
  );
}
