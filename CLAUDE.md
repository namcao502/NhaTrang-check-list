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
| `components/CategorySection.tsx` | Collapsible category with its item list and add-item form |
| `components/ChecklistItem.tsx` | Single item row with checkbox and delete button |
| `components/AddItemForm.tsx` | Inline form inside a category to add new items |
| `components/AddCategoryForm.tsx` | Button/form to append a new category |
| `components/ChecklistStats.tsx` | Progress bar + packed count + reset button |
| `components/FilterBar.tsx` | Search input + "Chi quan trong" must-only toggle + "An da xong" hide-checked toggle (glass-card, `'use client'`) |

### State shape

```ts
Category[]  // stored in localStorage under "beach-checklist"
  Category { id, name, items: Item[], icon?: string }
    Item    { id, label, checked, note?: string, tag?: 'must' | 'opt' }
```

Default data (`lib/defaultData.ts`) contains 9 Vietnamese Nha Trang categories:
`Đồ Bơi & Lặn`, `Trang Phục`, `Giày Dép`, `Vệ Sinh Cá Nhân`, `Chống Nắng & Biển`, `Thuốc & Sức Khoẻ`, `Điện Tử & Tiện Ích`, `Giấy Tờ & Tài Chính`, `Đồ Lặt Vặt Tiện Ích`.

`useChecklist` exposes: `toggleItem`, `addItem`, `removeItem`, `addCategory`, `resetAll`, `moveCategory(id, 'up'|'down')`, plus derived `totalItems` / `checkedItems`.

### Filter / visibility pattern

Filter state (`searchQuery`, `mustOnly`, `hideChecked`) lives in `app/page.tsx` and is derived into a `visibleCategories` array before rendering. Each `CategorySection` receives:

- `visibleItems: Item[]` — the already-filtered subset to render (never the raw `category.items`).
- `category.items` is still used inside the component for badge counts so totals remain accurate regardless of active filters.
- Categories whose `visibleItems` is empty are omitted from the rendered list entirely.
- All three filters compose simultaneously (search AND must-only AND hide-checked).

### Tailwind theme

Custom colors defined in `tailwind.config.ts`:
- `ocean-*` — blues for interactive elements
- `sand-*` — warm yellows for accents
- `coral-*` — orange tones for `must` tag badges and accents

Font families (CSS vars loaded in `app/layout.tsx`):
- `font-playfair` — `var(--font-playfair)`, serif, used for headings
- `font-dm-sans` — `var(--font-dm-sans)`, sans-serif, used for body text
