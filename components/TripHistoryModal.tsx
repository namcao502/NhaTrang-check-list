"use client";

import { useState } from "react";
import type { ArchivedTrip } from "@/lib/types";
import { HISTORY, COMMON } from "@/lib/constants";

interface Props {
  trips: ArchivedTrip[];
  onDeleteTrip: (id: string) => void;
  onClose: () => void;
}

export default function TripHistoryModal({
  trips,
  onDeleteTrip,
  onClose,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 dark:border-slate-600/50 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold font-playfair text-gray-900 dark:text-gray-100 mb-4">
          {HISTORY.TITLE}
        </h2>

        {trips.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            {HISTORY.EMPTY}
          </p>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const isExpanded = expandedId === trip.id;
              const percent =
                trip.totalCount === 0
                  ? 0
                  : Math.round(
                      (trip.checkedCount / trip.totalCount) * 100
                    );

              return (
                <div
                  key={trip.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                >
                  {/* Trip header */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : trip.id)
                    }
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {trip.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(trip.date)} — {trip.checkedCount}/
                        {trip.totalCount} ({percent}%)
                      </p>
                    </div>
                    <span
                      className={`text-gray-400 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      ▶
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700">
                      {trip.categories.map((cat) => (
                        <div key={cat.id} className="mt-3">
                          <p className="text-sm font-medium text-ocean-700 dark:text-ocean-400 mb-1">
                            {cat.icon ? `${cat.icon} ` : ""}
                            {cat.name}
                          </p>
                          <ul className="space-y-0.5">
                            {cat.items.map((item) => (
                              <li
                                key={item.id}
                                className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2"
                              >
                                <span
                                  className={
                                    item.checked
                                      ? "text-green-500"
                                      : "text-gray-300 dark:text-gray-600"
                                  }
                                >
                                  {item.checked ? "✓" : "○"}
                                </span>
                                <span
                                  className={
                                    item.checked
                                      ? "line-through text-gray-400 dark:text-gray-500"
                                      : ""
                                  }
                                >
                                  {item.label}
                                  {item.quantity && item.quantity > 1
                                    ? ` (x${item.quantity})`
                                    : ""}
                                </span>
                                {item.tag === "must" && (
                                  <span className="text-xs bg-coral-100 text-coral-600 dark:bg-coral-600/30 dark:text-coral-400 px-1.5 py-0.5 rounded">
                                    quan trọng
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => onDeleteTrip(trip.id)}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          {HISTORY.DELETE_TRIP}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {COMMON.CLOSE}
          </button>
        </div>
      </div>
    </div>
  );
}
