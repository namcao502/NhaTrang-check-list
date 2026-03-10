"use client";

import { useState, useEffect, useCallback } from "react";
import { isValidNotifiedDates } from "./validation";
import { NOTIFICATION } from "./constants";

const STORAGE_KEY = "beach-notifications";
const NOTIFIED_KEY = "beach-notified-dates";

export function useNotifications(departureDate: string | null) {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(STORAGE_KEY) === 'true');
      if (typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!enabled || !departureDate || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dep = new Date(departureDate + 'T00:00:00');
    const diffMs = dep.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / 86400000);

    let notified: string[] = [];
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]');
      notified = isValidNotifiedDates(parsed) ? parsed : [];
    } catch {
      // Silently ignore parse errors
    }

    const notifications: { key: string; message: string }[] = [];
    if (diffDays === 3) notifications.push({ key: `${departureDate}-3d`, message: NOTIFICATION.THREE_DAYS });
    if (diffDays === 1) notifications.push({ key: `${departureDate}-1d`, message: NOTIFICATION.TOMORROW });
    if (diffDays === 0 || todayStr === departureDate) notifications.push({ key: `${departureDate}-0d`, message: NOTIFICATION.TODAY });

    for (const n of notifications) {
      if (!notified.includes(n.key)) {
        new Notification(NOTIFICATION.TITLE, { body: n.message });
        notified.push(n.key);
      }
    }
    try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified)); } catch {
      // Silently ignore storage errors
    }
  }, [enabled, departureDate]);

  const toggleNotifications = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      try { localStorage.setItem(STORAGE_KEY, 'false'); } catch {
        // Silently ignore storage errors
      }
      return;
    }
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return;
    } else if (Notification.permission === 'denied') {
      return;
    }
    setEnabled(true);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {
      // Silently ignore storage errors
    }
  }, [enabled]);

  return { enabled, permission, toggleNotifications };
}
