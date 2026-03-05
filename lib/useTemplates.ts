"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "./types";

const STORAGE_KEY = "beach-templates";

export interface Template {
  id: string;
  name: string;
  categories: Category[];
  createdAt: string;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTemplates(JSON.parse(stored) as Template[]);
    } catch {
      // Silently ignore parse errors
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(templates)); } catch {
      // Silently ignore storage errors
    }
  }, [templates, loaded]);

  const saveAsTemplate = useCallback((name: string, categories: Category[]) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTemplates((prev) => [...prev, {
      id: generateId(),
      name: trimmed,
      categories: categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, checked: false })),
      })),
      createdAt: new Date().toISOString(),
    }]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { templates, saveAsTemplate, deleteTemplate };
}
