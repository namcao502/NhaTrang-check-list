"use client";

import { useState } from "react";
import { useCountdown } from "@/lib/useCountdown";

export default function CountdownBanner() {
  const { departureDate, daysLeft, setDeparture, clearDeparture } = useCountdown();
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

  if (editing) {
    return (
      <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="rounded-xl border border-ocean-300 dark:border-ocean-600 bg-white/80 dark:bg-slate-700/80 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-ocean-300 dark:focus:ring-ocean-500 transition"
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
    );
  }

  if (daysLeft === null) {
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
  if (daysLeft > 0) {
    message = `✈️ Còn ${daysLeft} ngày nữa là đi!`;
  } else if (daysLeft === 0) {
    message = "🎉 Hôm nay là ngày đi!";
  } else {
    message = "Chuyến đi đã qua rồi!";
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
      <span className="rounded-full bg-ocean-100 text-ocean-700 dark:bg-ocean-700/40 dark:text-ocean-300 text-sm font-medium px-4 py-1.5">
        {message}
      </span>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs text-ocean-600 dark:text-ocean-400 underline underline-offset-2 hover:text-ocean-700 dark:hover:text-ocean-300 transition"
      >
        Thay đổi
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="text-xs text-gray-400 dark:text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        Xoá
      </button>
    </div>
  );
}
