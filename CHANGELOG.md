# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### FEAT-batch-b — Search filter, must-only filter, hide-checked toggle, category reorder (2026-03-04)

- `components/FilterBar.tsx` — new client component: text search input, "Chi quan trong" must-only toggle, "An da xong" hide-checked toggle; styled as glass-card.
- `lib/useChecklist.ts` — `moveCategory(categoryId, direction: 'up' | 'down')` action to reorder categories in state and localStorage.
- `components/CategorySection.tsx` — accepts `visibleItems: Item[]` prop (pre-filtered list to render) while badge counts still derive from the full `category.items`; optional `onMoveUp` / `onMoveDown` callbacks render ↑/↓ buttons with `stopPropagation`.
- `app/page.tsx` — `searchQuery`, `mustOnly`, `hideChecked` state; `visibleCategories` derivation (all three filters compose simultaneously); `FilterBar` rendered above category list.
