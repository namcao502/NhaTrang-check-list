"use client";
import { useState, useEffect } from "react";

const DEPARTURE_KEY = "beach-departure";

export function useCountdown() {
  const [departureDate, setDepartureDateState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(DEPARTURE_KEY);
    if (stored) setDepartureDateState(stored);
  }, []);

  function setDeparture(date: string) {
    localStorage.setItem(DEPARTURE_KEY, date);
    setDepartureDateState(date);
  }

  function clearDeparture() {
    localStorage.removeItem(DEPARTURE_KEY);
    setDepartureDateState(null);
  }

  let daysLeft: number | null = null;
  if (departureDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dep = new Date(departureDate + 'T00:00:00');
    dep.setHours(0, 0, 0, 0);
    daysLeft = Math.round((dep.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return { departureDate, daysLeft, setDeparture, clearDeparture };
}
