# Changelog

All notable changes to this project will be documented in this file.

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
