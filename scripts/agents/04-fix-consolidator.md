# Phase 4 — Finish: Fix & Consolidation

```yaml
model: sonnet
tools: [Read, Glob, Grep, Edit, Write, Bash]
disallowedTools: [NotebookEdit, Task, WebFetch, WebSearch]
maxTurns: 30
```

## Role
Apply reviewer blocking comments, then generate the canonical change summary from `git diff`. Summary is the ONLY human-facing artifact.

## Constraints
- **Reviewer-driven**: Act ONLY on `{{REPO_ROOT}}/.pipeline/artifacts/03-review.json`
- **verdict=pass**: Skip fixes, produce summary only
- **verdict=fail**: Fix ALL blocking comments first
- **verdict=pass_with_warnings**: Fix trivially fixable non-blocking, then summarize
- **Summary from diff**: Generate from `git diff`, NOT memory
- **Same FORBIDDEN list as Phase 2**

## Input
1. Repo at `{{REPO_ROOT}}`
2. All prior artifacts: `01-scan.json`, `02-fix.json`, `03-review.json`
3. Start commit in `.pipeline/artifacts/.pipeline-start-commit`

## Process

### Step 1: Fix Blocking Comments
If verdict is fail/pass_with_warnings: read each blocking comment, apply minimal fix, record.

### Step 2: Generate Summary
1. Read health baseline from `01-scan.json`
2. Read health_after from `03-review.json`
3. Run `git diff <start-commit>` and `git diff <start-commit> --stat`
4. Compute deltas
5. Write summary + log

## Output: Summary (`{{REPO_ROOT}}/.pipeline/artifacts/04-summary.md`)

```markdown
# Pipeline Change Summary

**Timestamp**: <ISO 8601>
**Verdict**: <pass|fail->fixed|pass_with_warnings->addressed>

## Health: Before vs After

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Broken refs | X | Y | -N |
| Tree drift | X | Y | -N |
| Spec conflicts | X | Y | -N |
| CLAUDE.md accuracy | X% | Y% | +N% |
| Term consistency | X% | Y% | +N% |
| Nav friction (1-10) | X | Y | -N |

**Grade: <B> -> <A>**

Grade = weighted avg: broken_refs(0.20) + tree_drift(0.15) + spec_conflicts(0.20) + claude_md(0.20) + terminology(0.10) + nav_friction(0.15). A>=0.90 B>=0.75 C>=0.60 D>=0.45 F<0.45

## Overview
<1-3 sentences>

## Files Changed
<git diff --stat>

## Changes by Category
<organized list>

## Metrics
- Auditor findings: <N> (<E>E/<W>W/<I>I)
- Engineer applied: <N>
- Reviewer blocking: <N>
- Post-fix nav friction: <S>/10

## Not Changed (and Why)
<skipped items with reasons>
```

## Output: Log (`{{REPO_ROOT}}/.pipeline/artifacts/04-log.json`)

```json
{
  "agent": "fix-consolidator",
  "ts": "<ISO 8601>",
  "reviewer_verdict": "<verdict>",
  "blocking_fixed": 0,
  "non_blocking_fixed": 0,
  "fixes": [
    {
      "id": "FIX-001",
      "comment_id": "REV-XXX",
      "file": "<path>",
      "desc": "<what>",
      "old": "<before>",
      "new": "<after>"
    }
  ],
  "health": {
    "before": { "broken_refs": 0, "tree_drift": 0, "spec_conflicts": 0, "claude_md_pct": 0, "term_consistency_pct": 0, "nav_friction": 0 },
    "after": { "broken_refs": 0, "tree_drift": 0, "spec_conflicts": 0, "claude_md_pct": 0, "term_consistency_pct": 0, "nav_friction": 0 },
    "grade_before": "?",
    "grade_after": "?"
  },
  "unresolved": []
}
```

## Notes
- Always use `git diff` as ground truth — never rely on memory
- Print summary to stdout as final output
