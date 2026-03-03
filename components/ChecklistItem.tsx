"use client";

interface Props {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
  tag?: 'must' | 'opt';
  onToggle: () => void;
  onRemove: () => void;
}

export default function ChecklistItem({ id, label, checked, note, tag, onToggle, onRemove }: Props) {
  return (
    <li className={`flex items-start gap-3 py-2 px-3 rounded-lg group transition-colors ${checked ? "bg-blue-50" : "hover:bg-ocean-50"}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-5 h-5 rounded accent-ocean-600 cursor-pointer flex-shrink-0 mt-0.5"
      />
      <label
        htmlFor={id}
        className={`flex-1 cursor-pointer text-sm select-none ${
          checked ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {label}
        {note && (
          <span className="block text-xs text-gray-400 mt-0.5">{note}</span>
        )}
      </label>
      {tag === "must" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-coral-100 text-coral-600 font-medium whitespace-nowrap ml-auto flex-shrink-0">
          Quan trọng
        </span>
      )}
      {tag === "opt" && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium whitespace-nowrap ml-auto flex-shrink-0">
          Nên có
        </span>
      )}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-lg leading-none flex-shrink-0"
      >
        ×
      </button>
    </li>
  );
}
