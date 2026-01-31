<!--
STATUS: Human decision log
SOURCE OF TRUTH: Human decisions in this file are final unless explicitly changed by a human
LLM_POLICY: Read-only. Do not add, remove, or change decisions. You may suggest wording improvements only.
-->

# Decisions (ADR-lite)

These are short “why” records to prevent revisiting settled choices and to keep LLM-assisted work aligned.

Format:
- Date (YYYY-MM-DD)
- Decision
- Rationale
- Consequences

---

## 2026-01-29 — v1 is Web UI-first
**Decision:** Build v1 as a web UI (mobile-friendly) first.  
**Rationale:** The product requires explanation, filtering, diff preview, selective apply/revert, and comment toggling, which are best expressed visually.  
**Consequences:** CLI support is deferred (v1.1+).

---

## 2026-01-29 — v1 settings are session-only
**Decision:** Rule toggles, severities, and parameters are session-only in v1 (reset on refresh).  
**Rationale:** Keeps MVP simple and avoids profile persistence complexity early.  
**Consequences:** v2 may add saved profiles and parameter presets.

---

## 2026-01-29 — No code editing (paste/copy tool)
**Decision:** v1 is paste → analyze → select fixes → copy output. No manual code editing workflow beyond paste.  
**Rationale:** Keeps UX simple, reduces implementation complexity, and makes mobile usage easier.  
**Consequences:** UI can be split into simple screens/tabs (Input / Fixes / Output / Settings).

---

## 2026-01-29 — Apply/revert uses recompute-from-original
**Decision:** Apply/revert is implemented by recomputing output from original input + selected fixes (deterministic).  
**Rationale:** Makes revert trivial (unselect and recompute), avoids complex undo stacks, and increases determinism.  
**Consequences:** Conflicts and apply-order must be handled deterministically and be visible to the user.

---

## 2026-01-29 — Default formatting is structure-first (not minified)
**Decision:** Default output keeps clear structure (two spaces, predictable line breaks).  
**Rationale:** Minimum tokens via minification harms LLM understanding of hierarchy and intent; structure improves LLM outcomes.  
**Consequences:** Token reduction is achieved via explicit rules (tabs→spaces, shorthands, safe value shortening) rather than minification.

---

## 2026-01-29 — Unrecognized properties are info-only
**Decision:** Properties not recognized by the tool are reported as **info**, never warning/error in v1.  
**Rationale:** Avoid the “outdated linter” failure mode and false errors as CSS evolves.  
**Consequences:** Tool remains future-friendly; rulebook must be explicit about applicability.

---

## 2026-01-29 — Rules must declare applicability
**Decision:** Each rule must explicitly declare where it applies (properties/contexts).  
**Rationale:** Prevent rules from firing on properties they were not intended for (reduces noise and incorrect suggestions).  
**Consequences:** Rulebook entries include `applies_to` and exclusions.

---

## 2026-01-29 — Selective fixes + revert are mandatory
**Decision:** Users must be able to select fixes individually and revert them independently.  
**Rationale:** Users need control and trust; changes must be inspectable and reversible.  
**Consequences:** v1 supports revert by unselecting fixes and recomputing output from the original input.

---

## 2026-01-29 — Inline tool comments are end-of-line style
**Decision:** Tool comments default to end-of-line formatting and are brief.  
**Rationale:** Keeps code compact while preserving structure and making changes explainable.  
**Consequences:** UI includes comment toggle, copy with/without comments, and “remove tool comments” action.

---

## 2026-01-29 — Copy modes are explicit
**Decision:** UI provides separate actions: copy without comments and copy with comments.  
**Rationale:** Users often want explanation during learning/review, but want clean CSS for final use.  
**Consequences:** Copy pipeline must reliably strip only tool comments when requested.

---

## 2026-01-29 — Stats include tokens + lines + characters
**Decision:** Display token estimate, line count, and character count before/after.  
**Rationale:** Users need visibility into “LLM friendliness” and compactness improvements.  
**Consequences:** Stats are recalculated after select/unselect (apply/revert) and are consistent/repeatable.

---

## 2026-01-29 — Property sorting is in v1 (info-only, enabled by default)
**Decision:** Include property sorting in v1 as a safe selectable fix with default severity **info** and enabled by default.  
**Rationale:** Helps produce predictable, structured output without forcing a warning/error-level opinion.  
**Consequences:** Sorting must be deterministic; users can choose whether to apply the fix.

---

## 2026-01-29 — Not planned features
**Decision:** These are not planned for v1, v2, v3 (unless explicitly changed later by a human decision):
- Auth/accounts (logins, user profiles)
- Project-wide analysis (cross-file; CSS+HTML usage; unused selectors)
- Server-side analysis / hosted API (sending CSS to a backend service)
**Rationale:** Not aligned with product direction (simple local paste/select/copy tool).
**Consequences:** Keep scope focused; avoid scope creep into backend/auth and cross-file complexity.

---

## 2026-01-30 — Token estimation is character-based in v1
**Decision:** Use character-based heuristic (`tokens ≈ characters / 4`) for v1. Exact tokenization deferred to v2.
**Rationale:** Simple to implement, sufficient for v1 scope; exact tokenization adds complexity without major user benefit.
**Consequences:** Stats show approximate token counts. v2 may add model-specific tokenizers (cl100k_base, etc.).

---

## 2026-01-30 — Single-prop single-line is info-only by default
**Decision:** `format/single-prop-single-line` is enabled with severity `info` by default.
**Rationale:** Useful formatting suggestion but not critical enough to be warning-level.
**Consequences:** Rule appears in issues list but doesn't pressure user to apply.

---

## 2026-01-30 — Format rules default to warning
**Decision:** Format rules default to `warning` severity. Specific per-rule defaults may be adjusted later.
**Rationale:** Warnings indicate recommendations without blocking; allows flexibility for future fine-tuning.
**Consequences:** Most format issues show as warnings; user can adjust severity in session config.

---

## 2026-01-30 — Conflicts prevent selection (Option A)
**Decision:** Conflicting fixes cannot both be selected. UI shows conflict notice and prevents second selection.
**Rationale:** Simpler UX for v1; user must explicitly choose which fix to apply.
**Consequences:** No need for deterministic conflict resolution logic; conflicts are mutually exclusive.

---

## 2026-01-30 — v1 tech stack confirmed
**Decision:** v1 uses:
- React 18+ with TypeScript
- Vite (build tool)
- css-tree (CSS parser)
- React Context or Zustand (state management)
- Plain CSS or CSS Modules (styling)
- Vitest + React Testing Library (testing)
**Rationale:** Modern, well-supported stack with low complexity; CSS for styling keeps bundle small and matches project philosophy.
**Consequences:** No Tailwind; no Next.js SSR complexity; WASM-free parser.

---

## 2026-01-30 — CSS parser is css-tree
**Decision:** Use css-tree as the CSS parser library.
**Rationale:** Best balance of setup effort (~150KB bundle), detailed AST with location tracking, and modern CSS support. Pure JS (no WASM complexity).
**Consequences:** Can parse container queries, :has(), and modern features; location tracking enables accurate issue reporting.

---

## 2026-01-30 — Property sort default is grouped mode
**Decision:** Default property sort mode is `grouped` (properties sorted by logical category: positioning, layout, typography, colors, etc.).
**Rationale:** Grouped ordering improves CSS readability and understanding of structure.
**Consequences:** See `spec/PROPERTY_SORT_ORDER.md` for the canonical group ordering.

---

## 2026-01-30 — Maximum input size is 100KB
**Decision:** Maximum CSS input size is 100KB. Show warning above 50KB. Primary input method is copy-paste (not file upload).
**Rationale:** Covers most real-world CSS files while maintaining browser performance.
**Consequences:** Very large framework CSS (>100KB) may need to be split; file upload is secondary feature.

---

## 2026-01-30 — Fix selection updates output immediately
**Decision:** Use Variant A: output updates immediately as user checks/unchecks fixes (no "Apply" button).
**Rationale:** More interactive and responsive UX; users see changes instantly.
**Consequences:** Output pane must recompute on every selection change; may need debouncing for performance.

---

## 2026-01-31 — Rule ID naming uses verb prefix
**Decision:** Rule IDs use verb prefix consistently: `consolidate/`, `format/`, `tokenize/` (not noun form like `consolidation/`).
**Rationale:** Consistent naming convention; verb form describes the action being taken.
**Consequences:** Update all docs to use `consolidate/` instead of `consolidation/`.

---

## 2026-01-31 — format/single-prop-single-line fires for collapsible blocks
**Decision:** The `format/single-prop-single-line` rule fires when a multi-line single-prop block COULD be collapsed to one line.
**Rationale:** The rule suggests a change, not just confirms correct formatting.
**Consequences:** Rule fires on multi-line single-prop blocks, suggesting conversion to single-line.

---

## 2026-01-31 — No file upload in v1
**Decision:** v1 is copy-paste only. File upload is deferred to v1.1.
**Rationale:** Keeps v1 scope minimal; copy-paste is sufficient for primary use cases.
**Consequences:** Remove file upload from PRD FR-IN-02.

---

## 2026-01-31 — Missing rules added as Tier 3 (deferred)
**Decision:** Add these rules to RULEBOOK_INDEX.md as Tier 3 (deferred, not in v1):
- `consolidate/merge-adjacent-identical-selectors`
- `modern/container-queries-guidance`
- `modern/light-dark-guidance`
- `modern/suggest-logical-properties`
**Rationale:** They exist in docs but need explicit tracking; defer to post-v1.
**Consequences:** These rules are documented but not implemented in v1.

---

## 2026-01-31 — education/explain-rule-logic is UI feature, not rule
**Decision:** Remove `education/explain-rule-logic` from RULEBOOK_INDEX.md. It's a UI behavior, not a rule.
**Rationale:** This is a UI guarantee (show WHAT/WHY/WHEN SAFE), not a rule that emits issues.
**Consequences:** Remove from rulebook; document as UI behavior in UI_BEHAVIOR.md.

---

## 2026-01-31 — Consolidate specs to reduce duplication
**Decision:** Apply these simplifications:
- TYPES.md is single source for type/enum definitions
- DATA_CONTRACTS.md is single source for invariants, recompute model, conflict handling
- Merge GLOSSARY.md into TERMINOLOGY.md
- Delete OPEN_QUESTIONS.md (all resolved)
- PRD references other docs instead of duplicating
**Rationale:** Reduces maintenance burden and prevents drift between duplicated content.
**Consequences:** Other docs reference authoritative sources instead of duplicating.

END
