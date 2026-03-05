"use client";

import { useState } from "react";
import { useCountdown } from "@/lib/useCountdown";
import { useNotifications } from "@/lib/useNotifications";

export default function CountdownBanner() {
  const { departureDate, timeLeft, isPast, setDeparture, clearDeparture } = useCountdown();
  const { enabled: notifEnabled, permission, toggleNotifications } = useNotifications(departureDate);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  function handleOpen() {
    setInputValue(departureDate ?? "");
    setEditing(true);
  }

  function handleConfirm() {
    if (inputValue) {
      setDeparture(inputValue);
    }
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  function handleClear() {
    clearDeparture();
    setEditing(false);
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isPastInput = editing && inputValue !== '' && inputValue < todayStr;

  if (editing) {
    return (
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <input
            type="date"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`rounded-xl border bg-white/80 dark:bg-slate-700/80 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 transition ${
              isPastInput
                ? "border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-500"
                : "border-ocean-300 dark:border-ocean-600 focus:ring-ocean-300 dark:focus:ring-ocean-500"
            }`}
          />
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-ocean-600 text-white text-sm font-medium px-3 py-1.5 hover:bg-ocean-700 transition"
          >
            Xác nhận
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-slate-700/70 text-gray-500 dark:text-gray-400 text-sm px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-600 transition"
          >
            Huỷ
          </button>
        </div>
        {isPastInput && (
          <span className="text-xs text-red-500 dark:text-red-400 font-medium">
            ⚠️ Ngày đã qua
          </span>
        )}
      </div>
    );
  }

  // No departure date set (timeLeft is null and not past)
  if (!departureDate) {
    return (
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={handleOpen}
          className="rounded-full bg-ocean-100 text-ocean-700 dark:bg-ocean-700/40 dark:text-ocean-300 text-sm font-medium px-4 py-1.5 hover:bg-ocean-200 dark:hover:bg-ocean-700/60 transition"
        >
          Đặt ngày đi
        </button>
      </div>
    );
  }

  let message: string;
  if (isPast) {
    message = "Chuyến đi đã qua rồi!";
  } else if (timeLeft && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    message = "🎉 Hôm nay là ngày đi!";
  } else if (timeLeft) {
    message = `✈️ Còn ${timeLeft.days} ngày · ${timeLeft.hours} giờ · ${timeLeft.minutes} phút · ${timeLeft.seconds} giây`;
  } else {
    // Fallback while loading (departureDate set but timeLeft not yet computed)
    message = "...";
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
      <span className="rounded-full bg-ocean-100 text-ocean-700 dark:bg-ocean-700/40 dark:text-ocean-300 text-sm font-medium px-4 py-1.5">
        {message}
      </span>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-slate-700/70 text-sm text-ocean-600 dark:text-ocean-400 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      >
        Thay đổi
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-slate-700/70 text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      >
        Xoá
      </button>
      <button
        type="button"
        onClick={toggleNotifications}
        disabled={permission === 'denied'}
        className={`rounded-lg border text-sm px-3 py-1.5 transition-colors ${
          notifEnabled
            ? 'border-ocean-300 dark:border-ocean-600 bg-ocean-50 dark:bg-ocean-700/40 text-ocean-600 dark:text-ocean-300'
            : 'border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-slate-700/70 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {notifEnabled ? 'Nhắc nhở: Bật' : 'Nhắc nhở'}
      </button>
    </div>
  );
}
