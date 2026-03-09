# EVAL: implement skill

## Skill Under Test

`.claude/skills/implement/SKILL.md` — 7-step development workflow pipeline.

## Eval Type

Capability + Regression (hybrid). Evaluates both structural compliance (does the skill follow its own spec?) and output quality (does the implementation actually work?).

---

## Capability Evals

### CE-1: Step 1 — Requirements Parsing

**What to check:** Skill produces a summary table with all required fields.

```bash
# Grader: code (check session output contains table structure)
# PASS if output contains: Feature ID, Title, Scope, Requirements, Acceptance Criteria, Constraints
# PASS if Feature ID matches FEAT-<kebab-case> pattern
# PASS if Scope = "FE-only"
```

| Criterion | Weight | Notes |
|-----------|--------|-------|
| Summary table rendered | required | Must contain all 6 fields |
| Feature ID is FEAT-kebab-case | required | e.g. `FEAT-security-hardening` |
| Requirements are bullet points | required | Not a wall of text |
| Acceptance criteria are testable | recommended | Should be verifiable |
| Constraints include Vietnamese UI, strict TS | required | Per skill spec |
| Auto-proceeds to Step 2 | required | No user gate here |

### CE-2: Step 2 — Implementation Plan

**What to check:** `plan-creator` agent spawned, plan displayed, gate shown.

| Criterion | Weight | Notes |
|-----------|--------|-------|
| `plan-creator` agent spawned | required | Not inline planning |
| Plan lists specific files to change | required | File-by-file breakdown |
| Gate message displayed | required | "Reply 'next' to start..." |
| Waits for user before Step 3 | required | Only gate in workflow |
| Handles user corrections | recommended | Re-spawns planner with feedback |

### CE-3: Step 3 — Implementation

**What to check:** `fe-engineer` agent spawned with correct context, code changes are functional.

| Criterion | Weight | Notes |
|-----------|--------|-------|
| `fe-engineer` agent spawned | required | Not inline implementation |
| Agent receives requirements + plan | required | Full context passed |
| Branch = master (no branch creation) | required | Per skill spec |
| Code changes match plan | required | All planned files touched |
| Auto-proceeds to Step 4 | required | No user gate |

### CE-4: Step 4 — Code Review

**What to check:** `code-review-engineer` agent spawned, PASS/FAIL verdict rendered.

| Criterion | Weight | Notes |
|-----------|--------|-------|
| `code-review-engineer` agent spawned | required | Not self-review |
| Requirements + acceptance criteria passed | required | Full context |
| PASS/FAIL verdict rendered | required | Clear outcome |
| On FAIL: re-spawns fe-engineer | required | Fix loop up to 3 rounds |
| Auto-proceeds to Step 5 on PASS | required | No user gate |

### CE-5: Step 5 — Tests

**What to check:** `qa-engineer` agent spawned, tests written and passing.

| Criterion | Weight | Notes |
|-----------|--------|-------|
| `qa-engineer` agent spawned | required | Not inline test writing |
| New test file(s) created | required | At least 1 test file |
| Tests pass (`npm test`) | required | 0 failures |
| Manual test checklist provided | recommended | For non-automatable scenarios |
| Auto-proceeds to Step 6 | required | No user gate |

### CE-6: Step 6 — Documentation

**What to check:** `doc-engineer` agent spawned, docs updated.

| Criterion | Weight | Notes |
|-----------|--------|-------|
| `doc-engineer` agent spawned | required | Not inline doc editing |
| CLAUDE.md updated if architecture changed | required | Key files table, patterns |
| No unnecessary new .md files created | recommended | Prefer editing existing |
| Auto-proceeds to Step 7 | required | No user gate |

### CE-7: Step 7 — Self-Review

**What to check:** Lint + tests run, structured report output, final summary table.

| Criterion | Weight | Notes |
|-----------|--------|-------|
| `npm run lint` executed | required | Result reported |
| `npm test` executed | required | Result reported |
| `git log` / `git diff` executed | required | Files listed |
| Acceptance criteria checklist rendered | required | [x] / [ ] format |
| READY / NEEDS ATTENTION verdict | required | Clear outcome |
| Final summary table rendered | required | All 7 steps with status |

---

## Regression Evals

### RE-1: Build Integrity

```bash
cd C:/TEST/beach-check-list && npm run build && echo "PASS" || echo "FAIL"
```

### RE-2: Test Suite

```bash
cd C:/TEST/beach-check-list && npm test && echo "PASS" || echo "FAIL"
```

### RE-3: Lint Clean

```bash
cd C:/TEST/beach-check-list && npm run lint && echo "PASS" || echo "FAIL"
```

### RE-4: No Regressions in Existing Tests

```bash
# Compare test count before and after
# Baseline: 217 tests (pre-FEAT-security-hardening)
cd C:/TEST/beach-check-list && npm test 2>&1 | grep -oP '\d+ passed' | head -1
# PASS if count >= baseline
```

---

## Structural Issues Found (Session: 2026-03-09, FEAT-security-hardening)

### ISSUE-1: Contradictory gate instructions (MEDIUM)

**Spec says:** "Gate: Stop and wait for the user only after Step 2"
**Spec also says (Steps 3-7):** "Only run this step when the user says to proceed"

These contradict each other. The "only gate" language in Step 2 implies Steps 3-7 auto-proceed. But each step header says "Only run this step when the user says to proceed." In practice, Claude interpreted the gate instruction correctly (auto-proceeded 3-7), but the per-step headers create ambiguity.

**Fix:** Remove "Only run this step when the user says to proceed" from Steps 3-7 headers, or change to "Auto-proceed from previous step."

### ISSUE-2: Step 1 says "proceed to Step 2 without waiting" but Step 2 says "Only run this step when the user says to proceed" (LOW)

Same contradiction pattern. Step 1 explicitly says auto-proceed, but Step 2's header contradicts it.

**Fix:** Align the headers with the gate instruction at the top.

### ISSUE-3: Self-review uses `git diff HEAD~1` which may not capture all changes (MEDIUM)

If implementation spans multiple commits (as happened in this session — tests and docs were committed separately), `HEAD~1` only shows the last commit's changes. The self-review should use `git diff` (unstaged) or compare against the base commit before the feature started.

**Fix:** Use `git diff HEAD~N --name-only` where N = number of feature commits, or better: compare against a known baseline SHA. Alternatively, since changes may not be committed yet, use `git diff --name-only` + `git diff --cached --name-only` + `git ls-files --others --exclude-standard`.

### ISSUE-4: No error recovery for agent failures (LOW)

If `plan-creator`, `fe-engineer`, `qa-engineer`, or `doc-engineer` agents fail or return an error, the skill has no fallback instructions. Only `code-review-engineer` has a retry loop (3 rounds).

**Fix:** Add a generic error handling clause: "If any agent fails, report the error to the user and ask whether to retry or skip that step."

### ISSUE-5: No context preservation across session loss (MEDIUM)

When the session was accidentally closed, there was no mechanism to resume. The user had to re-invoke `/implement` and manually explain the situation. The skill could instruct Claude to save intermediate state (e.g., the approved plan, engineer summary) to a file so it can be resumed.

**Fix:** Add a "State Persistence" section instructing Claude to write intermediate artifacts (plan, engineer summary) to `.claude/wip/FEAT-<id>/` so they survive session loss.

### ISSUE-6: Steps 3-7 run sequentially but some could parallelize (INFO)

Steps 5 (Tests) and 6 (Documentation) are independent and could run in parallel. The skill enforces strict sequential execution.

**Fix:** Consider allowing Steps 5 and 6 to run in parallel: "Spawn qa-engineer and doc-engineer agents simultaneously."

### ISSUE-7: Skill is hardcoded to one repo path (INFO)

`C:/TEST/beach-check-list` is baked into every agent prompt. The skill is not portable to other projects.

**Fix:** Use `$CWD` or `$PROJECT_ROOT` placeholder, or detect the repo root dynamically.

---

## Session Scorecard: FEAT-security-hardening (2026-03-09)

| Eval | Result | Notes |
|------|--------|-------|
| CE-1: Requirements Parsing | PASS | Summary table with all fields, FEAT-security-hardening ID |
| CE-2: Implementation Plan | PASS | plan-creator spawned, file-by-file plan, gate displayed, user approved |
| CE-3: Implementation | PASS | fe-engineer spawned (previous session), all 8 files changed |
| CE-4: Code Review | PASS | code-review-engineer spawned, verdict: PASS |
| CE-5: Tests | PASS | qa-engineer spawned, 53 tests added, 270 total passing |
| CE-6: Documentation | PASS | doc-engineer spawned, CLAUDE.md + CHANGELOG.md updated |
| CE-7: Self-Review | PARTIAL | Lint/test run, acceptance checklist rendered, final summary — but `git diff HEAD~1` was not used (changes uncommitted, used `git diff --name-only` instead which was correct adaptation) |
| RE-1: Build | PASS | `npm run build` clean |
| RE-2: Tests | PASS | 270/270 |
| RE-3: Lint | PASS | 0 warnings |
| RE-4: No Regressions | PASS | 270 >= 217 baseline |

### Metrics

```
Capability Evals:  6.5/7 passed  (CE-7 partial: adapted correctly but didn't match spec exactly)
Regression Evals:  4/4 passed
pass@1:            93% (6.5/7)
pass@3:            100% (estimated — CE-7 is a spec ambiguity, not a real failure)
```

### Overall Verdict

**PASS with recommendations** — The skill works well end-to-end. All implementation, review, test, and doc steps completed successfully. The 7 structural issues identified are improvement opportunities, not blockers.

### Priority Fixes

1. **ISSUE-1 + ISSUE-2** (5 min) — Fix contradictory gate language in step headers
2. **ISSUE-3** (5 min) — Fix self-review git diff to handle uncommitted changes
3. **ISSUE-5** (15 min) — Add state persistence for session recovery
4. **ISSUE-4** (5 min) — Add generic agent error handling clause
