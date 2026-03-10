---
name: test
description: Write or update Jest tests for the beach checklist app. Use when the user wants to add tests, improve test coverage, fix failing tests, or run the test suite. Triggers for "write tests for X", "test coverage", "fix failing test", or "run tests".
---

# Test

Write or update tests as described in `$ARGUMENTS`.

## Project

Next.js 15 App Router + TypeScript + Jest + React Testing Library at `C:/TEST/beach-check-list`.

Test conventions:
- Test files: `__tests__/<Subject>.test.tsx` or `__tests__/<Subject>.test.ts`
- Framework: Jest + `@testing-library/react` + `@testing-library/user-event`
- Hook tests: `renderHook` from `@testing-library/react`
- Group with `describe`, individual cases with `it`
- Mock localStorage via `localStorageMock` in `jest.setup.ts`
- Naming: `<component/hook> — <scenario> › <expected result>`

## Workflow

### Step 1: Understand Scope

Parse `$ARGUMENTS` to determine what to test:
- **Specific file**: "write tests for ChecklistItem" → test that component
- **Coverage gap**: "improve coverage" → find untested code
- **Fix tests**: "fix failing tests" → diagnose and fix
- **Run tests**: "run tests" → just execute the suite

### Step 2: Read Existing Tests

```bash
cd C:/TEST/beach-check-list && ls __tests__/
```

Read relevant existing test files to match patterns and avoid duplication.

### Step 3: Write Tests

Follow TDD conventions:
1. **Happy path** — normal expected behavior
2. **Edge cases** — empty arrays, long strings, special characters
3. **Error states** — invalid input, missing data
4. **Integration** — components interacting with `useChecklist`

For each test:
- Use descriptive names that read as sentences
- One assertion per test when possible
- Mock only what's necessary (localStorage, not internal functions)
- Test behavior, not implementation details

### Step 4: Run & Verify

```bash
cd C:/TEST/beach-check-list && npm test
```

Fix any failures. If pre-existing tests break, investigate whether the test or the code is wrong.

### Step 5: Coverage Check

```bash
cd C:/TEST/beach-check-list && npm test -- --coverage --coverageReporters=text
```

Report coverage for the affected files. Target: 80%+.

## Output

```
## Test Summary

### Tests Written
| File | Tests | Coverage |
|------|-------|----------|
| `__tests__/<file>.test.tsx` | N tests | N% |

### Test Run
- Total: N passed, N failed
- Coverage: N% (target: 80%)

### Uncovered Areas
- <what's still not tested, if anything>
```
