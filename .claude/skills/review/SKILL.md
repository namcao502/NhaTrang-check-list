---
name: review
description: Review code changes on the current branch against this project's requirements and conventions. Use when the user runs /review with an optional branch name or feature description.
---

# Code Review

Review the code changes described in `$ARGUMENTS` against this project's conventions and quality criteria. Do NOT modify any files.

## Project Conventions

Next.js 15 App Router + TypeScript + Tailwind CSS at `C:/TEST/beach-check-list`.

- **TypeScript**: strict mode, no `any`, all props and return types explicit
- **UI text**: all user-facing strings must be in Vietnamese
- **Tailwind**: use project tokens (`ocean-*`, `sand-*`, `coral-*`) — no raw hex colors in className
- **State**: `useChecklist` is the single source of truth — no local state for data that belongs globally
- **Components**: `"use client"` only when the component uses hooks or event handlers
- **Fonts**: `font-playfair` for headings, `font-dm-sans` for body

## Instructions

1. Get the diff against master:
   ```bash
   cd C:/TEST/beach-check-list && git diff master...HEAD
   ```
   If `$ARGUMENTS` contains a branch name, diff against that branch instead.

2. Read any files that need deeper context beyond the diff.

3. Review against these criteria:
   - **Correctness** — does the implementation match the stated requirements?
   - **TypeScript** — no `any`, interfaces updated where needed, strict types throughout
   - **Conventions** — Vietnamese UI text, correct Tailwind tokens, existing component patterns followed
   - **State integrity** — `useChecklist` is the source of truth, localStorage key unchanged
   - **Bugs & edge cases** — logic errors, unhandled inputs, missing null checks
   - **Scope creep** — changes beyond what was asked for

## Output Format

```
## Review: <branch or feature>

### Verdict: PASS / FAIL

### Issues   ← omit section if PASS
| File | Line | Severity | Issue |
|------|------|----------|-------|
| `components/Foo.tsx` | 42 | Error / Warning | Description |

### Notes   ← non-blocking observations
- Any suggestions that don't block a PASS
```

Severity:
- **Error** — must fix before merging (bug, type violation, wrong language, broken state)
- **Warning** — should fix but doesn't block (style inconsistency, minor redundancy)

Only fail on real issues. Don't block for personal style preferences.
