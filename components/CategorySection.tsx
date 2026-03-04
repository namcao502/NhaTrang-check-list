"use client";

import { useState, useRef, useEffect } from "react";
import type { Category, Item } from "@/lib/types";
import ChecklistItem from "./ChecklistItem";
import AddItemForm from "./AddItemForm";

const COLLAPSE_STORAGE_KEY = "beach-collapse-state";

function loadCollapseState(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveCollapseState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently ignore storage errors
  }
}

interface Props {
  category: Category;
  visibleItems: Item[];
  onToggleItem: (itemId: string) => void;
  onAddItem: (label: string, tag?: "must" | "opt", note?: string) => void;
  onRemoveItem: (itemId: string) => void;
  onRemoveCategory: () => void;
  onRenameCategory: (newName: string) => void;
  onBulkToggle: () => void;
  onRenameItem: (itemId: string, newLabel: string) => void;
  onNoteChange: (itemId: string, note: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function CategorySection({
  category,
  visibleItems,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onRemoveCategory,
  onRenameCategory,
  onBulkToggle,
  onRenameItem,
  onNoteChange,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const state = loadCollapseState();
    return state[category.id] ?? false;
  });
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);

  // Ref flag to prevent onBlur from committing after Escape
  const cancelledNameRef = useRef(false);

  const prevName = useRef(category.name);
  if (prevName.current !== category.name) {
    prevName.current = category.name;
    if (!editingName) setNameDraft(category.name);
  }

  // Persist collapse state to localStorage
  useEffect(() => {
    const state = loadCollapseState();
    state[category.id] = collapsed;
    saveCollapseState(state);
  }, [collapsed, category.id]);

  function handleDeleteCategory() {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá danh mục "${category.name}" và tất cả đồ vật bên trong?`
    );
    if (confirmed) onRemoveCategory();
  }

  const checked = category.items.filter((i) => i.checked).length;
  const total = category.items.length;
  const allDone = total > 0 && checked === total;

  function commitName() {
    if (cancelledNameRef.current) {
      cancelledNameRef.current = false;
      return;
    }
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(category.name);
    } else {
      onRenameCategory(trimmed);
    }
    setEditingName(false);
  }

  return (
    <section className="glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 overflow-hidden">
      {/* Header — collapse is triggered only by the right-side chevron area */}
      <div className="w-full flex items-center justify-between px-5 py-5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
        {/* Left side: icon + name — stopPropagation so clicks here never collapse */}
        <div
          className="flex items-center gap-3 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {category.icon && (
            <span className="text-xl flex-shrink-0">{category.icon}</span>
          )}

          {editingName ? (
            <input
              autoFocus
              className="text-xl font-semibold border border-ocean-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ocean-400 dark:bg-slate-700 dark:text-gray-100 dark:border-ocean-600"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  cancelledNameRef.current = true;
                  setNameDraft(category.name);
                  setEditingName(false);
                }
              }}
              onBlur={commitName}
            />
          ) : (
            <span
              className={`text-xl font-semibold cursor-text ${
                allDone ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-100"
              }`}
              onClick={() => {
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

        {/* Right side: bulk toggle + move buttons + badge + chevron — clicking here collapses */}
        <div
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
          onClick={() => setCollapsed((v) => !v)}
        >
          <button
            disabled={total === 0}
            onClick={(e) => {
              e.stopPropagation();
              onBulkToggle();
            }}
            className="text-sm sm:text-xs px-2 py-1 text-ocean-600 hover:text-ocean-800 dark:text-ocean-400 dark:hover:text-ocean-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {allDone ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </button>
          <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 rounded-full px-2 py-0.5 text-xs">
            {checked}/{total}
          </span>
          {onMoveUp && (
            <button
              aria-label="Di chuyển lên"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 text-sm px-1 leading-none"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              aria-label="Di chuyển xuống"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 text-sm px-1 leading-none"
            >
              ↓
            </button>
          )}
          <button
            aria-label={`Xoá danh mục ${category.name}`}
            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(); }}
            className="text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 text-lg px-1 leading-none transition-colors"
          >
            ×
          </button>
          <span className={`text-gray-400 dark:text-gray-500 transition-transform ${collapsed ? "-rotate-90" : ""}`}>
            ▾
          </span>
        </div>
      </div>

      {!collapsed && (
        <div className="px-3 sm:px-4 pb-5">
          {visibleItems.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-2">Chưa có đồ vật nào.</p>
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
                  onRename={(newLabel) => onRenameItem(item.id, newLabel)}
                  onNoteChange={(note) => onNoteChange(item.id, note)}
                />
              ))}
            </ul>
          )}
          <AddItemForm onAdd={(label, tag, note) => onAddItem(label, tag, note)} />
        </div>
      )}
    </section>
  );
}
