---
name: debug
description: Investigate and fix bugs in the beach checklist app. Use when the user reports a bug, describes unexpected behavior, or says something is broken. Also triggers for error messages, console errors, or "X doesn't work" reports.
---

# Debug

Investigate and fix a bug described in `$ARGUMENTS`.

## Project

Next.js 15 App Router + TypeScript + Tailwind CSS at `C:/TEST/beach-check-list`.

Key files:
- `lib/useChecklist.ts` — all state logic + localStorage persistence
- `lib/types.ts` — `Item` and `Category` interfaces
- `lib/validation.ts` — runtime type guards for localStorage data
- `app/page.tsx` — root page, filter logic
- `components/` — UI components

## Workflow

### Step 1: Reproduce & Understand

1. Read the bug description carefully. Extract:
   - **What happens** (actual behavior)
   - **What should happen** (expected behavior)
   - **Steps to reproduce** (if provided)
2. Identify which files are likely involved based on the symptom.

### Step 2: Investigate

1. Read the suspected files. Trace the data flow from state to UI.
2. Check for common issues in this project:
   - localStorage parse/validation failures (`lib/validation.ts`)
   - Filter logic bugs in `app/page.tsx` (`searchQuery`, `mustOnly`, `hideChecked`)
   - State mutation instead of immutable update in `useChecklist.ts`
   - Missing `dark:` variant in Tailwind classes
   - Inline edit `cancelRef` race condition (Escape/blur)
   - `useEffect` dependency array issues
3. Run lint and tests to see if there are existing failures:
   ```bash
   cd C:/TEST/beach-check-list && npm run lint && npm test
   ```

### Step 3: Fix

1. Apply the minimal fix. Don't refactor surrounding code.
2. If the fix touches `useChecklist.ts`, verify immutability patterns are maintained.
3. If the fix touches localStorage, ensure validation guards are in place.
4. Run lint and tests again to confirm the fix doesn't break anything.

### Step 4: Verify

1. Describe exactly what was wrong and why.
2. Explain the fix and why it resolves the issue.
3. List any edge cases the user should manually test.

## Output

```
## Bug Fix: <short description>

### Root Cause
<What was wrong and why>

### Fix
| File | Line | Change |
|------|------|--------|
| `<file>` | <line> | <description> |

### Verification
- Lint: PASS / FAIL
- Tests: PASS / FAIL
- Manual check: <what to verify in browser>
```
