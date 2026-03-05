# Changelog

All notable changes to this project will be documented in this file.

## [FEAT-remove-buttons] - 2026-03-05
### Removed
- Removed 4 action buttons from the UI: "Sao chep danh sach" (copy), "Chia se" (share), "Mau chuyen di" (template manager), "In danh sach" (print).
- Deleted `components/ExportButton.tsx`, `components/PrintButton.tsx`, `components/TemplateManager.tsx`, `lib/useTemplates.ts`, `__tests__/ExportButton.test.tsx`, `e2e/export.spec.ts`.
- Cleaned up unused imports and destructured values from `app/page.tsx`.

---

## [FEAT-fireworks] - 2026-03-05
### Added
- `components/AmbientFireworks.tsx` — continuous ambient firework animation using `canvas-confetti`. A full-screen fixed canvas fires 15-30 theme-colored particles every 3 seconds at random positions. Non-interactive (`pointer-events: none`), respects `prefers-reduced-motion`, works in both light and dark mode.
- `app/page.tsx` — renders `<AmbientFireworks />` as the first child for a background decorative effect.

---

## [FEAT-remove-qty] - 2026-03-05
### Removed
- Removed `qty?: number` field from `Item` interface, `updateQty` action from `useChecklist`, and all quantity UI across 8 files.

---

## [FEAT-batch-d] - 2026-03-04
### Added
- **Delete category** — `removeCategory` action in `useChecklist`; delete button (`x`) in `CategorySection` header with `window.confirm` guard.
- **Collapse memory** — category collapsed/expanded state persisted per category in localStorage under `"beach-collapse-state"` (`Record<string, boolean>`).
- **Web Share API** — `ExportButton` detects `navigator.share` at mount; shows a "Chia se" button alongside the existing clipboard-copy button. Falls back to clipboard on share failure/cancel.
- **Dark mode** — `darkMode: "class"` in Tailwind config; new `ThemeToggle` component reads/writes `"beach-dark-mode"` localStorage and toggles the `dark` class on `<html>`. A blocking `<script>` in `layout.tsx` prevents FOUC. All components received `dark:` variant classes.

### Changed
- `useChecklist` now exports `removeCategory` (total exports: `toggleItem`, `addItem`, `removeItem`, `addCategory`, `removeCategory`, `renameItem`, `updateNote`, `renameCategory`, `bulkToggleCategory`, `resetAll`, `moveCategory`, `undo`, `canUndo`).
- `CategorySection` accepts new `onRemoveCategory` prop.
- `app/layout.tsx` adds `suppressHydrationWarning` on `<html>` and a blocking dark-mode script in `<head>`.
- Test suite expanded with 37 new tests across 4 test files (useChecklist, CategorySection, ThemeToggle, ExportButton).

---

## [Unreleased]

### Added

#### FEAT-batch-b — Search filter, must-only filter, hide-checked toggle, category reorder (2026-03-04)

- `components/FilterBar.tsx` — new client component: text search input, "Chỉ quan trọng" must-only toggle, "Ẩn đã xong" hide-checked toggle; styled as glass-card.
- `lib/useChecklist.ts` — `moveCategory(categoryId, direction: 'up' | 'down')` action to reorder categories in state and localStorage.
- `components/CategorySection.tsx` — accepts `visibleItems: Item[]` prop (pre-filtered list to render) while badge counts still derive from the full `category.items`; optional `onMoveUp` / `onMoveDown` callbacks render ↑/↓ buttons with `stopPropagation`.
- `app/page.tsx` — `searchQuery`, `mustOnly`, `hideChecked` state; `visibleCategories` derivation (all three filters compose simultaneously); `FilterBar` rendered above category list.

## [FEAT-batch-a] — 2026-03-04

### Added
- **Item note editor** — click the note text or "+" icon to edit inline; save on blur/Enter, cancel on Escape.
- **Item rename** — click the item label to edit inline; save on blur/Enter, cancel on Escape; empty input reverts to the previous label.
- **Category rename** — click the category name to edit inline with the same save/cancel behaviour.
- **Bulk check per category** — "Chon tat ca" / "Bo chon tat ca" toggle button in each category header.

### Changed
- `useChecklist` hook now exports four additional mutations: `renameItem`, `updateNote`, `renameCategory`, `bulkToggleCategory`.
- `CategorySection` header refactored: collapse is now triggered only by the right-side chevron area; the category name area triggers inline rename instead.
- Test suite expanded from 78 to 122 passing tests.

---

## [NHATRANG-001] — 2026-03-04

### Summary
Redesigned the beach checklist app into a Nha Trang trip packing list with a new ocean-themed UI, Vietnamese content, and an automated test suite.

---

### New Features
- **Animated wave bar** — fixed gradient bar at the top of the page (yellow → coral → blue, looping)
- **Nha Trang header** — trip badge, Playfair Display heading, subtitle with beach/Vinwonders/Safari emojis
- **Tag badges** — coral "Quan trọng" for required items, purple "Nên có" for optional items
- **Item notes** — grey subtitle text beneath each item label
- **Celebration banner** — appears when all items are checked ("Đã chuẩn bị xong!")
- **Glassmorphism cards** — category cards with `backdrop-filter: blur` and semi-transparent white background
- **Yellow-to-coral progress bar** — replaces the previous solid-colour fill

---

### Data Changes
Replaced 4 generic English categories (20 items) with **9 Vietnamese Nha Trang categories (50 items)**:

| # | Icon | Category |
|---|------|----------|
| 1 | 🏊 | Đồ Bơi & Lặn |
| 2 | 👗 | Trang Phục |
| 3 | 👟 | Giày Dép |
| 4 | 🧴 | Vệ Sinh Cá Nhân |
| 5 | ☀️ | Chống Nắng & Biển |
| 6 | 💊 | Thuốc & Sức Khoẻ |
| 7 | 📱 | Điện Tử & Tiện Ích |
| 8 | 💳 | Giấy Tờ & Tài Chính |
| 9 | 🎒 | Đồ Lặt Vặt Tiện Ích |

---

### Type Changes (`lib/types.ts`)
```ts
// Before
interface Item { id, label, checked }
interface Category { id, name, items }

// After
interface Item { id, label, checked, note?: string, tag?: 'must' | 'opt' }
interface Category { id, name, items, icon?: string }
```
All new fields are **optional** — existing localStorage data remains compatible.

---

### Styling (`tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`)
- Added `coral-*` color palette (`#fff3e0`, `#f77f00`, `#e65c00`)
- Added `font-playfair` and `font-dm-sans` Tailwind utilities (Google Fonts via `next/font`)
- Added `wave-shift` keyframe animation
- Body background: `linear-gradient(160deg, #caf0f8 0%, #90e0ef 30%, #0077b6 100%)`
- Added `.glass-card` CSS utility class

---

### Files Changed
| File | Change |
|------|--------|
| `lib/types.ts` | Added `note?`, `tag?` to `Item`; `icon?` to `Category` |
| `lib/defaultData.ts` | Replaced with 9 Nha Trang categories |
| `tailwind.config.ts` | Added coral colors, font families, wave-shift animation |
| `app/globals.css` | Ocean gradient body, `.glass-card` utility |
| `app/layout.tsx` | Playfair Display + DM Sans fonts, `lang="vi"`, updated metadata |
| `app/page.tsx` | Wave bar, new header, celebration banner |
| `components/CategorySection.tsx` | Icon display, glassmorphism styles, count badge, note/tag passthrough |
| `components/ChecklistItem.tsx` | Note subtitle, tag badges, checked bg |
| `components/ChecklistStats.tsx` | Yellow-to-coral gradient fill |

---

### Infrastructure
| File | Description |
|------|-------------|
| `eslint.config.mjs` | ESLint 9 flat config (Next.js + TypeScript rules) |
| `jest.config.ts` | Jest 30 with ts-jest, jsdom, `@/` path alias |
| `jest.setup.ts` | `@testing-library/jest-dom` setup |
| `__tests__/types.test.ts` | 9 type compatibility tests |
| `__tests__/defaultData.test.ts` | 10 data integrity tests |
| `__tests__/useChecklist.test.ts` | 27 hook behaviour tests |
| `__tests__/ChecklistItem.test.tsx` | 15 component render tests |
| `__tests__/CategorySection.test.tsx` | 17 component render + interaction tests |

**Test result: 78 passed, 0 failed**

---

### Commits
| Hash | Message |
|------|---------|
| `1f91af5` | feat: implement Nha Trang packing list redesign (NHATRANG-001) |
| `a2e41e8` | docs: NHATRANG-001 update CLAUDE.md for Nha Trang redesign |
