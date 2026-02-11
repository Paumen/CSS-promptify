# Repo Hygiene Pipeline — Orchestrator

## Task SDK Configuration

```yaml
description: "Four-phase repo hygiene pipeline with gated handoffs"
model: haiku
tools: [Read, Write, Bash, Task, Glob]
disallowedTools: [Edit, NotebookEdit, WebFetch, WebSearch]
maxTurns: 20
```

---

## Pipeline Architecture

```
  SCAN            REPAIR          CHALLENGE       FINISH
 ┌──────┐  json  ┌──────┐  json  ┌──────┐  json  ┌──────┐
 │ Audit├───────▶│ Eng  ├───────▶│ Rev  ├───────▶│ Fix  │
 │haiku │        │sonnet│        │ opus │        │sonnet│
 └──┬───┘        └──┬───┘        └──┬───┘        └──┬───┘
    │ 01-scan.json   │ 02-fix.json   │ 03-review.json│ 04-summary.md
    ▼                ▼               ▼               ▼
            .pipeline/artifacts/  (ephemeral)
```

**Hard gates**: Each phase validates the prior artifact as JSON before launching.
**No shared context**: Artifacts are the ONLY communication channel.

## Model Selection

| Phase | Model | Rationale |
|-------|-------|-----------|
| Orchestrator | haiku | Mechanical sequencing only |
| 1 — Scan | haiku | Fast breadth-first pattern matching |
| 2 — Repair | sonnet | Strong instruction-following for diffs |
| 3 — Challenge | opus | Deepest reasoning for adversarial review |
| 4 — Finish | sonnet | Balanced for targeted fixes + summary |

## Execution Steps

### Pre-flight
1. `REPO_ROOT=$(git rev-parse --show-toplevel)`
2. Create `.pipeline/artifacts/` if needed
3. Clear prior artifacts (keep `.gitkeep`)
4. Save `git rev-parse HEAD` → `.pipeline/artifacts/.pipeline-start-commit`
5. Create `.pipeline/config.json` if missing: `{ "approval_mode": "auto", "dry_run": false }`
6. Read config, check `dry_run`
7. Replace `{{REPO_ROOT}}` in each agent prompt

### Phase 1 — Scan (Auditor)
```
1. Read scripts/agents/01-repo-auditor.md
2. Replace {{REPO_ROOT}}
3. Launch: subagent_type=general-purpose, model=haiku
4. Validate: .pipeline/artifacts/01-scan.json is valid JSON
5. ABORT on failure
```

**Post-Phase 1 visual** — print to chat:
```
┌─────────────────────────────────────────┐
│  SCAN COMPLETE                          │
├──────────┬──────┬─────────┬─────────────┤
│ Findings │  <N> │ E/W/I   │ <E>/<W>/<I> │
│ Friction │  <S> │ /10     │             │
│ Grade    │  <G> │         │             │
├──────────┴──────┴─────────┴─────────────┤
│ Health Baseline                         │
│  Broken refs .... <N>                   │
│  Tree drift ..... <N> files             │
│  Spec conflicts . <N>                   │
│  CLAUDE.md acc .. <N>%                  │
│  Term consist. .. <N>%                  │
│  Nav friction ... <S>/10                │
└─────────────────────────────────────────┘
```

### Dry Run Check
If `dry_run` is true: print the baseline table, print "Dry run — no mutations.", STOP.

### Phase 2 — Repair (Engineer)
```
1. Read scripts/agents/02-structure-engineer.md
2. Replace {{REPO_ROOT}}
3. Launch: subagent_type=general-purpose, model=sonnet
4. Validate: .pipeline/artifacts/02-fix.json is valid JSON
5. ABORT on failure
6. Print: "Phase 2 done. <applied> fixed, <skipped> skipped."
```

### Approval Gate (Phase 2 → 3)
- `approval_mode: "auto"` → skip
- `approval_mode: "prompt"` → show Cat C/D changes, ask to proceed

### Phase 3 — Challenge (Reviewer)
```
1. Read scripts/agents/03-adversarial-reviewer.md
2. Replace {{REPO_ROOT}}
3. Launch: subagent_type=general-purpose, model=opus
4. Validate: .pipeline/artifacts/03-review.json is valid JSON
5. ABORT on failure
6. Print: "Phase 3 done. Verdict: <V>. Blocking: <N>."
```

### Phase 4 — Finish (Consolidator)
```
1. Read scripts/agents/04-fix-consolidator.md
2. Replace {{REPO_ROOT}}
3. Launch: subagent_type=general-purpose, model=sonnet
4. Validate: .pipeline/artifacts/04-summary.md exists
5. Validate: .pipeline/artifacts/04-log.json is valid JSON
6. ABORT on failure
```

### Post-flight
1. Print full contents of `04-summary.md`
2. Print visual diff box:
```
┌──────────────────────────────────────────────────┐
│  PIPELINE COMPLETE                               │
├──────────────────────────────────────────────────┤
│  Health: <BEFORE> → <AFTER>                      │
│  Files changed: <N>                              │
│  Findings resolved: <N>/<T>                      │
├──────────────────────────────────────────────────┤
│  <git diff --stat output>                        │
└──────────────────────────────────────────────────┘
```
3. **Clean up**: Delete all `.pipeline/artifacts/*.json` files (keep `.md` summary)
4. Ask: "Commit these changes? (y/n)"
5. If yes: stage changed files (exclude `.pipeline/artifacts/`), commit as `chore: repo hygiene — <date>`

## Abort Protocol
1. Print which phase failed and why
2. Print any partial artifacts
3. Do NOT retry or continue
4. Leave repo as-is

## Safety
- NEVER modifies `.ts`, `.tsx`, `.js`, `.css`
- NEVER modifies `spec/DECISIONS.md`
- NEVER changes spec policy
- All changes are docs/plumbing only
- Every destructive change has a reversible diff
