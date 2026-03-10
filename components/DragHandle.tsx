"use client";

import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import { ITEM } from "@/lib/constants";

interface Props {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

export default function DragHandle({ listeners, attributes }: Props) {
  return (
    <button
      type="button"
      className="print-hide flex-shrink-0 cursor-grab active:cursor-grabbing touch-none p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-white/10 transition-colors"
      aria-label={ITEM.DRAG_ARIA}
      {...attributes}
      {...listeners}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </button>
  );
}
