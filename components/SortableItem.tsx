"use client";

import { createContext, useContext } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";

interface DragContextValue {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

const ItemDragContext = createContext<DragContextValue | null>(null);

export function useItemDrag(): DragContextValue | null {
  return useContext(ItemDragContext);
}

interface Props {
  id: string;
  children: React.ReactNode;
}

export default function SortableItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ItemDragContext.Provider value={{ listeners, attributes }}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </ItemDragContext.Provider>
  );
}
