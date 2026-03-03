"use client";

import { useState, useEffect } from "react";
import type { Category, Item } from "./types";
import { DEFAULT_CATEGORIES } from "./defaultData";

const STORAGE_KEY = "beach-checklist";

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function useChecklist() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setCategories(stored ? (JSON.parse(stored) as Category[]) : DEFAULT_CATEGORIES);
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    }
    setLoaded(true);
  }, []);

  // Persist on every change (skip initial render)
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories, loaded]);

  function toggleItem(categoryId: string, itemId: string) {
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

  function addItem(categoryId: string, label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const newItem: Item = { id: generateId(), label: trimmed, checked: false };
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : { ...cat, items: [...cat.items, newItem] }
      )
    );
  }

  function removeItem(categoryId: string, itemId: string) {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId
          ? cat
          : { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
      )
    );
  }

  function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) => [
      ...prev,
      { id: generateId(), name: trimmed, items: [] },
    ]);
  }

  function resetAll() {
    setCategories(DEFAULT_CATEGORIES);
  }

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
    resetAll,
  };
}
