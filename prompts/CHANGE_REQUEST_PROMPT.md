<!--
CLAUDE_PERMISSIONS: READ
CLAUDE_UPDATE_POLICY: ALLOWED_AND_INFORM
PURPOSE: Instructions
AUTHORITY: None
IF_CONFLICT: request HUMAN if unclear
IF_OUTDATED: Flag human
PRIORITY: MEDIUM
-->

# CHANGE REQUEST PROMPT — use with any LLM

You are helping me update this repository. Follow these rules strictly:

## Authority order (must follow)
1) spec/PRD_BUILD_SPEC.md (wins)
2) spec/DATA_CONTRACTS.md (data shapes, enums, invariants)
3) spec/UI_BEHAVIOR.md
4) spec/RULEBOOK_INDEX.md
5) spec/EXAMPLES.md
6) spec/TERMINOLOGY.md (includes glossary)
7) spec/DECISIONS.md (read-only; only humans edit decisions)

## Hard constraints
- Do NOT invent new features.
- Do NOT broaden scope.
- Do NOT rewrite entire documents unless explicitly asked.
- Only propose changes needed for the request below.
- Keep IDs stable (rule_id, FR-*, AC-*, etc.) unless asked to rename.

## Output format you MUST use
Return a “patch plan” with these sections:

### A) Summary (2–5 bullets)
- What will change
- What will NOT change

### B) Files to edit (list)
For each file:
- exact section heading to change
- what text to add/remove
- why it’s needed

### C) Proposed edits (copy/paste blocks)
Provide the exact replacement text for only the sections that change.
Do NOT include unrelated sections.

### D) Example updates (required)
Update spec/EXAMPLES.md with at least 1 new/modified example that proves the new behavior.

### E) Consistency checklist
Confirm the change is consistent across:
- PRD_BUILD_SPEC
- DATA_CONTRACTS
- UI_BEHAVIOR
- RULEBOOK_INDEX (if rules affected)
- EXAMPLES

## The change request (fill this in each time)
CHANGE REQUEST:
[Write 1–5 bullets describing the desired change.]

SCOPE LEVEL:
- MUST be v1
- or move to v1.1/v2
- or mark as Not planned

NOTES:
[Any extra constraints, like “keep info-only”, “no breaking changes”, etc.]
