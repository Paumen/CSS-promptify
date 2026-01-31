<!--
STATUS: Authoritative reference for document hierarchy
LLM_POLICY: Follow this hierarchy strictly. If documents conflict, higher-ranked document wins.
-->

# Document Authority

This file defines the **single source of truth** for document hierarchy and conflict resolution in this repository.

---

## Document Hierarchy (conflicts resolved top-to-bottom)

| Rank | File | Role | LLM Policy |
|------|------|------|------------|
| 1 | `spec/PRD_BUILD_SPEC.md` | **Primary source of truth** - requirements, constraints, acceptance criteria | Read + follow strictly |
| 2 | `spec/DATA_CONTRACTS.md` | Data shapes, invariants, validation rules | Read + match exactly |
| 3 | `spec/UI_BEHAVIOR.md` | UI state, interactions, user flows | Read + implement as specified |
| 4 | `spec/UI_STYLE_GUIDE.md` | Visual styling rules, tokens, CSS maintainability constraints | Read + follow for UI styling |
| 5 | `spec/RULEBOOK_INDEX.md` | Rule catalog with metadata | Read + implement each rule |
| 6 | `spec/EXAMPLES.md` | Before/after test cases | Read + validate against |
| 7 | `spec/TYPES.md` | TypeScript interfaces | Read + use for type safety |
| 8 | `spec/PROPERTY_SORT_ORDER.md` | Property sorting specification | Read + implement order |
| 9 | `spec/TERMINOLOGY.md` | Standardized terms | Read + use consistently |
| 10 | `spec/GLOSSARY.md` | Definitions | Read + reference |
| 11 | `spec/DECISIONS.md` | Decision log | **Read-only** - never modify |
| 12 | `spec/OPEN_QUESTIONS.md` | Unresolved questions | Read + await human decision |

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
4. spec/DATA_CONTRACTS.md             (data shapes)
5. spec/UI_BEHAVIOR.md                (UI specification)
6. spec/RULEBOOK_INDEX.md             (rules)
7. spec/EXAMPLES.md                   (test cases)
8. spec/TYPES.md                      (TypeScript)
9. spec/TERMINOLOGY.md                (standard terms)
10. spec/GLOSSARY.md                  (definitions)
11. spec/DECISIONS.md                 (context - read-only)
12. spec/OPEN_QUESTIONS.md            (pending decisions)
```

---

## File Purposes

### Core Specifications
- **PRD_BUILD_SPEC.md**: What to build, why, constraints, acceptance criteria
- **DATA_CONTRACTS.md**: Exact data shapes, enums, invariants
- **UI_BEHAVIOR.md**: How the UI behaves, user interactions
- **RULEBOOK_INDEX.md**: Every rule with metadata (severity, fixability, applies_to)

### Supporting Documents
- **EXAMPLES.md**: Concrete before/after cases (serve as tests)
- **TYPES.md**: TypeScript interfaces matching DATA_CONTRACTS
- **PROPERTY_SORT_ORDER.md**: Canonical property ordering for sort rule
- **TERMINOLOGY.md**: Which terms to use (and which to avoid)
- **GLOSSARY.md**: Brief definitions of key concepts

### Reference (Read-Only)
- **DECISIONS.md**: Why decisions were made (human-edited only)
- **OPEN_QUESTIONS.md**: Questions awaiting human decision

---

## LLM Instructions

### DO:
- Follow hierarchy strictly
- Match data shapes exactly
- Validate against examples
- Ask if unclear
- Update specs before changing behavior

### DO NOT:
- Invent features not in spec
- Change DECISIONS.md
- Resolve OPEN_QUESTIONS without human input
- Ignore invariants (ever)
- Assume behavior not specified

---

END
