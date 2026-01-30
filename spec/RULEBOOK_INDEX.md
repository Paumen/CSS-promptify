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

## 1) Safety (errors and hard stops)

### safety/invalid-syntax
- **group:** safety
- **default_severity:** error
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: entire file parse result
- **notes:**
  - Emit when CSS cannot be parsed or contains invalid syntax/value combinations detected by parser.

### safety/parse-error-unclosed-block
- **group:** safety
- **default_severity:** error
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: parser error subtype “unclosed block/braces”
- **notes:**
  - Specific parse error classification for clearer UX.

### safety/parse-error-unexpected-token
- **group:** safety
- **default_severity:** error
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: parser error subtype “unexpected token”
- **notes:**
  - Specific parse error classification for clearer UX.

### safety/parse-error-invalid-value
- **group:** safety
- **default_severity:** error
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: parser error subtype “invalid value”
- **notes:**
  - Specific parse error classification for clearer UX.

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

### safety/misspelled-property
- **group:** safety
- **default_severity:** warning
- **fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: unknown properties that are “close” to a known property (typo suggestion)
  - excludes: custom properties (`--*`)
- **notes:**
  - Example: `widht` → suggest `width`.
  - Prompt-only by default (auto-fix can be risky).

### safety/typo-suspicious-units-and-tokens
- **group:** safety
- **default_severity:** error
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: declaration values containing common typos
  - examples: `2xp`, `1x`, `pX`, `#fffffg`
- **notes:**
  - “Typos spotter” rule for common mistakes.

### safety/duplicate-property-in-block
- **group:** safety
- **default_severity:** error
- **fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: duplicate property name inside the same `{ ... }` block
- **notes:**
  - You requested this as an error (strict).
  - Prompt-only because duplicates may sometimes be intentional fallbacks.

---

## 2) Format (LLM structure-first)

### format/no-tabs
- **group:** format
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: whitespace/indentation
- **autofix_notes:**
  - Replace `\t` with spaces according to `format/indent-2-spaces`.

### format/indent-2-spaces
- **group:** format
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: indentation inside `{ ... }`
- **params (session):**
  - `indentSize`: number (default 2)
- **autofix_notes:**
  - Normalize indentation to indentSize spaces.

### format/multiple-declarations-per-line
- **group:** format
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: more than one declaration on the same line
- **autofix_notes:**
  - Split so each property starts on a new line.

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
  - If enabled, allow `.a { color: #fff; }`.

### format/normalize-spaces
- **group:** format
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: spacing around `:` `;` and after `,`
- **autofix_notes:**
  - Ensure `property: value;` spacing is consistent and minimal.

### format/one-selector-per-line
- **group:** format
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: selector lists split by commas
- **autofix_notes:**
  - Put each selector (comma-separated) on its own line.

### format/sort-properties
- **group:** format
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations inside a single block (do not cross blocks)
- **params (session):**
  - `mode`: `grouped | alphabetical` (default `grouped`)
  - `keepCustomPropsFirst`: boolean (default true)
- **autofix_notes:**
  - Deterministic ordering only; do not change values or remove props.
- **notes:**
  - Info-only in v1; enabled by default; user-selectable to apply.

### format/max-nesting-depth
- **group:** format
- **default_severity:** warning
- **fixability:** none
- **enabled_by_default:** false
- **applies_to:**
  - context: CSS nesting (native nesting blocks)
- **params (session):**
  - `maxDepth`: number (default 3)
- **notes:**
  - Warn if nesting depth exceeds maxDepth.

### format/max-nesting-lines
- **group:** format
- **default_severity:** warning
- **fixability:** none
- **enabled_by_default:** false
- **applies_to:**
  - context: CSS nesting (nested block length)
- **params (session):**
  - `maxLines`: number (default 30)
- **notes:**
  - Warn if a single nested block exceeds maxLines.

---

## 3) Tokens (rule-driven, structure-preserving)

### tokens/zero-units
- **group:** tokens
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: numeric values
- **autofix_notes:**
  - Convert `0<unit>` → `0` when unit is redundant.

### tokens/remove-trailing-zeros
- **group:** tokens
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: numeric values with decimals
  - examples: `1.0` → `1`, `1.50` → `1.5`
- **autofix_notes:**
  - Remove trailing zeros where value remains exact.

### tokens/remove-leading-zero
- **group:** tokens
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: decimals with leading zero
  - examples: `0.5` → `.5`
- **autofix_notes:**
  - Remove leading zero where valid CSS and unchanged value.

### tokens/shorten-hex-colors
- **group:** tokens
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: hex colors
  - only: reducible 6-digit hex (`#ffffff` → `#fff`)
- **autofix_notes:**
  - Shorten only when equivalent.

### tokens/remove-redundant-whitespace-in-values
- **group:** tokens
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: whitespace inside values where semantics unchanged
- **params (session):**
  - `aggressiveness`: `low | medium` (default low)

---

## 4) Consolidation / Shorthands

### consolidate/shorthand-margin-padding
- **group:** consolidation
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: within a single declaration block
  - properties: `margin-*`, `padding-*`
- **autofix_notes:**
  - Combine longhands into shorthand when deterministic.

### consolidate/shorthand-full-values
- **group:** consolidation
- **default_severity:** warning
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: shorthand properties using 1–3 values
  - properties: `margin`, `padding`, `inset`
- **params (session):**
  - `expandTo`: number (default 4)
- **autofix_notes:**
  - Expand shorthand so all values are explicit:
    - `margin: 1px 2px;` → `margin: 1px 2px 1px 2px;`
- **notes:**
  - You requested explicit values for shorthands for clarity (LLM-friendly).

### consolidate/duplicate-selectors
- **group:** consolidation
- **default_severity:** warning
- **fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: stylesheet-level; same selector repeated in multiple blocks
- **notes:**
  - Warn for duplicate selectors. Prompt-only; merging may affect cascade/order.

---

## 5) Modern / Best practices

### modern/prefer-dvh-over-vh
- **group:** modern
- **default_severity:** info
- **fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: values using `vh`
- **notes:**
  - Prefer `dvh` over `vh`.

### modern/prefer-hex-colors
- **group:** modern
- **default_severity:** info
- **fixability:** safe
- **enabled_by_default:** true
- **applies_to:**
  - context: color values not in hex
- **params (session):**
  - `prefer`: "hex"
- **autofix_notes:**
  - Convert only when exact conversion is possible (e.g., integer rgb()).

### modern/prefer-individual-transform-properties
- **group:** modern
- **default_severity:** info
- **fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: `transform:` usage that could be expressed as individual properties
- **notes:**
  - Prefer `translate`, `rotate`, `scale` (prompt-only in v1).

### modern/avoid-px-except-approved-contexts
- **group:** modern
- **default_severity:** warning
- **fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: values using `px`
- **params (session):**
  - `allowContainerUnits`: true
  - `preferredUnitsIfContainerAllowed`:
      elementInline: "cqi"
      elementBlock: "cqb"
  - `preferredUnitsIfContainerNotAllowed`:
      elementHeight: "dvh"
      elementWidth: "dvw"
  - `preferredUnitsSpacingAndBorders`: "rem"
  - `spacingAndBorderProps`:
      - "margin"
      - "padding"
      - "border"
      - "border-width"
      - "outline"
      - "gap"
  - `elementSizeProps`:
      - "width"
      - "height"
      - "min-width"
      - "max-width"
      - "min-height"
      - "max-height"
      - "top"
      - "left"
      - "right"
      - "bottom"
      - "inset"
  - `exceptions`:
      allowPxInsideVar: true
      allowPxIfClampMiddleIsResponsiveOrVar: true
      clampMiddleAllowedUnits: ["cqi","cqb","dvh","dvw","rem","em","svh","lvh","vw","vh"]
- **notes:**
  - Warn if `px` is used instead of responsive units.
  - Exception: allow px in `clamp(min, middle, max)` if middle uses a preferred responsive unit or `var(--*)`.
  - Exception: allow px if the value contains `var(--*)`.

---

## 6) Education / Style policy

### education/explain-rule-logic
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: issue detail panel
- **notes:**
  - UI shows WHAT / WHY / WHEN SAFE for any issue.

### style/important-used
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: any declaration containing `!important`
- **notes:**
  - Always emit info when `!important` is used.

### style/important-requires-comment
- **group:** education
- **default_severity:** warning
- **fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: any declaration containing `!important`
  - condition: same line MUST contain approval comment marker
- **params (session):**
  - `requiredCommentMarker`: "cssreview: important-ok:"
  - `sameLineOnly`: true
  - `minReasonLength`: 3
- **notes:**
  - Allowed example:
    - `color: red !important; /* cssreview: important-ok: override legacy */`

### info/universal-selector-used
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: selector contains universal selector `*`
- **notes:**
  - Emit info when universal selector is used.

### info/too-many-colors
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** false
- **applies_to:**
  - context: entire stylesheet
- **params (session):**
  - `maxDistinctColors`: number (default 20)
- **notes:**
  - Emit info if more than maxDistinctColors distinct colors are detected.

### info/weird-z-index-usage
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: z-index usage
- **params (session):**
  - `maxDistinctZIndex`: number (default 10)
  - `highValueThreshold`: number (default 999)
- **notes:**
  - Emit info if many distinct z-index values are used or very high values are used.

---

## 7) Layout / Anti-pattern warnings

### layout/warn-float-or-clear
- **group:** modern
- **default_severity:** warning
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations using `float` or `clear`
- **notes:**
  - Warn when float/clear are used.

### layout/warn-display-table-layout
- **group:** modern
- **default_severity:** warning
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: `display: table`, `display: table-cell`, etc.
- **notes:**
  - Warn for use of display table for layouts.

### layout/flex-properties-require-flex
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: rule blocks that include flex-related properties
- **notes:**
  - Emit info if flex properties are used but `display: flex|inline-flex` is not present in the same block.

### layout/grid-properties-require-grid
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: rule blocks that include grid-related properties
- **notes:**
  - Emit info if grid properties are used but `display: grid|inline-grid` is not present in the same block.

---

## 8) Debug / Suspicious patterns

### debug/suspicious-debug-styles
- **group:** modern
- **default_severity:** warning
- **fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations likely used as debugging
- **params (session):**
  - `suspiciousColors`: ["magenta", "lime"]
  - `suspiciousPatterns`: ["outline: 1px solid red", "outline: 2px solid red"]
- **notes:**
  - Warn when debug-like styles appear (magenta/lime, red outline patterns, etc.).

---

## 9) Design system / value enforcement (optional)

### design/step-values
- **group:** tokens
- **default_severity:** warning
- **fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: declaration values for properties:
    - `margin`, `gap`, `border`, `border-width`, `min-height`, `max-height`, `min-width`, `max-width`,
      `top`, `left`, `right`, `bottom`, `inset`, `width`, `height`, `outline`
  - value shape: plain numeric tokens with unit OR unitless `0`
  - applies_to_all_tokens: true
  - excludes:
    - percentage values (e.g. `50%`)
    - complex expressions/functions (v1 skip): `calc(...)`, `clamp(...)`, `min(...)`, `max(...)`, `var(...)`
- **params (session):**
  - `smallMax`: 6
  - `midMin`: 7
  - `midMax`: 20
  - `midStep`: 2
  - `largeMin`: 21
  - `largeStep`: 4
- **notes:**
  - Logic per token:
    - value <= 6 → allowed
    - 7..20 → allowed only if even
    - 21+ → allowed only if divisible by 4

---

## 10) Custom properties (variables)

### vars/unused-custom-properties
- **group:** education
- **default_severity:** info
- **fixability:** none
- **enabled_by_default:** false
- **applies_to:**
  - context: custom property definitions `--*` within the provided input
- **notes:**
  - Emit info for custom properties defined but not referenced via `var(--*)` within the same input.

---

## 11) Template for adding new rules (copy/paste)

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
