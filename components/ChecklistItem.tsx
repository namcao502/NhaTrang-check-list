"use client";

import { useState, useRef } from "react";
import DragHandle from "./DragHandle";
import { useItemDrag } from "./SortableItem";
import { ITEM, COMMON } from "@/lib/constants";

interface Props {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
  tag?: "must" | "opt";
  onToggle: () => void;
  onRemove: () => void;
  onRename: (newLabel: string) => void;
  onNoteChange: (note: string) => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

export default function ChecklistItem({
  id,
  label,
  checked,
  note,
  tag,
  onToggle,
  onRemove,
  onRename,
  onNoteChange,
  quantity,
  onQuantityChange,
}: Props) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(label);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note ?? "");

  // Ref flags to prevent onBlur from committing after Escape
  const cancelledLabelRef = useRef(false);
  const cancelledNoteRef = useRef(false);

  // Keep drafts in sync if props change externally
  const prevLabel = useRef(label);
  if (prevLabel.current !== label) {
    prevLabel.current = label;
    if (!editingLabel) setLabelDraft(label);
  }
  const prevNote = useRef(note);
  if (prevNote.current !== note) {
    prevNote.current = note;
    if (!editingNote) setNoteDraft(note ?? "");
  }

  function commitLabel() {
    if (cancelledLabelRef.current) {
      cancelledLabelRef.current = false;
      return;
    }
    const trimmed = labelDraft.trim();
    if (!trimmed) {
      setLabelDraft(label);
    } else {
      onRename(trimmed);
    }
    setEditingLabel(false);
  }

  function commitNote() {
    if (cancelledNoteRef.current) {
      cancelledNoteRef.current = false;
      return;
    }
    onNoteChange(noteDraft.trim());
    setEditingNote(false);
  }

  const itemDrag = useItemDrag();

  return (
    <li
      className={`flex items-center gap-2 py-3 px-3 rounded-lg group transition-colors ${
        checked ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-ocean-50 dark:hover:bg-ocean-900/20"
      }`}
    >
      {itemDrag && (
        <DragHandle listeners={itemDrag.listeners} attributes={itemDrag.attributes} />
      )}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={id}
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
          checked
            ? "bg-ocean-600 border-ocean-600 text-white dark:bg-ocean-500 dark:border-ocean-500"
            : "border-gray-300 dark:border-gray-500 hover:border-ocean-400 dark:hover:border-ocean-400"
        }`}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          {editingLabel ? (
            <input
              autoFocus
              className="w-full text-sm border border-ocean-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ocean-400 dark:focus:ring-ocean-500 dark:bg-slate-700 dark:text-gray-100 dark:border-ocean-600"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  cancelledLabelRef.current = true;
                  setLabelDraft(label);
                  setEditingLabel(false);
                }
              }}
              onBlur={commitLabel}
            />
          ) : (
            <span
              className={`text-base cursor-text select-none ${
                checked ? "line-through text-gray-400 dark:text-gray-400" : "text-gray-700 dark:text-gray-200"
              }`}
              onClick={() => {
                setLabelDraft(label);
                setEditingLabel(true);
              }}
            >
              {label}
            </span>
          )}

          {(quantity ?? 1) > 1 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              &times; {quantity}
            </span>
          )}
        </div>

        {/* Note area */}
        {editingNote ? (
          <input
            autoFocus
            placeholder={ITEM.NOTE_PLACEHOLDER}
            className="mt-0.5 w-full text-xs border border-ocean-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ocean-400 dark:focus:ring-ocean-500 dark:bg-slate-700 dark:text-gray-100 dark:border-ocean-600"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                cancelledNoteRef.current = true;
                setNoteDraft(note ?? "");
                setEditingNote(false);
              }
            }}
            onBlur={commitNote}
          />
        ) : note ? (
          <span
            className="block text-sm text-gray-400 dark:text-gray-400 mt-0.5 cursor-text"
            onClick={() => {
              setNoteDraft(note);
              setEditingNote(true);
            }}
          >
            {note}
          </span>
        ) : (
          <button
            aria-label={ITEM.ADD_NOTE_ARIA}
            onClick={() => {
              setNoteDraft("");
              setEditingNote(true);
            }}
            className="block text-sm text-gray-300 hover:text-ocean-400 dark:text-gray-500 dark:hover:text-ocean-400 transition-colors mt-0.5 px-1 leading-none"
          >
            +
          </button>
        )}
      </div>

      {onQuantityChange && (
        <div className="print-hide flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            aria-label={ITEM.DECREASE_QTY_ARIA}
            disabled={(quantity ?? 1) <= 1}
            onClick={() => onQuantityChange((quantity ?? 1) - 1)}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:text-ocean-300 dark:hover:bg-ocean-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-5 text-center tabular-nums">
            {quantity ?? 1}
          </span>
          <button
            aria-label={ITEM.INCREASE_QTY_ARIA}
            onClick={() => onQuantityChange((quantity ?? 1) + 1)}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:text-ocean-300 dark:hover:bg-ocean-900/20 transition-colors"
          >
            +
          </button>
        </div>
      )}

      {tag === "must" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-coral-100 text-coral-600 dark:bg-coral-600/30 dark:text-coral-400 font-medium whitespace-nowrap flex-shrink-0">
          {COMMON.MUST_TAG}
        </span>
      )}
      {tag === "opt" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium whitespace-nowrap flex-shrink-0">
          {COMMON.OPT_TAG}
        </span>
      )}

      <button
        onClick={onRemove}
        aria-label={ITEM.DELETE_ARIA(label)}
        className="print-hide opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl p-1 leading-none flex-shrink-0"
      >
        ×
      </button>
    </li>
  );
}
