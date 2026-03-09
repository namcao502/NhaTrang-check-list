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
BASELINE_TESTS=$(npm test 2>&1 | grep -oP 'Tests:\s+\d+ passed' | grep -oP '\d+' || echo "unknown")
echo "Baseline SHA: $BASELINE_SHA" | tee -a "$LOG_FILE"
echo "Baseline tests: $BASELINE_TESTS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run regression checks
echo "--- CODE QUALITY CHECKS (B) ---" | tee -a "$LOG_FILE"

echo -n "B1 Build: " | tee -a "$LOG_FILE"
npm run build > /dev/null 2>&1 && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo -n "B2 Lint: " | tee -a "$LOG_FILE"
npm run lint 2>&1 | grep -q "No ESLint warnings or errors" && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo -n "B3 Tests: " | tee -a "$LOG_FILE"
npm test > /dev/null 2>&1 && echo "PASS" | tee -a "$LOG_FILE" || echo "FAIL" | tee -a "$LOG_FILE"

echo -n "B4 No any: " | tee -a "$LOG_FILE"
CHANGED=$(git diff --name-only "$BASELINE_SHA" -- '*.ts' '*.tsx' 2>/dev/null || true)
if [ -z "$CHANGED" ]; then
  echo "PASS (no ts/tsx files changed)" | tee -a "$LOG_FILE"
else
  if echo "$CHANGED" | xargs grep -lP ":\s*any\b" 2>/dev/null; then
    echo "FAIL" | tee -a "$LOG_FILE"
  else
    echo "PASS" | tee -a "$LOG_FILE"
  fi
fi

echo -n "B5 No regressions: " | tee -a "$LOG_FILE"
CURRENT_TESTS=$(npm test 2>&1 | grep -oP 'Tests:\s+\d+ passed' | grep -oP '\d+' || echo "0")
BASELINE_NUM=$(echo "$BASELINE_TESTS" | grep -oP '\d+' || echo "0")
CURRENT_NUM=$(echo "$CURRENT_TESTS" | grep -oP '\d+' || echo "0")
if [ "$CURRENT_NUM" -ge "$BASELINE_NUM" ] 2>/dev/null; then
  echo "PASS ($CURRENT_NUM >= $BASELINE_NUM)" | tee -a "$LOG_FILE"
else
  echo "FAIL ($CURRENT_NUM < $BASELINE_NUM)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "--- PIPELINE CHECKS (D) ---" | tee -a "$LOG_FILE"

echo -n "D1 No extra branches: " | tee -a "$LOG_FILE"
EXTRA_BRANCHES=$(git branch --list | grep -v master | grep -v main | grep -v "^\*" | wc -l)
if [ "$EXTRA_BRANCHES" -eq 0 ]; then
  echo "PASS" | tee -a "$LOG_FILE"
else
  echo "FAIL ($EXTRA_BRANCHES extra branches)" | tee -a "$LOG_FILE"
fi

echo -n "D2 Not pushed: " | tee -a "$LOG_FILE"
UNPUSHED=$(git log --oneline origin/master..HEAD 2>/dev/null | wc -l || echo "0")
echo "OK ($UNPUSHED unpushed commits)" | tee -a "$LOG_FILE"

echo -n "D3 State persistence: " | tee -a "$LOG_FILE"
if ls .claude/wip/FEAT-*/plan.md 2>/dev/null; then
  echo "PASS" | tee -a "$LOG_FILE"
else
  echo "SKIP (no wip dir — may have been cleaned up)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "--- SUMMARY ---" | tee -a "$LOG_FILE"
echo "Structural checks (A): MANUAL — review session transcript" | tee -a "$LOG_FILE"
echo "Functional checks (C): MANUAL — test in browser" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "=== EVAL COMPLETE ===" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE"
