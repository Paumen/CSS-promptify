<llm_policy>
Follow this hierarchy strictly. If documents conflict, the higher-ranked document wins.
</llm_policy>
<!--
STATUS: Authoritative reference for document hierarchy
-->

# Document Authority

This file defines the **single source of truth** for document hierarchy and conflict resolution in this repository.

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
| 8 | `spec/PROPERTY_SORT_ORDER.md` | Property sorting specification | Read + implement order |
| 9 | `spec/TERMINOLOGY.md` | Standardized terms + glossary | Read + use consistently |
| 10 | `spec/DECISIONS.md` | Decision log | **Read-only** - never modify |

---

## Conflict Resolution Rules

1. **If two specs conflict**: Higher-ranked document wins
2. **If spec and code conflict**: Spec wins; fix the code
3. **If example contradicts spec**: Spec wins; fix the example
4. **If unclear**: Ask for clarification before proceeding

---

## Canonical Reading Order (for implementation)

When starting work or building context, read files in this order:

```
1. CLAUDE.md                          (quick orientation)
2. spec/AUTHORITY.md                  (this file - hierarchy)
3. spec/PRD_BUILD_SPEC.md             (requirements)
4. spec/DATA_CONTRACTS.md             (data shapes, enums, invariants)
5. spec/UI_BEHAVIOR.md                (UI specification)
6. spec/RULEBOOK_INDEX.md             (rules)
7. spec/EXAMPLES.md                   (test cases)
8. spec/TYPES.md                      (TypeScript)
9. spec/TERMINOLOGY.md                (standard terms + glossary)
10. spec/DECISIONS.md                 (context - read-only)
```

---

## File Purposes

### Core Specifications

- **PRD_BUILD_SPEC.md**: What to build, why, constraints, acceptance criteria
- **DATA_CONTRACTS.md**: Exact data shapes, enums, invariants, recompute model, conflict handling (single source of truth for these)
- **UI_BEHAVIOR.md**: How the UI behaves, user interactions
- **RULEBOOK_INDEX.md**: Every rule with metadata (severity, fixability, applies_to)

### Supporting Documents

- **EXAMPLES.md**: Concrete before/after cases (serve as tests)
- **TYPES.md**: TypeScript interfaces matching DATA_CONTRACTS (single source for TypeScript types)
- **PROPERTY_SORT_ORDER.md**: Canonical property ordering for sort rule
- **TERMINOLOGY.md**: Which terms to use (and which to avoid) + glossary definitions

### Reference (Read-Only)

- **DECISIONS.md**: Why decisions were made (human-edited only)

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
