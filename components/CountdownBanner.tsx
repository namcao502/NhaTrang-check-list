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
          className="rounded-xl border border-ocean-300 bg-white/80 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-ocean-300 transition"
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
          className="rounded-full border border-gray-200 bg-white/70 text-gray-500 text-sm px-3 py-1.5 hover:bg-gray-50 transition"
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
          className="rounded-full bg-ocean-100 text-ocean-700 text-sm font-medium px-4 py-1.5 hover:bg-ocean-200 transition"
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
      <span className="rounded-full bg-ocean-100 text-ocean-700 text-sm font-medium px-4 py-1.5">
        {message}
      </span>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs text-ocean-600 underline underline-offset-2 hover:text-ocean-700 transition"
      >
        Thay đổi
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition"
      >
        Xoá
      </button>
    </div>
  );
}
