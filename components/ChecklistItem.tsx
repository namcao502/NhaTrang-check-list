"use client";

import { useState, useRef } from "react";

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

  return (
    <li
      className={`flex items-start gap-3 py-2 px-3 rounded-lg group transition-colors ${
        checked ? "bg-blue-50" : "hover:bg-ocean-50"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-5 h-5 rounded accent-ocean-600 cursor-pointer flex-shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        {editingLabel ? (
          <input
            autoFocus
            className="w-full text-sm border border-ocean-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ocean-400"
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
            className={`text-sm cursor-text select-none ${
              checked ? "line-through text-gray-400" : "text-gray-700"
            }`}
            onClick={() => {
              setLabelDraft(label);
              setEditingLabel(true);
            }}
          >
            {label}
          </span>
        )}

        {/* Note area */}
        {editingNote ? (
          <input
            autoFocus
            placeholder="Ghi chú..."
            className="mt-0.5 w-full text-xs border border-ocean-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ocean-400"
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
            className="block text-xs text-gray-400 mt-0.5 cursor-text"
            onClick={() => {
              setNoteDraft(note);
              setEditingNote(true);
            }}
          >
            {note}
          </span>
        ) : (
          <button
            aria-label="Thêm ghi chú"
            onClick={() => {
              setNoteDraft("");
              setEditingNote(true);
            }}
            className="block text-xs text-gray-300 hover:text-ocean-400 transition-colors mt-0.5 leading-none"
          >
            +
          </button>
        )}
      </div>

      {tag === "must" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-coral-100 text-coral-600 font-medium whitespace-nowrap flex-shrink-0">
          Quan trọng
        </span>
      )}
      {tag === "opt" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium whitespace-nowrap flex-shrink-0">
          Nên có
        </span>
      )}
      <button
        onClick={onRemove}
        aria-label={`Xoá ${label}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-lg leading-none flex-shrink-0"
      >
        ×
      </button>
    </li>
  );
}
