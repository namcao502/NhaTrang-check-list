# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
npm test          # Run Jest test suite
```

## Architecture

**Next.js 15 App Router + TypeScript + Tailwind CSS**

All state lives client-side; there is no backend or API layer.

### Key files

| Path | Purpose |
|------|---------|
| `lib/types.ts` | `Item` and `Category` interfaces |
| `lib/defaultData.ts` | Pre-populated beach checklist items grouped by category |
| `lib/useChecklist.ts` | Custom hook — all state logic + localStorage persistence |
| `app/page.tsx` | Root page, composes all components |
| `components/CategorySection.tsx` | Collapsible category (chevron-only trigger) with inline category rename, bulk-toggle button, item list, and add-item form |
| `components/ChecklistItem.tsx` | Single item row with checkbox, inline label rename, inline note editor, and delete button |
| `components/AddItemForm.tsx` | Inline form inside a category to add new items |
| `components/AddCategoryForm.tsx` | Button/form to append a new category |
| `components/ChecklistStats.tsx` | Progress bar + packed count + reset button |
| `components/FilterBar.tsx` | Search input + "Chi quan trong" must-only toggle + "An da xong" hide-checked toggle (glass-card, `'use client'`) |
| `components/ThemeToggle.tsx` | Dark mode toggle — reads/writes `"beach-dark-mode"` localStorage, toggles `dark` class on `<html>` |
| `components/ExportButton.tsx` | Clipboard copy + Web Share API "Chia se" button (feature-detected at mount) |

### State shape

```ts
Category[]  // stored in localStorage under "beach-checklist"
  Category { id, name, items: Item[], icon?: string }
    Item    { id, label, checked, note?: string, tag?: 'must' | 'opt' }
```

Default data (`lib/defaultData.ts`) contains 9 Vietnamese Nha Trang categories:
`Đồ Bơi & Lặn`, `Trang Phục`, `Giày Dép`, `Vệ Sinh Cá Nhân`, `Chống Nắng & Biển`, `Thuốc & Sức Khoẻ`, `Điện Tử & Tiện Ích`, `Giấy Tờ & Tài Chính`, `Đồ Lặt Vặt Tiện Ích`.

`useChecklist` exposes: `toggleItem`, `addItem`, `removeItem`, `addCategory`, `removeCategory`, `resetAll`, `renameItem`, `updateNote`, `renameCategory`, `bulkToggleCategory`, `moveCategory(id, 'up'|'down')`, `undo`, `canUndo`, plus derived `totalItems` / `checkedItems`.

### Filter / visibility pattern

Filter state (`searchQuery`, `mustOnly`, `hideChecked`) lives in `app/page.tsx` and is derived into a `visibleCategories` array before rendering. Each `CategorySection` receives:

- `visibleItems: Item[]` — the already-filtered subset to render (never the raw `category.items`).
- `category.items` is still used inside the component for badge counts so totals remain accurate regardless of active filters.
- Categories whose `visibleItems` is empty are omitted from the rendered list entirely.
- All three filters compose simultaneously (search AND must-only AND hide-checked).

### localStorage keys

| Key | Shape | Purpose |
|-----|-------|---------|
| `"beach-checklist"` | `Category[]` | Main checklist state |
| `"beach-collapse-state"` | `Record<string, boolean>` | Per-category collapsed/expanded state |
| `"beach-dark-mode"` | `"true" \| "false"` | Dark mode preference |

### Dark mode pattern

Tailwind is configured with `darkMode: "class"`. The `ThemeToggle` component toggles the `dark` class on `document.documentElement` and persists the choice in `"beach-dark-mode"` localStorage.

To prevent a flash of unstyled content (FOUC), `app/layout.tsx` includes a blocking `<script>` in `<head>` that reads `"beach-dark-mode"` and applies the `dark` class before first paint. The `<html>` tag has `suppressHydrationWarning` to avoid a React mismatch when the server-rendered class differs from the client.

When adding dark variants to new components, follow the existing convention: pair each light style with a `dark:` variant (e.g., `text-gray-800 dark:text-gray-100`, `bg-white/70 dark:bg-slate-700`).

### Tailwind theme

Custom colors defined in `tailwind.config.ts`:
- `ocean-*` — blues for interactive elements
- `sand-*` — warm yellows for accents
- `coral-*` — orange tones for `must` tag badges and accents

Font families (CSS vars loaded in `app/layout.tsx`):
- `font-playfair` — `var(--font-playfair)`, serif, used for headings
- `font-dm-sans` — `var(--font-dm-sans)`, sans-serif, used for body text

### Inline editing pattern (cancelRef)

Inline edit fields (item label, item note, category name) use a `cancelRef` boolean ref to resolve the Escape/blur race condition:

```ts
const cancelRef = useRef(false);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') { cancelRef.current = true; /* revert */ }
  if (e.key === 'Enter')  { /* save */ }
};

const handleBlur = () => {
  if (cancelRef.current) { cancelRef.current = false; return; }
  /* save */
};
```

Setting `cancelRef.current = true` before the synthetic blur fires prevents the blur handler from saving a value that was intentionally cancelled. Apply this pattern to any future inline edit field.
