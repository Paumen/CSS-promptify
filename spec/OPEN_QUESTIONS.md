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
| DECIDED | Human has decided (move to DECISIONS.md) |
| DEFERRED | Postponed to future version |

---

## Q1: Token Estimation Method

**Status:** OPEN
**Blocking:** Phase 2.5 (Statistics)
**Context:** FR-STAT-02 says "exact tokenizer not required in v1"

**Question:** Which token estimation method should v1 use?

**Options:**
1. **cl100k_base approximation** - Match GPT-4/Claude tokenizer roughly
2. **Character-based heuristic** - `tokens ≈ characters / 4`
3. **Word-based heuristic** - `tokens ≈ words * 1.3`
4. **Configurable** - Let user choose tokenizer model

**Recommendation:** Option 2 (character-based) for simplicity in v1.

**Decision:** _Awaiting human input_

---

## Q2: Single-Prop Single-Line Default

**Status:** OPEN
**Blocking:** Phase 1.4 (Format Rules)
**Context:** PRD Open Questions #2 vs RULEBOOK_INDEX conflict

**Question:** Should `format/single-prop-single-line` be enabled by default?

**Current State:**
- PRD lists this as "open question"
- RULEBOOK_INDEX says `enabled_by_default: true`

**Options:**
1. **Enabled by default** (RULEBOOK says yes)
2. **Disabled by default** (conservative)
3. **Info-only by default** (enabled but won't auto-select)

**Recommendation:** Option 1 (enabled) - it's a safe formatting preference.

**Decision:** _Awaiting human input_

---

## Q3: Default Severity for Format Rules

**Status:** OPEN
**Blocking:** Phase 1.4 (Format Rules)
**Context:** PRD Open Questions #1

**Question:** Should format rules default to `warning` or `error`?

**Current State:**
- PRD lists this as "open question"
- RULEBOOK_INDEX shows `warning` for most format rules

**Options:**
1. **warning** (current RULEBOOK default) - recommendation, not mandatory
2. **error** - treated as must-fix for "clean" output
3. **info** - purely educational

**Recommendation:** Option 1 (warning) - strong recommendation without being blocking.

**Decision:** _Awaiting human input_

---

## Q4: Conflict Resolution UX

**Status:** OPEN
**Blocking:** Phase 2.3 (Conflict Detection)
**Context:** DATA_CONTRACTS 4.5 allows two options

**Question:** How should conflicting fixes be handled in the UI?

**Options:**
1. **Option A (prevent):** Cannot select both conflicting fixes; show notice
2. **Option B (resolve):** Allow selection; apply deterministic resolution; show notice

**Trade-offs:**
- Option A: Simpler UX, user must choose
- Option B: More flexible, but harder to understand

**Recommendation:** Option A for v1 simplicity.

**Decision:** _Awaiting human input_

---

## Q5: Tech Stack Confirmation

**Status:** OPEN
**Blocking:** Phase 0.2 (Application Scaffolding)
**Context:** .gitignore suggests React/Node.js but no explicit decision

**Question:** What is the confirmed tech stack for v1?

**Proposed Stack:**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **CSS Parser:** TBD (see Q6)
- **State Management:** React Context or Zustand
- **Styling:** CSS Modules or Tailwind
- **Testing:** Vitest + React Testing Library

**Alternatives:**
- Next.js (adds SSR complexity, not needed for paste/copy tool)
- Solid.js (smaller but less ecosystem)
- Vue (different paradigm)

**Decision:** _Awaiting human input_

---

## Q6: CSS Parser Choice

**Status:** OPEN
**Blocking:** Phase 1.1 (CSS Parser Integration)
**Context:** Need parser with modern CSS support and location tracking

**Question:** Which CSS parser should v1 use?

**Options:**

| Parser | Pros | Cons |
|--------|------|------|
| **css-tree** | Full spec compliance, good AST | Larger bundle |
| **postcss** | Plugin ecosystem, widely used | AST less detailed |
| **lightningcss** | Fast, Rust-based, modern CSS | WASM complexity |
| **csstree** | Detailed AST, good errors | Less maintained |

**Requirements:**
- Location tracking (line/column)
- Modern CSS support (container queries, :has(), etc.)
- Graceful error handling
- Reasonable bundle size

**Recommendation:** css-tree for best AST detail and spec compliance.

**Decision:** _Awaiting human input_

---

## Q7: Property Sort Order Mode Default

**Status:** OPEN
**Blocking:** Phase 1.4 (Format Rules)
**Context:** PROPERTY_SORT_ORDER.md defines two modes

**Question:** Which sort mode should be the default?

**Options:**
1. **grouped** - Properties sorted by logical category
2. **alphabetical** - Properties sorted A-Z

**Recommendation:** Option 1 (grouped) - better for understanding CSS structure.

**Decision:** _Awaiting human input_

---

## Q8: Maximum Input Size

**Status:** OPEN
**Blocking:** Phase 4.3 (Edge Cases)
**Context:** FR-IN-02 mentions file upload but no size limit

**Question:** What is the maximum CSS input size for v1?

**Options:**
1. **10KB** - Small, fast, covers most component CSS
2. **100KB** - Medium, covers most single files
3. **1MB** - Large, covers framework CSS
4. **No limit** - Browser memory is the limit

**Considerations:**
- Performance impact on analysis
- Memory usage in browser
- Typical use case (component CSS vs. full framework)

**Recommendation:** Option 2 (100KB) with warning above 50KB.

**Decision:** _Awaiting human input_

---

## Q9: UI Layout - Immediate vs Commit

**Status:** OPEN
**Blocking:** Phase 3.6 (Fix Selection)
**Context:** UI_BEHAVIOR 6.2 allows two variants

**Question:** Should output update immediately on fix selection or require explicit commit?

**Options:**
1. **Variant A (immediate):** Output updates as user checks/unchecks fixes
2. **Variant B (commit):** User checks fixes, then clicks "Apply selected"

**Trade-offs:**
- Variant A: More interactive, instant feedback
- Variant B: More deliberate, batch changes

**Recommendation:** Variant A for better UX responsiveness.

**Decision:** _Awaiting human input_

---

## How to Resolve Questions

1. Human reviews options and trade-offs
2. Human makes decision and states rationale
3. Update this file: change status to DECIDED
4. Add decision to `spec/DECISIONS.md` with date and rationale
5. Update relevant spec files if needed
6. Implementation can proceed

---

END
