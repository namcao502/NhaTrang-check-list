"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import type { Template } from "@/lib/useTemplates";

interface Props {
  templates: Template[];
  onSave: (name: string, categories: Category[]) => void;
  onLoad: (categories: Category[]) => void;
  onDelete: (id: string) => void;
  currentCategories: Category[];
}

export default function TemplateManager({ templates, onSave, onLoad, onDelete, currentCategories }: Props) {
  const [open, setOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!saveName.trim()) return;
    onSave(saveName, currentCategories);
    setSaveName("");
    setShowSaveForm(false);
  }

  function handleLoad(template: Template) {
    if (window.confirm(`Tai mau "${template.name}"? Danh sach hien tai se bi thay the.`)) {
      onLoad(template.categories);
      setOpen(false);
    }
  }

  function handleDelete(template: Template) {
    if (window.confirm(`Xoa mau "${template.name}"?`)) onDelete(template.id);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="print-hide glass-card rounded-full shadow border border-white/40 dark:border-white/10 px-4 py-2 text-sm font-medium text-ocean-600 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:bg-ocean-700/30 transition-colors"
      >
        Mau chuyen di
      </button>
    );
  }

  return (
    <div className="print-hide glass-card rounded-2xl shadow-lg border border-white/40 dark:border-white/10 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Mau chuyen di</h3>
        <button onClick={() => { setOpen(false); setShowSaveForm(false); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg">x</button>
      </div>

      {showSaveForm ? (
        <form onSubmit={handleSave} className="flex gap-2">
          <input autoFocus type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)}
            placeholder="Ten mau..." className="flex-1 text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500" />
          <button type="submit" disabled={!saveName.trim()} className="text-sm px-3 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 transition-colors">Luu</button>
          <button type="button" onClick={() => setShowSaveForm(false)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Huy</button>
        </form>
      ) : (
        <button onClick={() => setShowSaveForm(true)} className="text-sm text-ocean-600 dark:text-ocean-400 hover:underline text-left">
          + Luu danh sach hien tai lam mau
        </button>
      )}

      {templates.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Chua co mau nao.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between bg-white/50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{t.categories.length} danh muc</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleLoad(t)} className="text-xs text-ocean-600 dark:text-ocean-400 hover:underline">Tai</button>
                <button onClick={() => handleDelete(t)} className="text-xs text-red-500 dark:text-red-400 hover:underline">Xoa</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
