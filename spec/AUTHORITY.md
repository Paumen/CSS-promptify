<!--
CLAUDE_PERMISSIONS: READ | FOLLOW | SUGGEST
CLAUDE_UPDATE_POLICY: STRICTLY_DISALLOWED
PURPOSE: Authoritative Reference
AUTHORITY: None
IF_CONFLICT: N/A
IF_OUTDATED: Flag human
PRIORITY: CRITICAL
-->

# Document Authority

This file defines the **single source of truth** for document hierarchy and conflict resolution in this repository.

---

## Meta-Governance Documents

The following documents sit above the ranked hierarchy. They are not ranked but govern the system itself:

- **`spec/AUTHORITY.md`** (this file): Defines document hierarchy and content conflict resolution.
- **`spec/COMMENT_HEADERS.md`**: Defines the metadata header system (permissions, update policies, priority).

If these two documents conflict with each other, escalate to a human.

---

## Document Hierarchy (conflicts resolved top-to-bottom)

| Rank | File | Role | LLM Policy |
|------|------|------|------------|
| 1 | `spec/PRD_BUILD_SPEC.md` | **Primary source of truth** - requirements, constraints, acceptance criteria | Read + follow strictly |
| 2 | `spec/DATA_CONTRACTS.md` | Data shapes, enums, invariants, recompute model, conflict handling | Read + match exactly |
| 3 | `spec/UI_BEHAVIOR.md` | UI state, interactions, user flows | Read + implement as specified |
| 4 | `spec/UI_STYLE_GUIDE.md` | Visual styling rules, tokens, CSS maintainability constraints | Read + follow for UI styling |
| 5 | `spec/RULEBOOK_INDEX.md` | Rule catalog with metadata | Read + implement each rule |
| 6 | `spec/EXAMPLES.md` | Before/after test cases | Read + validate against |
| 7 | `spec/TYPES.md` | TypeScript interfaces (single source for types) | Read + use for type safety |
| 8 | `spec/TERMINOLOGY.md` | Standardized terms + glossary | Read + use consistently |
| 9 | `spec/DECISIONS.md` | Decision log | **Read-only** - never modify |

---

## Conflict Resolution Rules

1. **If two specs conflict**: Higher-ranked document wins
2. **If spec and code conflict**: Spec wins; fix the code
3. **If example contradicts spec**: Spec wins; fix the example
4. **If unclear**: Ask for clarification before proceeding
5. **Session vs product scope**: `PRD_BUILD_SPEC.md` is authoritative for product requirements. `prompts/SYSTEM_PROMPT.md` and `CLAUDE.md` govern LLM session behavior only and do not override product specifications. If session instructions contradict product specs, product specs win.

---

## Canonical Reading Order (for implementation)

When starting work or building context, read files in this order:

```
1. CLAUDE.md                          (quick orientation)
2. spec/AUTHORITY.md                  (this file - hierarchy)
3. spec/COMMENT_HEADERS.md            (header governance system)
4. spec/PRD_BUILD_SPEC.md             (requirements)
5. spec/DATA_CONTRACTS.md             (data shapes, enums, invariants)
6. spec/UI_BEHAVIOR.md                (UI specification)
7. spec/RULEBOOK_INDEX.md             (rules)
8. spec/EXAMPLES.md                   (test cases)
9. spec/TYPES.md                      (TypeScript)
10. spec/TERMINOLOGY.md               (standard terms + glossary)
11. spec/DECISIONS.md                 (context - read-only)
```

---

## File Purposes

### Meta-Governance

- **AUTHORITY.md**: Document hierarchy and conflict resolution (this file)
- **COMMENT_HEADERS.md**: Header governance system — permissions, update policies, priority definitions

### Core Specifications

- **PRD_BUILD_SPEC.md**: What to build, why, constraints, acceptance criteria
- **DATA_CONTRACTS.md**: Exact data shapes, enums, invariants, recompute model, conflict handling (single source of truth for these)
- **UI_BEHAVIOR.md**: How the UI behaves, user interactions
- **RULEBOOK_INDEX.md**: Every rule with metadata (severity, fixability, applies_to)

### Supporting Documents

- **EXAMPLES.md**: Concrete before/after cases (serve as tests)
- **TYPES.md**: TypeScript interfaces matching DATA_CONTRACTS (single source for TypeScript types)
- **TERMINOLOGY.md**: Which terms to use (and which to avoid) + glossary definitions

### Reference (Read-Only)

- **DECISIONS.md**: Why decisions were made (human-edited only)

### Non-Spec Documents (unranked)

The following documents are not part of the ranked spec hierarchy. If two non-spec documents conflict, resolve by priority level (CRITICAL > HIGH > MEDIUM > LOW). If priority is equal, escalate to a human.

| File | Role    | Priority |
|------|---------|----------|
| `CLAUDE.md` | Instructions (Claude Code entry point) | CRITICAL |
| `prompts/SYSTEM_PROMPT.md` | Instructions (LLM session behavior) | CRITICAL |
| `prompts/IMPLEMENTATION_CHECKLIST.md` | Instructions (phased dev guide) | HIGH |
| `prompts/WORKFLOW.md` | Instructions (LLM workflow) | MEDIUM |
| `prompts/CHANGE_REQUEST_PROMPT.md` | Instructions (change template) | MEDIUM |
| `README.md` | Project overview | MEDIUM |
| `docs/ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md` | Human-Only (RCA) | MEDIUM |
| `tests/RULES_VALIDATION_REPORT.md` | Validation report | MEDIUM |
| `app/README.md` | App setup guide | LOW |
| `tests/RULES_VALIDATION_REPORT_HUMAN.md` | Human-Only (validation) | LOW |

### Archived/Removed

- ~~GLOSSARY.md~~: Merged into TERMINOLOGY.md (2026-01-31)
- ~~OPEN_QUESTIONS.md~~: Deleted - all questions resolved, see DECISIONS.md (2026-01-31)

---

## LLM Instructions

### DO

- Follow hierarchy strictly
- Match data shapes exactly
- Validate against examples
- Ask if unclear
- Update specs before changing behavior

### DO NOT

- Invent features not in spec
- Change DECISIONS.md
- Resolve OPEN_QUESTIONS without human input
- Ignore invariants (ever)
- Assume behavior not specified

---

END
