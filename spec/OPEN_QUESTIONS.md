<!--
STATUS: Questions requiring human decision
LLM_POLICY: Do NOT resolve these questions. Present options and await human decision.
-->

# Open Questions

This document tracks questions that require human decision before implementation can proceed.
LLMs should NOT make these decisions—present options and wait for human input.

---

## Status Legend

| Status | Meaning |
|--------|---------|
| OPEN | Awaiting human decision |
| DECIDED | Human has decided (see DECISIONS.md) |
| DEFERRED | Postponed to future version |

---

## Q1: Token Estimation Method

**Status:** DECIDED
**Blocking:** Phase 2.5 (Statistics)
**Context:** FR-STAT-02 says "exact tokenizer not required in v1"

**Question:** Which token estimation method should v1 use?

**Decision:** Character-based heuristic (`tokens ≈ characters / 4`) for v1. Exact tokenization deferred to v2.

See: `spec/DECISIONS.md` — 2026-01-30 — Token estimation is character-based in v1

---

## Q2: Single-Prop Single-Line Default

**Status:** DECIDED
**Blocking:** Phase 1.4 (Format Rules)
**Context:** PRD Open Questions #2 vs RULEBOOK_INDEX conflict

**Question:** Should `format/single-prop-single-line` be enabled by default?

**Decision:** Option 3 — Info-only by default (enabled but severity is `info`, won't auto-select as a fix to apply).

See: `spec/DECISIONS.md` — 2026-01-30 — Single-prop single-line is info-only by default

---

## Q3: Default Severity for Format Rules

**Status:** DECIDED
**Blocking:** Phase 1.4 (Format Rules)
**Context:** PRD Open Questions #1

**Question:** Should format rules default to `warning` or `error`?

**Decision:** Option 1 — `warning` for now. Specific defaults per rule will be set later.

See: `spec/DECISIONS.md` — 2026-01-30 — Format rules default to warning

---

## Q4: Conflict Resolution UX

**Status:** DECIDED
**Blocking:** Phase 2.3 (Conflict Detection)
**Context:** DATA_CONTRACTS 4.5 allows two options

**Question:** How should conflicting fixes be handled in the UI?

**Decision:** Option A — Prevent selecting both conflicting fixes; show notice explaining the conflict.

See: `spec/DECISIONS.md` — 2026-01-30 — Conflicts prevent selection (Option A)

---

## Q5: Tech Stack Confirmation

**Status:** DECIDED
**Blocking:** Phase 0.2 (Application Scaffolding)
**Context:** .gitignore suggests React/Node.js but no explicit decision

**Question:** What is the confirmed tech stack for v1?

**Decision:**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **CSS Parser:** css-tree (see Q6)
- **State Management:** React Context or Zustand
- **Styling:** CSS (plain CSS or CSS Modules, not Tailwind)
- **Testing:** Vitest + React Testing Library

See: `spec/DECISIONS.md` — 2026-01-30 — v1 tech stack confirmed

---

## Q6: CSS Parser Choice

**Status:** DECIDED
**Blocking:** Phase 1.1 (CSS Parser Integration)
**Context:** Need parser with modern CSS support and location tracking

**Question:** Which CSS parser should v1 use?

**Decision:** css-tree — Best balance of setup effort, AST detail, location tracking, and modern CSS support.

| Parser | Setup Effort | Bundle Size | Selected |
|--------|--------------|-------------|----------|
| css-tree | Low | ~150KB | ✅ |
| postcss | Low | ~50KB | ❌ (less detailed AST) |
| lightningcss | Medium | ~200KB WASM | ❌ (WASM complexity) |

See: `spec/DECISIONS.md` — 2026-01-30 — CSS parser is css-tree

---

## Q7: Property Sort Order Mode Default

**Status:** DECIDED
**Blocking:** Phase 1.4 (Format Rules)
**Context:** PROPERTY_SORT_ORDER.md defines two modes

**Question:** Which sort mode should be the default?

**Decision:** Option 1 — `grouped` mode (properties sorted by logical category).

See: `spec/DECISIONS.md` — 2026-01-30 — Property sort default is grouped mode

---

## Q8: Maximum Input Size

**Status:** DECIDED
**Blocking:** Phase 4.3 (Edge Cases)
**Context:** FR-IN-02 mentions file upload but no size limit

**Question:** What is the maximum CSS input size for v1?

**Decision:** 100KB maximum. Primary input method is copy-paste (not file upload). Show warning above 50KB.

See: `spec/DECISIONS.md` — 2026-01-30 — Maximum input size is 100KB

---

## Q9: UI Layout - Immediate vs Commit

**Status:** DECIDED
**Blocking:** Phase 3.6 (Fix Selection)
**Context:** UI_BEHAVIOR 6.2 allows two variants

**Question:** Should output update immediately on fix selection or require explicit commit?

**Decision:** Variant A — Output updates immediately as user checks/unchecks fixes.

See: `spec/DECISIONS.md` — 2026-01-30 — Fix selection updates output immediately

---

---

# New Questions (2026-01-31 Spec Review)

The following questions were identified during a comprehensive spec review.
See `spec/SPEC_REVIEW.md` for full context.

---

## Q10: Rule ID Naming Convention

**Status:** OPEN
**Blocking:** Phase 1 (all rule implementations)
**Context:** Inconsistent prefix usage across documents

**Question:** Which naming pattern is canonical?

| Pattern | Examples | Used By |
|---------|----------|---------|
| Verb prefix | `consolidate/shorthand-*` | RULEBOOK_INDEX |
| Noun prefix | `consolidation/shorthand-*` | test-cases.json |

**Options:**
- A: Verb form consistently (`consolidate/`, `format/`)
- B: Noun form consistently (`consolidation/`, `format/`, `tokens/`)
- C: Keep current mixed approach

---

## Q11: format/single-prop-single-line Trigger Condition

**Status:** OPEN
**Blocking:** Phase 1.4 (Format Rules)
**Context:** EXAMPLES.md Example 2 and test-cases.json example-2 conflict

**Question:** When does this rule fire?

**Options:**
- A: Fire when a multi-line single-prop block COULD be collapsed (suggests change)
- B: Fire to confirm a single-prop block IS correctly formatted (informational)
- C: Always fire for single-prop blocks regardless of current format

---

## Q12: File Upload in v1

**Status:** OPEN
**Blocking:** Phase 3.2 (Input View)
**Context:** PRD FR-IN-02 says "file upload" but DECISIONS.md says "copy-paste primary"

**Question:** Include file upload in v1?

**Options:**
- A: Yes, as secondary input method
- B: No, defer to v1.1 (update PRD FR-IN-02)

---

## Q13: Missing Rules - Add or Remove?

**Status:** OPEN
**Blocking:** Phase 1 (Rule implementations)
**Context:** These rules appear in docs but not RULEBOOK_INDEX.md

Rules in question:
1. `consolidation/merge-adjacent-identical-selectors`
2. `modern/container-queries-guidance`
3. `modern/light-dark-guidance`
4. `modern/suggest-logical-properties`

**Question:** For each rule:
- A: Add to RULEBOOK_INDEX.md (Tier 1 or 2)
- B: Add to RULEBOOK_INDEX.md (Tier 3 - deferred)
- C: Remove from other documents

---

## Q14: education/explain-rule-logic Classification

**Status:** OPEN
**Blocking:** Phase 1.2 (Rule Engine)
**Context:** Listed as rule in RULEBOOK_INDEX but described as UI feature in EXAMPLES.md

**Question:** Is this a rule or a UI feature?

**Options:**
- A: Remove from RULEBOOK_INDEX (UI feature, not a rule)
- B: Keep in RULEBOOK_INDEX as meta-rule

---

END
