# Four-Agent Repo Hygiene Pipeline

A linear-gated pipeline with four specialized Claude agents for maintaining repository coherence, documentation accuracy, and LLM discoverability.

## Architecture

```
Auditor (read-only) → Engineer (mutating) → Reviewer (adversarial) → Consolidator (fix+summary)
   haiku                 sonnet                 opus                    sonnet
```

## Why This Decomposition

The dominant failure mode in agentic repo maintenance is **self-reinforcing drift**: agents that both read and write gradually normalize their own mistakes. This pipeline prevents that by:

1. **Separating observation from mutation** — the Auditor never writes, the Engineer never interprets.
2. **Adversarial validation** — the Reviewer assumes the Engineer is wrong and tries to prove it.
3. **Artifact-only communication** — no shared conversational context between agents.

## Files

| File | Purpose |
|------|---------|
| `01-repo-auditor.md` | Agent 1 prompt: read-only analyzer, produces findings JSON |
| `02-structure-engineer.md` | Agent 2 prompt: applies fixes from auditor findings |
| `03-adversarial-reviewer.md` | Agent 3 prompt: adversarial critic, produces blocking comments |
| `04-fix-consolidator.md` | Agent 4 prompt: applies reviewer fixes, generates summary |
| `pipeline-trigger.md` | Orchestrator specification with execution instructions |
| `run-pipeline.sh` | Shell bootstrap script for environment setup |

## How to Run

### Option A: Direct Claude Code invocation
```
Run the four-agent repo hygiene pipeline defined in scripts/agents/pipeline-trigger.md
```

### Option B: Shell bootstrap first
```bash
bash scripts/agents/run-pipeline.sh
# Then follow the printed instructions in Claude Code
```

## Artifacts

All pipeline artifacts are written to `.pipeline/artifacts/` (gitignored):

| Artifact | Agent | Format |
|----------|-------|--------|
| `01-auditor-findings.json` | Auditor | Structured findings |
| `02-engineer-changes.json` | Engineer | Change log with diffs |
| `03-reviewer-comments.json` | Reviewer | Blocking/non-blocking comments |
| `04-change-summary.md` | Consolidator | Human-readable summary |
| `04-consolidator-log.json` | Consolidator | Machine-readable log |

## Safety Guarantees

- Never modifies code files (`.ts`, `.tsx`, `.js`, `.css`)
- Never modifies `spec/DECISIONS.md`
- Never changes spec policy or requirements
- Documentation and plumbing changes only
- Every destructive change has a reversible diff annotation
