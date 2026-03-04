"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "beach-dark-mode";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Sync with the DOM on mount in case the blocking script already set it
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(dark));
    } catch {
      // Silently ignore storage errors
    }
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors bg-white/70 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600"
      aria-label={dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {dark ? "☀️ Sáng" : "🌙 Tối"}
    </button>
  );
}
