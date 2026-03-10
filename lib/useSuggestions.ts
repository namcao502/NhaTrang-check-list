"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Category } from "./types";
import type { Suggestion, TripContext } from "./suggestionsData";
import { SUGGESTION_RULES } from "./suggestionsData";
import { isValidDismissedSuggestions } from "./validation";

const DISMISSED_KEY = "beach-dismissed-suggestions";

function loadDismissed(): string[] {
  try {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return isValidDismissedSuggestions(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDismissed(ids: string[]): void {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Failed to persist dismissed suggestions to localStorage:", e);
  }
}

function buildTripContext(departureDate: string | null): TripContext | null {
  if (!departureDate) return null;

  const dep = new Date(departureDate + "T00:00:00");
  if (isNaN(dep.getTime())) return null;

  const now = new Date();
  const diffMs = dep.getTime() - now.getTime();
  const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const departureMonth = dep.getMonth() + 1; // 1-indexed

  return {
    durationDays,
    departureMonth,
    isBeachTrip: true, // Nha Trang is always a beach trip
  };
}

function getAllExistingLabels(categories: Category[]): Set<string> {
  const labels = new Set<string>();
  for (const cat of categories) {
    for (const item of cat.items) {
      labels.add(item.label.toLowerCase());
    }
  }
  return labels;
}

export function useSuggestions(categories: Category[], departureDate: string | null) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    setDismissedIds(loadDismissed());
  }, []);

  const tripContext = useMemo(() => buildTripContext(departureDate), [departureDate]);

  const suggestions = useMemo(() => {
    if (!tripContext) return [];

    const existingLabels = getAllExistingLabels(categories);
    const dismissed = new Set(dismissedIds);

    const matched: Suggestion[] = [];
    for (const rule of SUGGESTION_RULES) {
      if (rule.condition(tripContext)) {
        for (const suggestion of rule.suggestions) {
          if (!dismissed.has(suggestion.id) && !existingLabels.has(suggestion.label.toLowerCase())) {
            matched.push(suggestion);
          }
        }
      }
    }

    return matched;
  }, [tripContext, categories, dismissedIds]);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = [...prev, id];
      saveDismissed(next);
      return next;
    });
  }, []);

  return { suggestions, dismiss };
}
