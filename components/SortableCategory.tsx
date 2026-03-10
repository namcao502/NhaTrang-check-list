"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import { createContext, useContext } from "react";

interface DragContextValue {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

const CategoryDragContext = createContext<DragContextValue | null>(null);

export function useCategoryDrag(): DragContextValue | null {
  return useContext(CategoryDragContext);
}

interface Props {
  id: string;
  children: React.ReactNode;
}

export default function SortableCategory({ id, children }: Props) {
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
    <CategoryDragContext.Provider value={{ listeners, attributes }}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </CategoryDragContext.Provider>
  );
}
