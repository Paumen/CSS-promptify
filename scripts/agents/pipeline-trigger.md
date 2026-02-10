# Four-Agent Repo Hygiene Pipeline — Orchestrator

## Overview
This is the single Claude task trigger that orchestrates all four agents in a linear-gated pipeline. Each phase consumes files + prior artifacts only. Agents do NOT share conversational context.

## How to Invoke

In Claude Code, paste this as a task or use it as a prompt:

```
Run the four-agent repo hygiene pipeline defined in scripts/agents/pipeline-trigger.md
```

Or invoke it programmatically with the Claude Agent SDK Task tool.

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
| Auditor | haiku | Fast, cheap, high recall. Scanning is breadth over depth. |
| Engineer | sonnet | Strong instruction-following, handles large diffs well. |
| Reviewer | opus | Strongest reasoning for adversarial criticism. |
| Fix/Summary | sonnet | Balanced — applies targeted fixes and summarizes. |

## Execution Instructions (for Claude Code)

When this pipeline is triggered, execute the following steps IN ORDER:

### Pre-flight
1. Ensure `.pipeline/artifacts/` directory exists (create if needed).
2. Clear any previous artifacts: remove all files in `.pipeline/artifacts/`.
3. Record the current git state: `git rev-parse HEAD` → save as `pipeline_start_commit`.

### Phase 1: Repo Auditor
```
Launch Task agent (subagent_type: general-purpose, model: haiku) with the full contents of scripts/agents/01-repo-auditor.md as the prompt.
Wait for completion.
Verify .pipeline/artifacts/01-auditor-findings.json exists and is valid JSON.
If invalid or missing: ABORT pipeline with error.
```

### Phase 2: Structure & Reference Engineer
```
Launch Task agent (subagent_type: general-purpose, model: sonnet) with the full contents of scripts/agents/02-structure-engineer.md as the prompt.
Wait for completion.
Verify .pipeline/artifacts/02-engineer-changes.json exists and is valid JSON.
If invalid or missing: ABORT pipeline with error.
```

### Phase 3: Adversarial Reviewer
```
Launch Task agent (subagent_type: general-purpose, model: opus) with the full contents of scripts/agents/03-adversarial-reviewer.md as the prompt.
Wait for completion.
Verify .pipeline/artifacts/03-reviewer-comments.json exists and is valid JSON.
If invalid or missing: ABORT pipeline with error.
```

### Phase 4: Fix & Consolidation
```
Launch Task agent (subagent_type: general-purpose, model: sonnet) with the full contents of scripts/agents/04-fix-consolidator.md as the prompt.
Wait for completion.
Verify .pipeline/artifacts/04-change-summary.md exists.
Verify .pipeline/artifacts/04-consolidator-log.json exists and is valid JSON.
If invalid or missing: ABORT pipeline with error.
```

### Post-flight
1. Print the contents of `.pipeline/artifacts/04-change-summary.md` to the user.
2. Show `git diff --stat` from `pipeline_start_commit` to current HEAD.
3. Ask the user if they want to commit the changes.

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
