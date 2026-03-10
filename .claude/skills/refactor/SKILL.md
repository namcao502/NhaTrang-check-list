---
name: refactor
description: Refactor code in the beach checklist app for better readability, maintainability, or performance. Use when the user wants to clean up code, extract components, reduce duplication, simplify logic, or improve file organization. Does NOT add new features.
---

# Refactor

Refactor the code described in `$ARGUMENTS`. No new features — only improve structure, readability, or performance.

## Project

Next.js 15 App Router + TypeScript + Tailwind CSS at `C:/TEST/beach-check-list`.

Conventions to maintain:
- Strict TypeScript — no `any`
- Immutable state updates in `useChecklist.ts`
- `useChecklist` as single source of truth
- Vietnamese UI text
- Tailwind tokens: `ocean-*`, `sand-*`, `coral-*`
- Files under 800 lines, functions under 50 lines

## Workflow

### Step 1: Analyze

1. Read the files targeted for refactoring.
2. Identify the specific issues:
   - Duplicated logic across components
   - Functions too long (>50 lines)
   - Files too large (>800 lines)
   - Deep nesting (>4 levels)
   - Hardcoded values that should be constants
   - State logic that belongs in `useChecklist.ts` instead of components

### Step 2: Plan

Present a refactoring plan before making changes:

```
## Refactor Plan

| File | Issue | Proposed Change |
|------|-------|-----------------|
| `<file>` | <issue> | <what to do> |
```

Wait for user confirmation unless the refactor is trivial (single file, <10 lines changed).

### Step 3: Execute

1. Apply changes incrementally — one logical change per step.
2. After each change, verify lint passes:
   ```bash
   cd C:/TEST/beach-check-list && npm run lint
   ```
3. Run tests after all changes:
   ```bash
   cd C:/TEST/beach-check-list && npm test
   ```

### Step 4: Summary

```
## Refactor Summary

| File | Before | After | Change |
|------|--------|-------|--------|
| `<file>` | <lines/issue> | <lines/improvement> | <description> |

Lint: PASS / FAIL
Tests: PASS / FAIL
```

## Rules

- Do NOT add new features or change behavior.
- Do NOT rename localStorage keys.
- Do NOT change the public API of `useChecklist`.
- Preserve all existing test expectations.
- If a refactor would require updating tests, list the test changes separately.
