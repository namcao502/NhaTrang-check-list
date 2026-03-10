"use client";

import { useState, useEffect } from "react";
import type { Category, Template } from "./types";
import { DEFAULT_CATEGORIES } from "./defaultData";
import { isValidTemplates } from "./validation";

const STORAGE_KEY = "beach-templates";

const DEFAULT_TEMPLATE: Template = {
  id: "default",
  name: "Mặc định",
  categories: DEFAULT_CATEGORIES,
  createdAt: new Date(0).toISOString(),
};

export function useTemplates() {
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        setUserTemplates(isValidTemplates(parsed) ? parsed : []);
      }
    } catch {
      // Fall back to empty list
    }
    setLoaded(true);
  }, []);

  // Persist on every change (skip initial render)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
    } catch (e) {
      console.warn("Failed to persist templates to localStorage:", e);
    }
  }, [userTemplates, loaded]);

  // Always include the built-in default template at the front
  const templates: Template[] = [DEFAULT_TEMPLATE, ...userTemplates];

  function saveTemplate(name: string, categories: Category[]) {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Store categories with all checked states reset to false
    const cleanCategories: Category[] = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item, checked: false })),
    }));

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: trimmed,
      categories: cleanCategories,
      createdAt: new Date().toISOString(),
    };

    setUserTemplates((prev) => [...prev, newTemplate]);
  }

  function loadTemplate(id: string): Category[] | null {
    const template = templates.find((t) => t.id === id);
    if (!template) return null;
    // Return a deep copy with checked reset to false
    return template.categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item, checked: false })),
    }));
  }

  function deleteTemplate(id: string) {
    if (id === "default") return;
    setUserTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return {
    templates,
    loaded,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  };
}
