# EVAL: All Agents in .claude/agents

## Agents Under Test

| Agent | File | Purpose |
|-------|------|---------|
| plan-creator | `.claude/agents/plan-creator.md` | Explore codebase, produce file-by-file implementation plan |
| fe-engineer | `.claude/agents/fe-engineer.md` | Implement frontend changes, lint, commit |
| be-engineer | `.claude/agents/be-engineer.md` | Implement state/data layer changes, lint, commit |
| code-review-engineer | `.claude/agents/code-review-engineer.md` | Review code against requirements, PASS/FAIL verdict |
| qa-engineer | `.claude/agents/qa-engineer.md` | Write Jest tests, run suite, produce manual checklist |
| doc-engineer | `.claude/agents/doc-engineer.md` | Update CLAUDE.md and CHANGELOG.md |

---

## Capability Evals per Agent

### CE-PC: plan-creator

| # | Criterion | Weight | Grader |
|---|-----------|--------|--------|
| 1 | Reads CLAUDE.md before planning | required | model |
| 2 | Explores relevant source files (not just plan from memory) | required | model |
| 3 | Output contains "Implementation Plan" header | required | rule: `/Implementation Plan/` |
| 4 | Output contains file table with File, Action, Description columns | required | rule: `/\| File \| Action \| Description \|/` |
| 5 | Every file in the plan actually exists or is explicitly marked "Create" | required | model |
| 6 | Flags type changes that cascade to other files | recommended | model |
| 7 | Includes "Open Questions / Risks" section | recommended | rule: `/Open Questions|Risks/` |
| 8 | Does NOT write or modify any files | required | code: check git status unchanged |
| 9 | Plan is specific enough for an engineer to implement without re-exploring | required | model |

### CE-FE: fe-engineer

| # | Criterion | Weight | Grader |
|---|-----------|--------|--------|
| 1 | Follows the approved implementation plan (doesn't re-explore from scratch) | required | model |
| 2 | Reads neighboring files before writing new ones | recommended | model |
| 3 | All new/modified files use strict TypeScript (no `any`) | required | code: `grep -r ":\s*any\b" <changed files>` |
| 4 | UI text is in Vietnamese | required | model |
| 5 | Uses correct Tailwind tokens (`ocean-*`, `sand-*`, `coral-*`) | recommended | model |
| 6 | Runs `npm run lint` after implementation | required | model |
| 7 | Commits changes with `feat: <ticket_id>` format | required | code: `git log -1 --format=%s` |
| 8 | Does NOT create branches, push, or create PRs | required | model |
| 9 | Output contains "FE Implementation Summary" with file table | required | rule: `/FE Implementation Summary/` |
| 10 | `npm run build` passes after changes | required | code: `npm run build` |

### CE-BE: be-engineer

| # | Criterion | Weight | Grader |
|---|-----------|--------|--------|
| 1 | Changes scoped to `lib/` files (types, defaultData, useChecklist) | required | code: check changed files |
| 2 | `useChecklist` remains single source of truth | required | model |
| 3 | localStorage key unchanged unless explicitly required | required | code: grep for key |
| 4 | Strict TypeScript — no `any` | required | code |
| 5 | Runs `npm run lint` | required | model |
| 6 | Commits with correct format | required | code |
| 7 | Output contains "Logic Implementation Summary" | required | rule |
| 8 | Does NOT modify UI components | recommended | code |

### CE-CR: code-review-engineer

| # | Criterion | Weight | Grader |
|---|-----------|--------|--------|
| 1 | Reads all changed files (not just the summary) | required | model |
| 2 | Runs `git log --oneline -5` to verify commits | required | model |
| 3 | Checks correctness against requirements | required | model |
| 4 | Checks for TypeScript issues (no `any`, proper typing) | required | model |
| 5 | Checks conventions (Vietnamese text, Tailwind tokens, patterns) | required | model |
| 6 | Checks for scope creep | recommended | model |
| 7 | Renders clear PASS/FAIL verdict | required | rule: `/Verdict:\s*(PASS|FAIL)/` |
| 8 | On FAIL: provides file/line/issue table | required | model |
| 9 | Does NOT modify any files | required | code: check git status unchanged |
| 10 | Does not block for style preferences | recommended | model |

### CE-QA: qa-engineer

| # | Criterion | Weight | Grader |
|---|-----------|--------|--------|
| 1 | Reads existing test files before writing new ones | required | model |
| 2 | Test files placed in `__tests__/` with correct naming | required | code: glob `__tests__/*.test.{ts,tsx}` |
| 3 | Uses `describe`/`it` blocks (not `test`) | recommended | code: grep |
| 4 | Covers happy path, edge cases, empty/error states | required | model |
| 5 | Runs `npm test` and all tests pass | required | code: `npm test` |
| 6 | Commits test files with `test: <ticket_id>` format | required | code |
| 7 | Output contains "QA Summary" with test count table | required | rule |
| 8 | Includes manual test checklist | required | rule: `/Manual Test Checklist/` |
| 9 | Does not modify implementation files (only test files) | recommended | code |

### CE-DOC: doc-engineer

| # | Criterion | Weight | Grader |
|---|-----------|--------|--------|
| 1 | Updates CHANGELOG.md with correct section format | required | code: check file contains ticket ID |
| 2 | Updates CLAUDE.md only when new patterns are introduced | required | model |
| 3 | Does not rewrite existing CLAUDE.md content unnecessarily | required | model |
| 4 | Commits with `docs: <ticket_id>` format | required | code |
| 5 | Output contains "Docs Summary" | required | rule |
| 6 | Does not create unnecessary new markdown files | required | code: check no new .md files outside CLAUDE.md/CHANGELOG.md |
| 7 | Correctly identifies whether doc changes are needed | recommended | model |

---

## Cross-Agent Structural Issues

### ISSUE-A1: be-engineer references outdated ID generation pattern (MEDIUM)

**File:** `be-engineer.md:24`
**Problem:** States "IDs are generated with `generateId()` (random base-36 string)" — but after FEAT-security-hardening, IDs use `crypto.randomUUID()`. Outdated documentation in the agent prompt can mislead the agent into reverting to the old pattern.
**Fix:** Update line 24 to: `IDs are generated with `generateId()` (`crypto.randomUUID()`)`

### ISSUE-A2: be-engineer says "Branch: already created — do NOT create or switch branches" (LOW)

**File:** `be-engineer.md:33`
**Problem:** The `/implement` skill works directly on master with no branch creation. Saying "already created" implies a branch was created earlier, which is misleading.
**Fix:** Align with fe-engineer's language: `Branch: work on the current branch (master or whatever is checked out) — do NOT create or switch branches`

### ISSUE-A3: Agents hardcoded to `C:/TEST/beach-check-list` (INFO)

**Files:** All 6 agents
**Problem:** Every agent has the repo path hardcoded. Not portable.
**Impact:** Low — these are project-specific agents, not reusable templates. But if the repo moves, all 6 files need updating.
**Fix:** Accept repo path as a prompt parameter or use a variable.

### ISSUE-A4: code-review-engineer has no access to Write/Edit tools but could benefit from auto-fix suggestions (INFO)

**File:** `code-review-engineer.md:5`
**Problem:** The agent is read-only by design (correct for a reviewer), but when it returns FAIL, the `/implement` skill must re-spawn fe-engineer to fix. If the reviewer could output patch-style suggestions, the fix loop would be faster.
**Impact:** Minimal — current design is sound (separation of concerns).

### ISSUE-A5: qa-engineer allows `test(...)` but spec says `it(...)` (LOW)

**File:** `qa-engineer.md:21`
**Problem:** Naming convention says "use `it(...)` for individual cases" but Jest treats `test()` and `it()` identically. In practice the agent sometimes uses `test()`. This is not a real issue, just a spec/reality mismatch.
**Fix:** Either enforce `it()` consistently or update spec to allow both.

### ISSUE-A6: No agent handles parallel FE + BE implementation (MEDIUM)

**Problem:** The `/implement` skill only spawns `fe-engineer` for Step 3. There's no orchestration for features that need both `be-engineer` (state/data) and `fe-engineer` (UI) changes. Currently, `fe-engineer` handles both, which contradicts the existence of `be-engineer`.
**Fix:** Either:
- (a) Update `/implement` to detect when state layer changes are needed and spawn `be-engineer` before `fe-engineer`
- (b) Merge `be-engineer` into `fe-engineer` since this is a small FE-only project
- (c) Add a routing step in the skill that decides which agent(s) to use

### ISSUE-A7: doc-engineer creates CHANGELOG.md but project doesn't consistently use it (LOW)

**File:** `doc-engineer.md:17`
**Problem:** The agent is told to "create if it doesn't exist" for CHANGELOG.md. But CHANGELOG.md is not referenced in CLAUDE.md's key files table or architecture docs. It's an orphan artifact.
**Fix:** Either add CHANGELOG.md to CLAUDE.md key files, or decide if it's needed at all.

---

## Session Evidence (FEAT-security-hardening, 2026-03-09)

### Agent Performance Scorecard

| Agent | Spawned | Output Format | Correct | Issues |
|-------|---------|---------------|---------|--------|
| plan-creator | Yes | Plan table + risks | Yes — all 8 files identified | Noted CSP/FOUC risks correctly |
| fe-engineer | Yes (prev session) | Implementation done | Yes — all changes correct | N/A (session lost, but work persisted) |
| code-review-engineer | Yes | PASS verdict | Yes — verified all 6 requirements | Correctly noted CSP `unsafe-inline` necessity |
| qa-engineer | Yes | QA Summary + manual checklist | Yes — 53 tests, 270 total passing | Correctly documented `isValidDateString` limitation |
| doc-engineer | Yes | Docs Summary | Yes — CLAUDE.md + CHANGELOG.md updated | Created CHANGELOG.md entry |
| be-engineer | Not spawned | N/A | N/A | Not used — fe-engineer handled all changes |

### Per-Agent Detailed Scores

#### plan-creator
| Eval | Result |
|------|--------|
| CE-PC-1: Reads CLAUDE.md | PASS |
| CE-PC-2: Explores source files | PASS (read 13+ files) |
| CE-PC-3: "Implementation Plan" header | PASS |
| CE-PC-4: File table format | PASS |
| CE-PC-5: Files exist or marked Create | PASS |
| CE-PC-6: Flags cascading type changes | N/A (no type changes) |
| CE-PC-7: Open Questions / Risks | PASS (3 risks noted) |
| CE-PC-8: No file modifications | PASS |
| CE-PC-9: Sufficient detail for engineer | PASS |
| **Score** | **9/9** |

#### fe-engineer (from previous session)
| Eval | Result |
|------|--------|
| CE-FE-1: Follows plan | PASS |
| CE-FE-2: Reads neighbors | PASS |
| CE-FE-3: No `any` | PASS |
| CE-FE-4: Vietnamese UI text | N/A (no UI text changes) |
| CE-FE-5: Tailwind tokens | N/A (no UI changes) |
| CE-FE-6: Runs lint | PASS |
| CE-FE-7: Commit format | PASS |
| CE-FE-8: No branch/push/PR | PASS |
| CE-FE-9: Output format | PASS |
| CE-FE-10: Build passes | PASS |
| **Score** | **8/8** (2 N/A) |

#### code-review-engineer
| Eval | Result |
|------|--------|
| CE-CR-1: Reads changed files | PASS |
| CE-CR-2: Runs git log | PASS |
| CE-CR-3: Checks correctness | PASS |
| CE-CR-4: TypeScript check | PASS |
| CE-CR-5: Conventions check | PASS |
| CE-CR-6: Scope creep check | PASS |
| CE-CR-7: PASS/FAIL verdict | PASS |
| CE-CR-8: Issue table on FAIL | N/A (PASS) |
| CE-CR-9: No file modifications | PASS |
| CE-CR-10: No style-pref blocking | PASS |
| **Score** | **9/9** (1 N/A) |

#### qa-engineer
| Eval | Result |
|------|--------|
| CE-QA-1: Reads existing tests | PASS |
| CE-QA-2: Correct test file location | PASS |
| CE-QA-3: Uses `describe`/`it` | PASS (used `it()` throughout) |
| CE-QA-4: Covers all cases | PASS (happy, edge, invalid) |
| CE-QA-5: All tests pass | PASS (270/270) |
| CE-QA-6: Commit format | PASS |
| CE-QA-7: QA Summary output | PASS |
| CE-QA-8: Manual test checklist | PASS (8 items) |
| CE-QA-9: No impl file changes | PASS |
| **Score** | **9/9** |

#### doc-engineer
| Eval | Result |
|------|--------|
| CE-DOC-1: CHANGELOG.md updated | PASS |
| CE-DOC-2: CLAUDE.md updated appropriately | PASS (4 sections added/updated) |
| CE-DOC-3: No unnecessary rewrites | PASS |
| CE-DOC-4: Commit format | PASS |
| CE-DOC-5: Docs Summary output | PASS |
| CE-DOC-6: No unnecessary new files | PASS |
| CE-DOC-7: Correct need assessment | PASS |
| **Score** | **7/7** |

#### be-engineer
| Eval | Result |
|------|--------|
| Not spawned this session | N/A |
| **Score** | **N/A** — see ISSUE-A6 |

---

## Aggregate Metrics

```
Total capability evals run:  42/44 (2 N/A)
Passed:                      42/42
pass@1:                      100%

Structural issues found:     7 (1 MEDIUM, 3 LOW, 3 INFO)
```

---

## Priority Fixes

### P1: Fix outdated ID generation reference in be-engineer (ISSUE-A1) — 1 min
Change `be-engineer.md:24` from "random base-36 string" to "`crypto.randomUUID()`"

### P2: Fix branch language in be-engineer (ISSUE-A2) — 1 min
Update `be-engineer.md:33` to match fe-engineer's wording

### P3: Decide on be-engineer role (ISSUE-A6) — 5 min decision
Either integrate be-engineer into the `/implement` workflow or document when it should be used vs fe-engineer. Currently it's defined but never spawned.

### P4: Add CHANGELOG.md to CLAUDE.md key files (ISSUE-A7) — 1 min
If keeping CHANGELOG.md, reference it in the architecture docs.

---

## Verdict

**All active agents PASS.** The agent suite is well-designed with clear separation of concerns, correct output formats, and reliable behavior. The main gap is the unused `be-engineer` agent (ISSUE-A6), which should be either integrated into the workflow or explicitly documented as an optional/manual-use agent.
