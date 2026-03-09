# Eval Harness: /implement skill

## Purpose

Executable harness for measuring `/implement` skill reliability across multiple test scenarios. Designed to be run manually via `claude -p` or integrated into a CI-like loop.

---

## Test Scenarios

Three scenarios of increasing complexity, each testing the full 7-step pipeline.

### Scenario 1: SIMPLE — Add a single UI element

```
/implement
Add a "Xoá tất cả đã chọn" (delete all checked) button next to the reset button in ChecklistStats.
It should only appear when at least one item is checked.
Clicking it removes all checked items from all categories (with undo support).
```

**Expected outcomes:**
- Files changed: `lib/useChecklist.ts` (new `removeCheckedItems` function), `components/ChecklistStats.tsx` (new button)
- 1 new function in useChecklist
- Button text in Vietnamese
- Undo support via existing `pushUndo` pattern

### Scenario 2: MEDIUM — Cross-cutting feature

```
/implement
Add item priority levels. Each item can have a priority: "cao" (high), "trung bình" (medium), or "thấp" (low).
Show a small colored dot next to the item label (red/yellow/green).
Add a filter option in FilterBar to filter by priority level.
Default priority for new items is "trung bình".
```

**Expected outcomes:**
- Files changed: `lib/types.ts` (new `priority` field), `lib/useChecklist.ts`, `components/ChecklistItem.tsx`, `components/AddItemForm.tsx`, `components/FilterBar.tsx`, `app/page.tsx`
- Type change cascades flagged in plan
- Filter composes with existing filters

### Scenario 3: COMPLEX — Multi-component feature with state

```
/implement
Add an export/import feature. Users can export their checklist as a JSON file download,
and import a JSON file to replace or merge with their current checklist.
Add an "Xuất / Nhập" section in the header area with two buttons.
Import should validate the JSON structure before applying.
Merge mode: keep existing items, add new ones from the import.
```

**Expected outcomes:**
- Files changed: `lib/useChecklist.ts` or new `lib/exportImport.ts`, new `components/ExportImport.tsx`, `app/page.tsx`
- JSON validation using type guards from `lib/validation.ts`
- File download via Blob URL
- File upload via hidden `<input type="file">`
- Merge logic handles duplicate IDs

---

## Execution Protocol

### Setup (before each run)

```bash
# 1. Save baseline
cd C:/TEST/beach-check-list
BASELINE_SHA=$(git rev-parse HEAD)
BASELINE_TESTS=$(npm test 2>&1 | grep -oP '\d+ passed' | head -1)

echo "Baseline SHA: $BASELINE_SHA"
echo "Baseline tests: $BASELINE_TESTS"

# 2. Create a clean worktree for isolation
git worktree add ../beach-eval-run-$(date +%s) HEAD
cd ../beach-eval-run-*
```

### Run

```bash
# Execute the skill with a test scenario
claude -p "/implement <scenario prompt>"

# Interact: approve plan when gate is shown (type "next")
```

### Grade (after run completes)

Run the grading checklist below. Each item is PASS/FAIL.

---

## Grading Checklist

### A. Structural Compliance (7 checks)

```bash
# A1: Requirements table was rendered
# Grader: human (check session output)
# PASS if output contains Feature ID, Title, Scope, Requirements, Acceptance Criteria, Constraints

# A2: plan-creator agent was spawned (not inline planning)
# Grader: human (check session for Agent tool call with subagent_type=plan-creator)

# A3: Gate was shown after Step 2
# Grader: human (check for "Reply 'next' to start implementation")

# A4: fe-engineer agent was spawned for Step 3
# Grader: human (check session for Agent tool call with subagent_type=fe-engineer)

# A5: code-review-engineer agent was spawned for Step 4
# Grader: human (check for PASS/FAIL verdict)

# A6: qa-engineer agent was spawned for Step 5
# Grader: human (check for test files created)

# A7: doc-engineer agent was spawned for Step 6
# Grader: human (check for CLAUDE.md updates)
```

### B. Code Quality (5 checks)

```bash
# B1: Build passes
cd C:/TEST/beach-check-list && npm run build && echo "PASS" || echo "FAIL"

# B2: Lint clean
cd C:/TEST/beach-check-list && npm run lint 2>&1 | grep -q "No ESLint warnings or errors" && echo "PASS" || echo "FAIL"

# B3: All tests pass
cd C:/TEST/beach-check-list && npm test 2>&1 | grep -q "0 failed" || npm test 2>&1 | grep -qv "failed" && echo "PASS" || echo "FAIL"

# B4: No TypeScript `any` in changed files
CHANGED=$(git diff --name-only $BASELINE_SHA)
echo "$CHANGED" | xargs grep -l ": any\b" 2>/dev/null && echo "FAIL" || echo "PASS"

# B5: No test regressions (test count >= baseline)
CURRENT_TESTS=$(npm test 2>&1 | grep -oP '\d+ passed' | head -1)
echo "Baseline: $BASELINE_TESTS, Current: $CURRENT_TESTS"
# PASS if current >= baseline
```

### C. Functional Correctness (scenario-specific)

```bash
# C1: All planned files were actually changed
# Grader: human (compare plan output with git diff)

# C2: Feature works as described in requirements
# Grader: human (manual test in browser)

# C3: Acceptance criteria all marked [x] in self-review
# Grader: human (check self-review output)
```

### D. Pipeline Integrity (4 checks)

```bash
# D1: No branch was created
git branch --list | grep -v master | grep -v main && echo "FAIL" || echo "PASS"

# D2: No push was made
git log --oneline origin/master..HEAD | wc -l
# PASS if this shows commits (not pushed)

# D3: State persistence files created
ls .claude/wip/FEAT-*/plan.md 2>/dev/null && echo "PASS" || echo "FAIL"

# D4: Error handling (only testable if an agent fails)
# Grader: human (inject failure and check retry/skip behavior)
```

---

## Scoring

| Section | Checks | Weight |
|---------|--------|--------|
| A. Structural | 7 | 30% |
| B. Code Quality | 5 | 30% |
| C. Functional | 3 | 30% |
| D. Pipeline | 4 | 10% |
| **Total** | **19** | **100%** |

### Score Calculation

```
score = (A_pass/7 * 30) + (B_pass/5 * 30) + (C_pass/3 * 30) + (D_pass/4 * 10)
```

### Thresholds

| Metric | Target |
|--------|--------|
| pass@1 (single run) | >= 85% |
| pass@3 (best of 3) | >= 95% |
| pass^3 (all 3 pass) | >= 80% |

---

## Run Log Template

```markdown
## Run: <scenario> — <date>

| Section | Passed | Total | Score |
|---------|--------|-------|-------|
| A. Structural | /7 | 7 | |
| B. Code Quality | /5 | 5 | |
| C. Functional | /3 | 3 | |
| D. Pipeline | /4 | 4 | |
| **Total** | **/19** | **19** | **%** |

### Failures
- <check>: <reason>

### Notes
- <observations>

### Verdict: PASS / FAIL
```

---

## Automation Script

Save as `.claude/evals/run-implement-eval.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO="C:/TEST/beach-check-list"
SCENARIO="${1:-simple}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$REPO/.claude/evals/implement-$SCENARIO-$TIMESTAMP.log"

cd "$REPO"

echo "=== IMPLEMENT SKILL EVAL ===" | tee "$LOG_FILE"
echo "Scenario: $SCENARIO" | tee -a "$LOG_FILE"
echo "Timestamp: $TIMESTAMP" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Capture baseline
BASELINE_SHA=$(git rev-parse HEAD)
BASELINE_TESTS=$(npm test 2>&1 | grep -oP '\d+ passed' | head -1 || echo "unknown")
echo "Baseline SHA: $BASELINE_SHA" | tee -a "$LOG_FILE"
echo "Baseline tests: $BASELINE_TESTS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run regression checks after the skill completes
echo "--- REGRESSION CHECKS ---" | tee -a "$LOG_FILE"

echo -n "B1 Build: " | tee -a "$LOG_FILE"
npm run build > /dev/null 2>&1 && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo -n "B2 Lint: " | tee -a "$LOG_FILE"
npm run lint 2>&1 | grep -q "No ESLint warnings or errors" && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo -n "B3 Tests: " | tee -a "$LOG_FILE"
npm test > /dev/null 2>&1 && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo -n "B4 No any: " | tee -a "$LOG_FILE"
CHANGED=$(git diff --name-only "$BASELINE_SHA" -- '*.ts' '*.tsx' 2>/dev/null || true)
if [ -z "$CHANGED" ]; then
  echo "PASS (no files changed)" | tee -a "$LOG_FILE"
else
  echo "$CHANGED" | xargs grep -l ": any\b" 2>/dev/null && echo "FAIL" | tee -a "$LOG_FILE" || echo "PASS" | tee -a "$LOG_FILE"
fi

echo -n "B5 No regressions: " | tee -a "$LOG_FILE"
CURRENT_TESTS=$(npm test 2>&1 | grep -oP '\d+ passed' | head -1 || echo "0")
echo "BASELINE=$BASELINE_TESTS CURRENT=$CURRENT_TESTS" | tee -a "$LOG_FILE"

echo -n "D1 No branch: " | tee -a "$LOG_FILE"
EXTRA_BRANCHES=$(git branch --list | grep -v master | grep -v main | grep -v "^\*" | wc -l)
[ "$EXTRA_BRANCHES" -eq 0 ] && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "=== EVAL COMPLETE ===" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE"
```

### Usage

```bash
# Run the regression checks after a /implement session
bash .claude/evals/run-implement-eval.sh simple

# Or for a specific scenario
bash .claude/evals/run-implement-eval.sh medium
```

The structural (A) and functional (C) checks require human grading from the session transcript. The code quality (B) and pipeline (D) checks are automated by the script above.

---

## Historical Results

| Date | Scenario | Score | pass@1 | Notes |
|------|----------|-------|--------|-------|
| 2026-03-09 | security-hardening (real feature) | 18/19 (95%) | PASS | CE-7 partial due to spec ambiguity (now fixed) |
