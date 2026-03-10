"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from "./DragHandle";

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
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <div className="mt-5">
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
