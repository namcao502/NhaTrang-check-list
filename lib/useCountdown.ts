"use client";
import { useState, useEffect } from "react";
import { isValidDateString } from "./validation";

const DEPARTURE_KEY = "beach-departure";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(departureDate: string): { timeLeft: TimeLeft | null; isPast: boolean } {
  const now = new Date();
  const dep = new Date(departureDate + "T00:00:00");

  // Check if departureDate is today
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (departureDate === todayStr) {
    return { timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 }, isPast: false };
  }

  const diffMs = dep.getTime() - now.getTime();

  if (diffMs < 0) {
    // Departure date is in the past (and not today)
    return { timeLeft: null, isPast: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { timeLeft: { days, hours, minutes, seconds }, isPast: false };
}

export function useCountdown() {
  const [departureDate, setDepartureDateState] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isPast, setIsPast] = useState(false);

  const DEFAULT_DEPARTURE = "2026-03-13";

  // Load departure date from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEPARTURE_KEY);
      if (stored && isValidDateString(stored)) {
        setDepartureDateState(stored);
      } else {
        setDepartureDateState(DEFAULT_DEPARTURE);
        try {
          localStorage.setItem(DEPARTURE_KEY, DEFAULT_DEPARTURE);
        } catch (e) {
          console.warn("Failed to persist departure date to localStorage:", e);
        }
      }
    } catch {
      setDepartureDateState(DEFAULT_DEPARTURE);
    }
  }, []);

  // Live countdown ticker
  useEffect(() => {
    if (!departureDate) {
      setTimeLeft(null);
      setIsPast(false);
      return;
    }

    // Compute immediately so there's no 1-second delay on mount
    const result = computeTimeLeft(departureDate);
    setTimeLeft(result.timeLeft);
    setIsPast(result.isPast);

    const intervalId = setInterval(() => {
      const updated = computeTimeLeft(departureDate);
      setTimeLeft(updated.timeLeft);
      setIsPast(updated.isPast);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [departureDate]);

  function setDeparture(date: string) {
    if (!isValidDateString(date)) return;
    try {
      localStorage.setItem(DEPARTURE_KEY, date);
    } catch (e) {
      console.warn("Failed to persist departure date to localStorage:", e);
    }
    setDepartureDateState(date);
  }

  function clearDeparture() {
    try {
      localStorage.removeItem(DEPARTURE_KEY);
    } catch (e) {
      console.warn("Failed to remove departure date from localStorage:", e);
    }
    setDepartureDateState(null);
  }

  return { departureDate, timeLeft, isPast, setDeparture, clearDeparture };
}
