---
name: implement
description: Run the full development workflow for a feature or task. Use when the user runs /implement with any feature description, requirement, or task — even vague ones like "add dark mode" or "make X better". Triggers the full plan → implement → review → test → document pipeline for C:/TEST/beach-check-list.
---

# Implement Feature

When the user runs `/implement`, execute the full development workflow for the feature or requirements they provide.

## Usage

```
/implement
Add a dark mode toggle to the header
```

Or with more detail:

```
/implement
Feature: Trip countdown
Show "còn X ngày" in the header based on a user-set departure date.
Store the date in localStorage. Clear it with a reset button.
```

No Jira ticket required. No branch required. All work goes directly on the current branch (usually `master`).

---

## Repo Path

| Repo | Path |
|------|------|
| Project | `C:/TEST/beach-check-list` |

---

## Error Handling

If any agent (plan-creator, fe-engineer, code-review-engineer, qa-engineer, doc-engineer) fails or returns an error:
1. Report the error clearly to the user
2. Ask whether to **retry** the failed step or **skip** it and continue
3. If retrying, re-spawn the same agent with the same prompt
4. If skipping, note it as `SKIPPED` in the final summary and continue to the next step

---

## State Persistence

After each major step completes, save intermediate artifacts so work survives session loss:

- After Step 2 (plan approved): write the approved plan to `.claude/wip/<feature-id>/plan.md`
- After Step 3 (implementation): write the engineer summary to `.claude/wip/<feature-id>/engineer-summary.md`

On session resume: if the user mentions resuming or restarting, check `.claude/wip/<feature-id>/` for saved artifacts and skip already-completed steps.

Clean up `.claude/wip/<feature-id>/` after Step 7 completes successfully.

---

## Workflow

> **Gate:** Stop and wait for the user only after Step 2 (Implementation Plan). All other steps auto-proceed immediately.

---

### Step 1: Parse Requirements

Read the feature description provided by the user in `$ARGUMENTS`. Derive:
- A short **feature ID** (e.g. `FEAT-note-viewer`) — kebab-case, prefixed with `FEAT-`
- A concise **title** (one line)
- **Scope** — `FE-only` for this project (no backend exists)
- **Requirements** — what needs to be built, broken into bullet points
- **Acceptance criteria** — what "done" looks like
- **Constraints** — Vietnamese UI text, strict TypeScript, no `any`, localStorage-only state

Display a summary table:

| Field | Value |
|-------|-------|
| Feature ID | `FEAT-<name>` |
| Title | `<1-line title>` |
| Scope | `FE-only` |
| Requirements | `<bulleted list>` |
| Acceptance Criteria | `<bulleted list>` |
| Constraints | Vietnamese UI · Strict TS · localStorage state |

Then immediately proceed to Step 2 without waiting.

---

### Step 2: Implementation Plan

Auto-proceeds from Step 1.

Spawn a `plan-creator` agent:

**Prompt:**
```
Feature: <feature-id>
Title: <title>
Scope: FE-only
Repo: C:/TEST/beach-check-list

Requirements:
<requirements bullet list>

Acceptance Criteria:
<acceptance criteria bullet list>
```

Display the plan-creator's output, then output:

```
---
Step 2 complete. Review the implementation plan above.
Reply "next" to start implementation, or describe changes to the plan first.
---
```

- If user requests changes → re-spawn `plan-creator` with the original prompt plus:
  ```
  User correction: <feedback>
  Revise the plan accordingly and output the full updated plan.
  ```
  Show the revised plan and display the gate again. Repeat until the user says "next".

Store the approved plan as `<implementation plan>`.

**Wait for the user.** ← This is the only gate in the workflow.

---

### Step 3: Implementation

Auto-proceeds after user approves the plan in Step 2.

Spawn a `fe-engineer` agent:

**Prompt:**
```
Feature: <feature-id>
Title: <title>
Repo: C:/TEST/beach-check-list
Branch: master (work directly on master — do NOT create or switch branches)

Requirements:
<requirements bullet list>

Implementation Plan:
<implementation plan>
```

Store the engineer's output as `<engineer summary>`, then immediately proceed to Step 4.

---

### Step 4: Code Review

Auto-proceeds from Step 3.

Spawn a `code-review-engineer` agent:

**Prompt:**
```
Feature: <feature-id>
Repo: C:/TEST/beach-check-list

Requirements:
<requirements bullet list>

Acceptance Criteria:
<acceptance criteria bullet list>

Engineer Summary:
<engineer summary>
```

If the review returns **FAIL**:
- List the issues clearly
- Spawn `fe-engineer` with the review feedback to fix each issue
- Re-run `code-review-engineer` after fixes
- Repeat up to 3 rounds
- If still FAIL after 3 rounds: stop and tell the user to review the remaining issues manually

Once review **PASS**, immediately proceed to Step 5.

---

### Step 5: Tests

Auto-proceeds from Step 4 (run in parallel with Step 6).

Spawn a `qa-engineer` agent:

**Prompt:**
```
Feature: <feature-id>
Repo: C:/TEST/beach-check-list

Requirements:
<requirements bullet list>

Engineer Summary:
<engineer summary>
```

Display the QA output, then immediately proceed to Step 6.

---

### Step 6: Documentation

Auto-proceeds from Step 4 (run in parallel with Step 5).

Spawn a `doc-engineer` agent:

**Prompt:**
```
Feature: <feature-id>
Title: <title>
Repo: C:/TEST/beach-check-list

Requirements:
<requirements bullet list>

Engineer Summary:
<engineer summary>
```

Display the doc output, then immediately proceed to Step 7.

---

### Step 7: Self-Review

Auto-proceeds after Steps 5 and 6 both complete.

Run directly (no sub-agent):

```bash
# Recent commits
cd C:/TEST/beach-check-list && git log --oneline -5

# All changed files (staged, unstaged, and untracked)
cd C:/TEST/beach-check-list && git diff --name-only && git diff --cached --name-only && git ls-files --others --exclude-standard

# Lint
cd C:/TEST/beach-check-list && npm run lint

# Tests
cd C:/TEST/beach-check-list && npm test
```

Output a self-review report:

```
## Self-Review: <feature-id>

### Checks
- Lint: PASS / FAIL
- Tests: PASS / FAIL (N passed, N failed)

### Files Changed
- <list from git diff>

### Acceptance Criteria
- [x] <criterion> — implemented in <file>
- [ ] <criterion> — NOT implemented (<reason>)

### Verdict
READY / NEEDS ATTENTION — <one-line summary>
```

If **NEEDS ATTENTION**: list what needs fixing. Do not proceed until resolved.

---

## Final Summary

Output when all steps are complete:

| Step | Status | Details |
|------|--------|---------|
| Requirements | Done | `<title>` |
| Implementation Plan | Approved | `<N files>` |
| Implementation | Done | `<N files changed>` |
| Code Review | Passed | |
| Tests | Done | `<N tests added>` |
| Docs | Done | |
| Self-Review | READY | `<verdict summary>` |
