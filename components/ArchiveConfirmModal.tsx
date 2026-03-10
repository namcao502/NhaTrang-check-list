"use client";

import { useState, useRef, useEffect } from "react";
import { ARCHIVE, COMMON } from "@/lib/constants";

interface Props {
  onArchiveAndReset: (name: string) => void;
  onResetWithoutArchive: () => void;
  onCancel: () => void;
}

export default function ArchiveConfirmModal({
  onArchiveAndReset,
  onResetWithoutArchive,
  onCancel,
}: Props) {
  const defaultName = ARCHIVE.TRIP_NAME_DEFAULT(new Date().toLocaleDateString("vi-VN"));
  const [tripName, setTripName] = useState(defaultName);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      cancelRef.current = true;
      onCancel();
    }
  }

  function handleArchiveAndReset() {
    const name = tripName.trim() || defaultName;
    onArchiveAndReset(name);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-md bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 dark:border-slate-600/50 p-6"
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl font-bold font-playfair text-gray-900 dark:text-gray-100 mb-2">
          {ARCHIVE.TITLE}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {ARCHIVE.DESCRIPTION}
        </p>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {ARCHIVE.TRIP_NAME_LABEL}
        </label>
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-400 dark:focus:ring-ocean-500 font-dm-sans"
          placeholder={ARCHIVE.TRIP_NAME_PLACEHOLDER}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {COMMON.CANCEL}
          </button>
          <button
            type="button"
            onClick={onResetWithoutArchive}
            className="text-sm px-4 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            {ARCHIVE.RESET_NO_SAVE}
          </button>
          <button
            type="button"
            onClick={handleArchiveAndReset}
            className="text-sm px-5 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            {ARCHIVE.SAVE_AND_RESET}
          </button>
        </div>
      </div>
    </div>
  );
}
