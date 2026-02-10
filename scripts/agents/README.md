# Four-Agent Repo Hygiene Pipeline

A linear-gated pipeline with four specialized Claude agents for maintaining repository coherence, documentation accuracy, and LLM discoverability.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Auditor  │────▶│  2. Engineer  │────▶│  3. Reviewer  │────▶│ 4. Fix/Sum   │
│  (read-only) │     │  (mutating)   │     │  (read-only)  │     │ (write+sum)  │
│  haiku       │     │  sonnet      │     │  opus         │     │  sonnet      │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │  ▲                  │                    │
       ▼                    │  │                  ▼                    ▼
  01-auditor-          02-engineer-    [human     03-reviewer-    04-change-
  findings.json        changes.json    approval]  comments.json   summary.md
                                       gate
```

## Why This Decomposition

The dominant failure mode in agentic repo maintenance is **self-reinforcing drift**: agents that both read and write gradually normalize their own mistakes. This pipeline prevents that by:

1. **Separating observation from mutation** — the Auditor never writes, the Engineer never interprets.
2. **Adversarial validation** — the Reviewer assumes the Engineer is wrong and tries to prove it.
3. **Artifact-only communication** — no shared conversational context between agents.
4. **Human approval gates** — Category C/D changes require confirmation before adversarial review.

## Files

| File | Purpose |
|------|---------|
| `01-repo-auditor.md` | Agent 1: read-only analyzer with health baseline capture |
| `02-structure-engineer.md` | Agent 2: mechanical fixer with human approval gates |
| `03-adversarial-reviewer.md` | Agent 3: adversarial critic with post-change health snapshot |
| `04-fix-consolidator.md` | Agent 4: final fixer + before/after health visualization |
| `pipeline-trigger.md` | Orchestrator task definition with full SDK config |
| `run-pipeline.sh` | Shell bootstrap for environment setup |

## Agent SDK Configuration Summary

Every agent and the orchestrator specifies all Claude Agent SDK fields:

| Field | Auditor | Engineer | Reviewer | Consolidator | Orchestrator |
|-------|---------|----------|----------|--------------|--------------|
| `model` | haiku | sonnet | opus | sonnet | haiku |
| `tools` | R/Glob/Grep/Bash | R/Glob/Grep/Edit/Write/Bash | R/Glob/Grep/Bash | R/Glob/Grep/Edit/Write/Bash | R/Write/Bash/Task/Glob |
| `maxTurns` | 30 | 40 | 35 | 30 | 20 |
| `memory` | false | false | false | false | false |
| `mcpServers` | none | none | none | none | none |
| `hooks` | none | none | none | none | none |
| `skills` | none | none | none | none | none |

## Portability

All agent prompts use `{{REPO_ROOT}}` placeholders instead of hardcoded paths. The orchestrator resolves these at runtime via `git rev-parse --show-toplevel`. The pipeline works in any clone location.

## How to Run

### Option A: Direct Claude Code invocation
```
Run the repo hygiene pipeline: read and execute scripts/agents/pipeline-trigger.md
```

### Option B: Shell bootstrap first
```bash
# With human approval gates (default)
bash scripts/agents/run-pipeline.sh

# Without human approval gates
bash scripts/agents/run-pipeline.sh --auto

# Dry run — Auditor only, no mutations, just health report
bash scripts/agents/run-pipeline.sh --dry-run
```

## Human Approval Gates

The pipeline has two approval checkpoints:

1. **Per-change approval** (Agent 2): Category C (content alignment) and Category D (CLAUDE.md updates) require explicit human confirmation before applying.
2. **Phase gate approval** (between Phase 2→3): After all Engineer changes, the orchestrator shows a summary and asks to proceed.

Set `approval_mode` to `"auto"` in `.pipeline/config.json` (or use `--auto` flag) to skip these gates.

## Health Comparison Output

The pipeline produces a before/after health comparison with:
- **Scorecard table**: 6 metrics with before/after/delta columns
- **ASCII bar visualization**: proportional bars showing improvement
- **Letter grade**: A-F based on weighted metric average

Example output:
```
Broken refs     ██████████░░░░░░░░░░ → ████░░░░░░░░░░░░░░░░  10 → 4  (-60%)
Tree drift      ████████░░░░░░░░░░░░ → ██░░░░░░░░░░░░░░░░░░   8 → 2  (-75%)
Spec conflicts  ██░░░░░░░░░░░░░░░░░░ → ░░░░░░░░░░░░░░░░░░░░   2 → 0 (-100%)
CLAUDE.md acc   ████████████░░░░░░░░ → ██████████████████░░  60%→ 90% (+30%)
Term consist.   ██████████████░░░░░░ → ████████████████████  70%→100% (+30%)
Nav friction    ████████████████░░░░ → ██████████████████░░   8 → 9   (+1)

Overall: D → B
```

## Artifacts

All pipeline artifacts are written to `.pipeline/artifacts/` (gitignored):

| Artifact | Agent | Format | Key Data |
|----------|-------|--------|----------|
| `01-auditor-findings.json` | Auditor | JSON | Findings + `health_baseline` |
| `02-engineer-changes.json` | Engineer | JSON | Changes + approval status |
| `03-reviewer-comments.json` | Reviewer | JSON | Comments + `health_snapshot_after` |
| `04-change-summary.md` | Consolidator | Markdown | Human-readable summary + visualization |
| `04-consolidator-log.json` | Consolidator | JSON | `health_comparison` with grades |

## Safety Guarantees

- Never modifies code files (`.ts`, `.tsx`, `.js`, `.css`)
- Never modifies `spec/DECISIONS.md`
- Never changes spec policy or requirements
- Documentation and plumbing changes only
- Every destructive change has a reversible diff annotation
- Human approval required for content/CLAUDE.md changes (unless `--auto`)
