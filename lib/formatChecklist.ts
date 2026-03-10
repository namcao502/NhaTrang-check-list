import { Category } from "./types";

/**
 * Formats the checklist categories into a human-readable Vietnamese text
 * with category headers (including icons) and item checkmarks.
 */
export function formatChecklistText(categories: Category[]): string {
  return categories
    .map((cat) => {
      const header = cat.icon ? `${cat.icon} ${cat.name}` : cat.name;
      const items = cat.items
        .map((item) => {
          const mark = item.checked ? "\u2705" : "\u2B1C";
          const note = item.note ? ` (${item.note})` : "";
          return `${mark} ${item.label}${note}`;
        })
        .join("\n");
      return `${header}\n${items}`;
    })
    .join("\n\n");
}
