"use client";

import { useState, useMemo } from "react";
import { parseImportText } from "@/lib/parseImportText";
import type { Category } from "@/lib/types";

const NEW_CATEGORY_VALUE = "__new__";

interface Props {
  categories: Category[];
  onImport: (labels: string[], categoryId: string | null, newCategoryName?: string) => void;
  onClose: () => void;
}

export default function ImportTextModal({
  categories,
  onImport,
  onClose,
}: Props) {
  const [text, setText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories.length > 0 ? categories[0].id : NEW_CATEGORY_VALUE
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  const parsedItems = useMemo(() => parseImportText(text), [text]);

  const isNewCategory = selectedCategoryId === NEW_CATEGORY_VALUE;
  const canConfirm =
    parsedItems.length > 0 &&
    (isNewCategory ? newCategoryName.trim().length > 0 : true);

  function handleConfirm() {
    if (!canConfirm) return;

    if (isNewCategory) {
      onImport(parsedItems, null, newCategoryName.trim());
    } else {
      onImport(parsedItems, selectedCategoryId);
    }

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 dark:border-slate-600/50 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold font-playfair text-gray-900 dark:text-gray-100 mb-4">
          Nhap danh sach
        </h2>

        {/* Textarea */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dan danh sach vao day
        </label>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"- Kem chong nang\n- Khan tam\n- Kinh boi\n..."}
          className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500 resize-y font-dm-sans"
        />

        {/* Category selector */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-1">
          Nhap vao danh muc
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500 font-dm-sans"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon ? `${cat.icon} ` : ""}{cat.name}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>+ Tao moi...</option>
        </select>

        {/* New category name input */}
        {isNewCategory && (
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ten danh muc moi..."
            className="w-full mt-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500 font-dm-sans"
          />
        )}

        {/* Preview */}
        {parsedItems.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Xem truoc ({parsedItems.length} mon)
            </p>
            <ul className="max-h-40 overflow-y-auto space-y-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              {parsedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-ocean-500 mt-0.5">+</span>
                  <span className="break-all">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="text-sm px-5 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Nhap
          </button>
        </div>
      </div>
    </div>
  );
}
