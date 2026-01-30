<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# Rulebook Index (v1)

This file is the **catalog of rules**. It lists rule IDs, grouping, defaults, fixability, applicability, and (optionally) rule parameters.  
It exists to keep the tool **modern**, avoid **outdated-linter** behavior, and prevent rules from firing in the wrong context.

> Source of truth: If anything conflicts, `spec/PRD_BUILD_SPEC.md` wins.

---

## 0) Conventions

### 0.1 Fields
Each rule entry contains:

- **rule_id**: stable identifier (do not rename lightly)
- **group**: `modern | consolidation | format | tokens | safety | education`
- **default_severity**: `off | info | warning | error`
- **fixability**: `safe | prompt | none`
- **enabled_by_default**: `true | false` (v1: session-only toggles still start from this default)
- **applies_to**: explicit applicability constraints (properties/contexts)
- **autofix_notes**: conditions for safe auto-fix (if fixability = safe)
- **params**: optional parameters that change behavior (v1 supports session-only)

### 0.2 Applicability rule (important)
Every rule MUST be explicit about where it applies (properties + context) to avoid accidental triggers.

### 0.3 “Unrecognized property” policy
`safety/unrecognized-property` is **info-only** by default and must never block other fixes.

---

## 1) Safety

### safety/invalid-syntax
- **group:** safety
- **default_severity:** error
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: entire file parse result
- **notes:**
  - Emit when CSS cannot be parsed or contains invalid syntax/value combinations detected by parser.

### safety/unrecognized-property
- **group:** safety
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: declaration property names
  - excludes: custom properties (`--*`)
- **notes:**
  - Message: “Info: property not recognized (may be new/experimental).”
  - MUST NOT emit warning/error in v1.
  - Intended to avoid “outdated linter” behavior.

---

## 2) Format (LLM structure-first)

### format/no-tabs
- **group:** format
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: whitespace/indentation in declarations and blocks
- **autofix_notes:**
  - Replace `\t` with spaces according to `format/indent-2-spaces` policy.

### format/indent-2-spaces
- **group:** format
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: indentation of lines inside `{ ... }`
- **params (session):**
  - `indentSize`: number (default 2)
- **autofix_notes:**
  - Normalize indentation to `indentSize` spaces.
  - Preserve semantic structure (no minification).

### format/property-per-line
- **group:** format
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: declaration blocks where multiple declarations appear on one line
- **params (session):**
  - `allowSinglePropSingleLine`: boolean (default true via rule below)
- **autofix_notes:**
  - Split declarations so each property starts on a new line (except if overridden by single-prop rule).

### format/single-prop-single-line
- **group:** format
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: selector blocks with exactly 1 declaration
- **params (session):**
  - `enabled`: boolean (default true)
- **autofix_notes:**
  - If enabled and a block has a single declaration, allow:
    - `.a { color: #fff; }`
  - If disabled, always use multi-line block formatting.

### format/normalize-spaces
- **group:** format
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: spacing around `:` and `;` and after `,`
- **autofix_notes:**
  - Ensure `property: value;` spacing is consistent and minimal.
  - Must not minify away structure (newlines/indentation remain).

### format/sort-properties  ✅ (in scope v1)
- **group:** format
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations inside a single block (do not cross blocks)
  - excludes: custom properties (`--*`) (optional; see params)
- **params (session):**
  - `mode`: `grouped | alphabetical` (default `grouped`)
  - `keepCustomPropsFirst`: boolean (default true)
- **autofix_notes:**
  - Deterministic ordering only.
  - Must not remove declarations or change values.
  - Must not reorder selectors, blocks, or at-rules.
- **notes:**
  - This rule is **info-only** in v1 (never warning/error).
  - Enabled by default, but still user-selectable to apply.

---

## 3) Tokens (rule-driven, structure-preserving)

### tokens/zero-units
- **group:** tokens
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: numeric values in declarations
  - examples: `0px`, `0rem`, `0em`, `0%` (only where exactly equivalent)
- **autofix_notes:**
  - Convert `0<unit>` → `0` when unit is redundant.

### tokens/shorten-hex-colors
- **group:** tokens
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: hex colors
  - only: 6-digit hex where reducible (`#ffffff` → `#fff`)
- **autofix_notes:**
  - Shorten only when mathematically equivalent.
  - Do not change named colors or functions here (handled by separate modern rules if desired).

### tokens/remove-redundant-whitespace-in-values
- **group:** tokens
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: whitespace inside values where semantics remain unchanged
  - examples: `rgb(0, 0, 0)` → `rgb(0,0,0)` (optional), extra spaces in lists
- **params (session):**
  - `aggressiveness`: `low | medium` (default low)
- **autofix_notes:**
  - Must not collapse newlines/indentation (structure stays).

---

## 4) Consolidation (reduce duplication, safe only)

### consolidate/shorthand-margin-padding
- **group:** consolidation
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: within a single declaration block
  - properties: `margin-*`, `padding-*`
- **autofix_notes:**
  - Combine longhands into shorthand when mapping is deterministic.
  - Preserve ordering and avoid changing behavior.

### consolidate/deduplicate-last-wins
- **group:** consolidation
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: within a single declaration block
- **autofix_notes:**
  - If the same property appears multiple times in the same block, keep only the effective one (last-wins).
  - Must not remove fallbacks intentionally written (see params below).
- **params (session):**
  - `preserveKnownFallbackPatterns`: boolean (default true)
  - examples: keep patterns like `background: ...` with gradients + fallback colors when recognized.

### consolidate/merge-adjacent-identical-selectors
- **group:** consolidation
- **default_severity:** info
- **fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: stylesheet-level; same selector repeated in multiple blocks
- **notes:**
  - Potentially changes cascade/order semantics.
  - v1: provide LLM prompt only, no auto-fix.

---

## 5) Modern (recognize + guidance; conservative)

### modern/suggest-place-properties
- **group:** modern
- **default_severity:** info
- **fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: alignment declarations
  - properties: `align-items`, `justify-items`, `align-content`, `justify-content`
- **notes:**
  - Suggest `place-items` / `place-content` / `place-self` where safe.
  - v1: prompt-only unless mapping is guaranteed deterministic.

### modern/container-queries-guidance
- **group:** modern
- **default_severity:** info
- **fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: container query usage
  - properties: `container`, `container-type`, `container-name`
  - at-rules: `@container`
- **notes:**
  - Must recognize container features as valid.
  - v1: guidance/prompt, no auto-fix.

### modern/light-dark-guidance
- **group:** modern
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: color functions
  - functions: `light-dark()`
- **notes:**
  - Must recognize `light-dark()` as valid.
  - Optional info explaining its purpose; no forced changes.

### modern/suggest-logical-properties
- **group:** modern
- **default_severity:** info
- **fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: physical properties
  - properties: `margin-left/right`, `padding-left/right`, etc.
- **notes:**
  - Guidance only in v1 to avoid semantic/layout intent mistakes.

---

## 6) Education (learners-first)

### education/explain-rule-logic
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: issue detail panel
- **notes:**
  - For any issue, UI must show WHAT / WHY / WHEN SAFE.

---

## 7) Template for adding new rules (copy/paste)

### <rule_id>
- **group:** <group>
- **default_severity:** <off|info|warning|error>
- **fixability:** <safe|prompt|none>
- **enabled_by_default:** <true|false>
- **applies_to:**
  - context: <where in CSS AST>
  - properties/functions: <explicit list or pattern>
  - excludes: <explicit list if needed>
- **autofix_notes:** (only if safe)
  - <conditions required to guarantee semantics-preserving transformation>
- **params (session):** (optional)
  - <paramName>: <type> (default <value>)
- **notes:**
  - <anything else the rule must guarantee>

END
