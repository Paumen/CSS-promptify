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
**Rationale:** Users need control and trust; applied changes must be inspectable and reversible.  
**Consequences:** The system tracks applied fixes (with original text) to support clean revert.

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
**Consequences:** Stats are recalculated after apply/revert and are consistent/repeatable.

END
``
