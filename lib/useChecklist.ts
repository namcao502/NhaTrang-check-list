"use client";

import { useState, useEffect } from "react";
import type { Category, Item } from "./types";
import { DEFAULT_CATEGORIES } from "./defaultData";
import { isValidCategories } from "./validation";

const STORAGE_KEY = "beach-checklist";

function generateId(): string {
  return crypto.randomUUID();
}

export function useChecklist() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [undoStack, setUndoStack] = useState<Category[][]>([]);

  function pushUndo() {
    setUndoStack((prev) => [...prev.slice(-9), categories]);
  }

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        setCategories(isValidCategories(parsed) ? parsed : DEFAULT_CATEGORIES);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    }
    setLoaded(true);
  }, []);

  // Persist on every change (skip initial render)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn("Failed to persist checklist to localStorage:", e);
    }
  }, [categories, loaded]);

  function toggleItem(categoryId: string, itemId: string) {
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) =>
                item.id !== itemId ? item : { ...item, checked: !item.checked }
              ),
            }
      )
    );
  }

  function addItem(categoryId: string, label: string, tag?: "must" | "opt", note?: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    pushUndo();
    const newItem: Item = { id: generateId(), label: trimmed, checked: false, ...(tag ? { tag } : {}), ...(note?.trim() ? { note: note.trim() } : {}) };
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : { ...cat, items: [...cat.items, newItem] }
      )
    );
  }

  function removeItem(categoryId: string, itemId: string) {
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId
          ? cat
          : { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
      )
    );
  }

  function addCategory(name: string, icon?: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    pushUndo();
    setCategories((prev) => [
      ...prev,
      { id: generateId(), name: trimmed, items: [], ...(icon ? { icon } : {}) },
    ]);
  }

  function renameItem(categoryId: string, itemId: string, newLabel: string) {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) =>
                item.id !== itemId ? item : { ...item, label: trimmed }
              ),
            }
      )
    );
  }

  function updateNote(categoryId: string, itemId: string, note: string) {
    const trimmed = note.trim();
    // No-op guard: skip pushUndo when the note value has not changed
    const cat = categories.find((c) => c.id === categoryId);
    const item = cat?.items.find((i) => i.id === itemId);
    const currentNote = item?.note ?? '';
    if (trimmed === currentNote) return;
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) => {
                if (item.id !== itemId) return item;
                if (!trimmed) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { note: _removed, ...rest } = item;
                  return rest;
                }
                return { ...item, note: trimmed };
              }),
            }
      )
    );
  }

  function renameCategory(categoryId: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : { ...cat, name: trimmed }
      )
    );
  }

  function removeCategory(categoryId: string) {
    pushUndo();
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  }

  function bulkToggleCategory(categoryId: string) {
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const allChecked = cat.items.length > 0 && cat.items.every((i) => i.checked);
        return {
          ...cat,
          items: cat.items.map((item) => ({ ...item, checked: !allChecked })),
        };
      })
    );
  }

  function resetAll() {
    setCategories(DEFAULT_CATEGORIES);
  }

  function loadCategories(newCategories: Category[]) {
    pushUndo();
    setCategories(newCategories);
  }

  function updateCategoryIcon(categoryId: string, icon: string) {
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        if (!icon) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { icon: _removed, ...rest } = cat;
          return rest;
        }
        return { ...cat, icon };
      })
    );
  }

  function moveCategory(categoryId: string, direction: 'up' | 'down') {
    pushUndo();
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === categoryId);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  function moveItem(categoryId: string, itemId: string, direction: 'up' | 'down') {
    pushUndo();
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const idx = cat.items.findIndex((i) => i.id === itemId);
        if (idx === -1) return cat;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= cat.items.length) return cat;
        const next = [...cat.items];
        [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
        return { ...cat, items: next };
      })
    );
  }

  function undo() {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const restored = next.pop()!;
      setCategories(restored);
      return next;
    });
  }

  const canUndo = undoStack.length > 0;

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );

  return {
    categories,
    loaded,
    totalItems,
    checkedItems,
    toggleItem,
    addItem,
    removeItem,
    addCategory,
    removeCategory,
    renameItem,
    updateNote,
    renameCategory,
    bulkToggleCategory,
    resetAll,
    loadCategories,
    updateCategoryIcon,
    moveCategory,
    moveItem,
    undo,
    canUndo,
  };
}
