"use client";

import { useState } from "react";
import type { Suggestion } from "@/lib/suggestionsData";

interface Props {
  suggestions: Suggestion[];
  onAdd: (suggestion: Suggestion) => void;
  onDismiss: (id: string) => void;
}

export default function SmartSuggestions({ suggestions, onAdd, onDismiss }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (suggestions.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 px-5 py-4">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 w-full text-left"
      >
        <span
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 text-xs ${
            collapsed ? "" : "rotate-90"
          }`}
        >
          ▶
        </span>
        <h2 className="text-base font-semibold font-playfair text-gray-800 dark:text-gray-100">
          Goi y thong minh
        </h2>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-dm-sans">
          {suggestions.length} goi y
        </span>
      </button>

      {!collapsed && (
        <ul className="mt-3 flex flex-col gap-2">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-gray-100 dark:border-gray-600 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 font-dm-sans">
                    {s.label}
                  </span>
                  <span className="text-xs text-ocean-600 dark:text-ocean-400 bg-ocean-50 dark:bg-ocean-700/30 rounded-full px-2 py-0.5 whitespace-nowrap">
                    {s.targetCategoryName}
                  </span>
                  {s.tag === "must" && (
                    <span className="text-xs text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-600/20 rounded-full px-2 py-0.5">
                      quan trong
                    </span>
                  )}
                </div>
                {s.note && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-dm-sans">
                    {s.note}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onAdd(s)}
                className="rounded-lg bg-ocean-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-ocean-700 transition-colors flex-shrink-0"
              >
                Them
              </button>
              <button
                type="button"
                onClick={() => onDismiss(s.id)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm flex-shrink-0 px-1"
                aria-label="Bo qua goi y"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
