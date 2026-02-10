# Four-Agent Repo Hygiene Pipeline — Task Definition

## Task SDK Configuration

```yaml
description: "Orchestrate four-agent linear-gated repo hygiene pipeline"
prompt: <this file — the orchestrator reads agent prompts from scripts/agents/*.md>
tools:
  - Read           # read agent prompts and artifacts
  - Write          # write resolved prompts (with {{REPO_ROOT}} filled in)
  - Bash           # git operations, JSON validation, directory setup
  - Task           # spawn subagents
  - Glob           # find files for validation
disallowedTools:
  - Edit           # orchestrator never edits repo files directly
  - NotebookEdit   # no notebooks
  - WebFetch       # no external access
  - WebSearch      # no external access
model: haiku       # orchestrator is lightweight — just sequencing and validation
permissionMode: default  # user approves each subagent launch
mcpServers: {}     # no external integrations
hooks: {}          # no lifecycle hooks — orchestrator is stateless coordinator
maxTurns: 20       # 4 agent launches + validation between each + pre/post flight
skills: []         # no skill invocations
memory: false      # ephemeral — artifacts carry all state
```

### Config Justifications
| Field | Value | Why |
|-------|-------|-----|
| `tools` | Read, Write, Bash, Task, Glob | Needs to read prompts, write resolved versions, validate JSON, launch agents |
| `disallowedTools` | Edit, NotebookEdit, WebFetch, WebSearch | Orchestrator coordinates, never directly mutates repo content |
| `model` | haiku | Orchestration is mechanical sequencing; no deep reasoning needed |
| `permissionMode` | default | User approves each subagent spawn for visibility |
| `mcpServers` | none | All work is local |
| `hooks` | none | Stateless coordinator; artifacts are the communication channel |
| `maxTurns` | 20 | 4 agent launches × ~4 turns each (launch + validate + log) + overhead |
| `skills` | none | No applicable skills |
| `memory` | false | Each pipeline run is independent; no cross-run state |

---

## Overview
This is the single Claude task that orchestrates all four agents in a linear-gated pipeline. Each phase consumes files + prior artifacts only. Agents do NOT share conversational context.

## How to Invoke

```
Run the repo hygiene pipeline: read and execute scripts/agents/pipeline-trigger.md
```

## Pipeline Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Auditor  │────▶│  2. Engineer  │────▶│  3. Reviewer  │────▶│ 4. Fix/Sum   │
│  (read-only) │     │  (mutating)   │     │  (read-only)  │     │ (write+sum)  │
│              │     │              │     │  (adversarial)│     │              │
│  haiku       │     │  sonnet      │     │  opus         │     │  sonnet      │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  01-auditor-         02-engineer-         03-reviewer-         04-change-
  findings.json       changes.json         comments.json        summary.md
```

## Phase Boundaries (HARD GATES)

- Phase 2 MUST NOT start until Phase 1 artifact exists and is valid JSON.
- Phase 3 MUST NOT start until Phase 2 artifact exists and is valid JSON.
- Phase 4 MUST NOT start until Phase 3 artifact exists and is valid JSON.
- NO agent may read another agent's conversational context.
- Artifacts are the ONLY communication channel between agents.

## Model Selection Rationale

| Agent | Model | Why |
|-------|-------|-----|
| Orchestrator | haiku | Lightweight sequencing — no reasoning needed |
| Auditor | haiku | Fast, cheap, high recall. Scanning is breadth over depth. |
| Engineer | sonnet | Strong instruction-following, handles large diffs well. |
| Reviewer | opus | Strongest reasoning for adversarial criticism. |
| Fix/Summary | sonnet | Balanced — applies targeted fixes and summarizes. |

## Execution Instructions

When this pipeline is triggered, execute the following steps IN ORDER:

### Pre-flight
1. Detect repo root: `REPO_ROOT=$(git rev-parse --show-toplevel)`
2. Ensure `.pipeline/artifacts/` directory exists (create if needed).
3. Clear any previous artifacts: remove all files in `.pipeline/artifacts/` (except `.gitkeep`).
4. Record the current git state: `git rev-parse HEAD` → save to `.pipeline/artifacts/.pipeline-start-commit`.
5. Ensure `.pipeline/config.json` exists. If not, create with defaults:
   ```json
   { "approval_mode": "prompt", "dry_run": false }
   ```
6. Read `.pipeline/config.json` and check `dry_run` flag.
7. Read each agent prompt file and replace all `{{REPO_ROOT}}` with the detected repo root path.

### Phase 1: Repo Auditor
```
1. Read scripts/agents/01-repo-auditor.md
2. Replace {{REPO_ROOT}} with detected repo root
3. Launch Task agent:
   - subagent_type: general-purpose
   - model: haiku
   - prompt: resolved contents of 01-repo-auditor.md
4. Wait for completion
5. Validate: .pipeline/artifacts/01-auditor-findings.json exists and is valid JSON
6. If invalid or missing: ABORT pipeline with error
7. Print: "Phase 1 complete. Findings: <summary.total_findings> (<by_severity>)"
```

### Dry Run Check
```
If dry_run is true:
  1. Print the health_baseline from 01-auditor-findings.json as a formatted table
  2. Print: "Dry run complete. Auditor found <N> findings (<E>E/<W>W/<I>I). No mutations applied."
  3. STOP — do not proceed to Phase 2, 3, or 4.
```

### Phase 2: Structure & Reference Engineer
```
1. Read scripts/agents/02-structure-engineer.md
2. Replace {{REPO_ROOT}} with detected repo root
3. Launch Task agent:
   - subagent_type: general-purpose
   - model: sonnet
   - prompt: resolved contents of 02-structure-engineer.md
4. Wait for completion
5. Validate: .pipeline/artifacts/02-engineer-changes.json exists and is valid JSON
6. If invalid or missing: ABORT pipeline with error
7. Print: "Phase 2 complete. Changes: <changes_applied> applied, <changes_skipped> skipped"
```

### Human Approval Checkpoint (between Phase 2 and 3)
```
If approval_mode is "prompt":
  1. Read .pipeline/artifacts/02-engineer-changes.json
  2. Display summary of all Category C and D changes to the user
  3. Ask: "Review complete. Proceed to adversarial review? (y/n)"
  4. If denied: ABORT pipeline gracefully, leave changes in place
If approval_mode is "auto":
  Skip this checkpoint
```

### Phase 3: Adversarial Reviewer
```
1. Read scripts/agents/03-adversarial-reviewer.md
2. Replace {{REPO_ROOT}} with detected repo root
3. Launch Task agent:
   - subagent_type: general-purpose
   - model: opus
   - prompt: resolved contents of 03-adversarial-reviewer.md
4. Wait for completion
5. Validate: .pipeline/artifacts/03-reviewer-comments.json exists and is valid JSON
6. If invalid or missing: ABORT pipeline with error
7. Print: "Phase 3 complete. Verdict: <verdict>. Blocking: <blocking_comments>"
```

### Phase 4: Fix & Consolidation
```
1. Read scripts/agents/04-fix-consolidator.md
2. Replace {{REPO_ROOT}} with detected repo root
3. Launch Task agent:
   - subagent_type: general-purpose
   - model: sonnet
   - prompt: resolved contents of 04-fix-consolidator.md
4. Wait for completion
5. Validate: .pipeline/artifacts/04-change-summary.md exists
6. Validate: .pipeline/artifacts/04-consolidator-log.json exists and is valid JSON
7. If invalid or missing: ABORT pipeline with error
```

### Post-flight
1. Print the full contents of `.pipeline/artifacts/04-change-summary.md` to the user.
2. Show `git diff --stat` from pipeline start commit to current state.
3. Ask the user: "Pipeline complete. Would you like to commit these changes? (y/n)"
4. If yes: stage all changed files (excluding `.pipeline/artifacts/`), commit with message "chore: repo hygiene pipeline run — <date>".

## Abort Protocol
If any phase fails:
1. Print which phase failed and why.
2. Print any partial artifacts that exist.
3. Do NOT attempt to continue or retry automatically.
4. Leave the repo in its current state (do not rollback — the user can `git checkout .` if needed).

## Artifact Directory
All artifacts live in `.pipeline/artifacts/` and are gitignored. They are ephemeral per run.

## Safety Notes
- The pipeline NEVER modifies code files (`.ts`, `.tsx`, `.js`, `.css`).
- The pipeline NEVER modifies `spec/DECISIONS.md`.
- The pipeline NEVER changes spec policy or requirements.
- All changes are documentation/plumbing only.
- Every destructive change has a reversible diff annotation.
- Human approval gates at Category C/D changes and between Phase 2→3.
