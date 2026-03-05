"use client";

import { useState, useEffect } from "react";

type ThemeMode = "light" | "dark" | "system";
const STORAGE_KEY = "beach-dark-mode";

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveMode(mode: ThemeMode): boolean {
  if (mode === "system") return getSystemDark();
  return mode === "dark";
}

function loadMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return "dark";
    if (stored === "false") return "light";
    if (stored === "system") return "system";
    return "light";
  } catch {
    return "light";
  }
}

function persistMode(mode: ThemeMode): void {
  try {
    if (mode === "dark") localStorage.setItem(STORAGE_KEY, "true");
    else if (mode === "light") localStorage.setItem(STORAGE_KEY, "false");
    else localStorage.setItem(STORAGE_KEY, "system");
  } catch {
    // Silently ignore storage errors
  }
}

function applyDark(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

const CYCLE: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(loadMode);

  // Sync dark class and persist whenever mode changes
  useEffect(() => {
    applyDark(resolveMode(mode));
    persistMode(mode);
  }, [mode]);

  // When mode is 'system', listen for OS preference changes
  useEffect(() => {
    if (mode !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      applyDark(e.matches);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mode]);

  const labelMap: Record<ThemeMode, string> = {
    light: "\uD83C\uDF19 T\u1ED1i",
    dark: "\uD83D\uDDA5\uFE0F H\u1EC7 th\u1ED1ng",
    system: "\u2600\uFE0F S\u00E1ng",
  };

  const ariaMap: Record<ThemeMode, string> = {
    light: "Chuy\u1EC3n sang ch\u1EBF \u0111\u1ED9 t\u1ED1i",
    dark: "Chuy\u1EC3n sang ch\u1EBF \u0111\u1ED9 h\u1EC7 th\u1ED1ng",
    system: "Chuy\u1EC3n sang ch\u1EBF \u0111\u1ED9 s\u00E1ng",
  };

  return (
    <button
      type="button"
      onClick={() => setMode((v) => CYCLE[v])}
      className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors bg-white/70 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600"
      aria-label={ariaMap[mode]}
    >
      {labelMap[mode]}
    </button>
  );
}
