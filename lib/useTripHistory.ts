"use client";

import { useState, useEffect } from "react";
import type { ArchivedTrip, Category } from "./types";
import { isValidTripHistory } from "./validation";

const STORAGE_KEY = "beach-trip-history";
const MAX_TRIPS = 20;

export function useTripHistory() {
  const [trips, setTrips] = useState<ArchivedTrip[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        setTrips(isValidTripHistory(parsed) ? parsed : []);
      }
    } catch {
      // Corrupted data — start with empty history
    }
    setLoaded(true);
  }, []);

  // Persist on every change (skip initial render)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.warn("Failed to persist trip history to localStorage:", e);
    }
  }, [trips, loaded]);

  function archiveTrip(name: string, categories: Category[]) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const totalCount = categories.reduce(
      (sum, cat) => sum + cat.items.length,
      0
    );
    const checkedCount = categories.reduce(
      (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
      0
    );

    const newTrip: ArchivedTrip = {
      id: crypto.randomUUID(),
      name: trimmed,
      date: new Date().toISOString(),
      categories: JSON.parse(JSON.stringify(categories)) as Category[],
      checkedCount,
      totalCount,
    };

    setTrips((prev) => [newTrip, ...prev].slice(0, MAX_TRIPS));
  }

  function deleteTrip(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  return { trips, archiveTrip, deleteTrip };
}
