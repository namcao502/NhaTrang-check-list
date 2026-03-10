"use client";

import { useState, useRef } from 'react';
import type { Destination } from '@/lib/types';
import { geocodeCity } from '@/lib/weatherApi';
import { DESTINATION } from '@/lib/constants';

interface Props {
  destination: Destination;
  onDestinationChange: (dest: Destination) => void;
}

export default function DestinationInput({ destination, onDestinationChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleStartEdit() {
    setInputValue(destination.name);
    setGeocodeError(null);
    setEditing(true);
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function handleConfirm() {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === destination.name) {
      setEditing(false);
      return;
    }

    setGeocoding(true);
    setGeocodeError(null);

    try {
      const result = await geocodeCity(trimmed);
      if (result) {
        onDestinationChange({ name: result.name, lat: result.lat, lon: result.lon });
        setEditing(false);
      } else {
        setGeocodeError(DESTINATION.NOT_FOUND);
      }
    } catch {
      setGeocodeError(DESTINATION.ERROR);
    } finally {
      setGeocoding(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      cancelRef.current = true;
      setEditing(false);
      setGeocodeError(null);
    }
    if (e.key === 'Enter') {
      handleConfirm();
    }
  }

  function handleBlur() {
    if (cancelRef.current) {
      cancelRef.current = false;
      return;
    }
    // Do not auto-confirm on blur to avoid geocoding on accidental blur
    setEditing(false);
    setGeocodeError(null);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={geocoding}
          className="rounded-lg border border-ocean-300 dark:border-ocean-600 bg-white/80 dark:bg-slate-700/80 px-2 py-1 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-ocean-300 dark:focus:ring-ocean-500 transition w-32"
          placeholder={DESTINATION.PLACEHOLDER}
        />
        {geocoding && (
          <span className="text-xs text-gray-400 dark:text-gray-400 animate-pulse">
            {DESTINATION.SEARCHING}
          </span>
        )}
        {geocodeError && (
          <span className="text-xs text-red-500 dark:text-red-400">
            {geocodeError}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className="text-sm font-medium text-ocean-600 dark:text-ocean-300 hover:text-ocean-700 dark:hover:text-ocean-200 transition-colors underline decoration-dotted underline-offset-2"
      title={DESTINATION.CHANGE_ARIA}
    >
      {destination.name}
    </button>
  );
}
