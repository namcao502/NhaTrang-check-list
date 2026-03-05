"use client";

import { useRef, useEffect } from "react";

const EMOJI_LIST = [
  '🏊', '👗', '👟', '🧴', '☀️', '💊', '📱', '💳', '🎒',
  '🍽️', '🏨', '✈️', '🚗', '🎭', '🎪', '📸', '🧳', '👶',
  '🐕', '🎣', '🏖️', '🌊', '🎡', '🦁', '🧸', '🎮', '📖',
  '🍹', '🧊', '🪣',
];

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={containerRef} className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Chon icon</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">x</button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {EMOJI_LIST.map((emoji) => (
          <button key={emoji} type="button" onClick={() => { onSelect(emoji); onClose(); }}
            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            {emoji}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => { onSelect(''); onClose(); }}
        className="mt-2 w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        Bo icon
      </button>
    </div>
  );
}
