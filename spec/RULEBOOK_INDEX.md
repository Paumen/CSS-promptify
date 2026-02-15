<!--
CLAUDE_PERMISSIONS: READ | FOLLOW | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL
PURPOSE: Authoritative Reference
AUTHORITY: spec/PRD_BUILD_SPEC.md
IF_CONFLICT: Defer to spec/PRD_BUILD_SPEC.md
IF_OUTDATED: Flag human
PRIORITY: HIGH
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
- **default_fixability**: `safe (auto) | safe (force user to choose) | prompt | none`
- **max_fixability**: `safe (auto) | safe (force user to choose) | prompt | none`
- **enabled_by_default**: `true | false` (v1: session-only toggles still start from this default)
- **applies_to**: explicit applicability constraints (properties/contexts)
- **autofix_notes**: conditions for safe auto-fix (if default_fixability starts with `safe`)
- **params**: optional parameters that change behavior (v1 supports session-only)

### 0.2 Applicability rule (important)
Every rule MUST be explicit about where it applies (properties + context) to avoid accidental triggers.

### 0.3 "Unrecognized property" policy
`safety/unrecognized-property` is **info-only** by default and must never block other fixes.

---

## 0.4 v1 Rule Selection (Implementation Tiers)

Rules are organized into implementation tiers. **v1.0 first release includes Tier 1 + Tier 2 (19 rules)**.

### Tier 1: Core Rules (Must Have) — 14 rules

| rule_id | group | default_fixability | rationale |
|---------|-------|------------|-----------|
| `safety/invalid-syntax` | safety | prompt | Fundamental parse error detection |
| `safety/unrecognized-property` | safety | none | Core modern-CSS policy |
| `format/no-tabs` | format | safe (auto) | Basic LLM-friendly formatting |
| `format/indent-2-spaces` | format | safe (auto) | Basic LLM-friendly formatting |
| `format/multiple-declarations-per-line` | format | safe (auto) | Core formatting rule |
| `format/single-prop-single-line` | format | safe (auto) | Token optimization |
| `format/normalize-spaces` | format | safe (auto) | Clean spacing |
| `tokens/zero-units` | tokens | safe (auto) | Simple, high-value |
| `tokens/shorten-hex-colors` | tokens | safe (auto) | Simple, high-value |
| `consolidate/shorthand-margin-padding` | consolidation | safe (auto) | High-impact consolidation |
| `consolidate/deduplicate-last-wins` | consolidation | safe (auto) | Remove redundant declarations |
| `style/important-used` | education | none | Basic awareness |
| `layout/flex-properties-require-flex` | education | safe (force user to choose) | Common mistake detection |
| `layout/grid-properties-require-grid` | education | safe (force user to choose) | Common mistake detection |
### Tier 2: Valuable Additions — 5 rules

| rule_id | group | default_fixability | rationale |
|---------|-------|------------|-----------|
| `safety/misspelled-property` | safety | prompt | Catches typos |
| `safety/typo-suspicious-units-and-tokens` | safety | safe (force user to choose) | Catches `2xp` etc. |
| `format/sort-properties` | format | safe (auto) | Per spec requirement |
| `tokens/remove-trailing-zeros` | tokens | safe (auto) | Clean numbers |
| `modern/prefer-hex-colors` | modern | safe (auto) | Simple conversion |
### Tier 3: Defer to v1.1+ — remaining rules

| rule_id | reason to defer |
|---------|-----------------|
| `safety/parse-error-*` (3 rules) | Subsume into invalid-syntax |
| `safety/duplicate-property-in-block` | Complex; often intentional fallbacks | safe (force user to choose) | `format/one-selector-per-line` | Lower priority formatting |
| `format/max-nesting-depth` | Disabled by default | prompt | `format/max-nesting-lines` | Disabled by default |
| `tokens/remove-leading-zero` | Lower priority | safe (auto) | `tokens/remove-redundant-whitespace` | Edge cases |
| `consolidate/shorthand-full-values` | May conflict with shorthand collapse | safe (auto) | `consolidate/duplicate-selectors` | Cascade-affecting; risky |
| `consolidate/merge-adjacent-identical-selectors` | Added 2026-01-31; safe merge of adjacent identical selectors |  | `modern/prefer-dvh-over-vh` | Browser support varies |
| `modern/prefer-individual-transform-properties` | Complex analysis | safe (auto) | `modern/suggest-place-shorthand` | Prompt-only; lower priority |
| `modern/suggest-logical-properties` | Added 2026-01-31; suggest logical properties |  | `modern/container-queries-guidance` | Added 2026-01-31; container query patterns |
| `modern/light-dark-guidance` | Added 2026-01-31; light-dark() function guidance |  | `modern/avoid-px-except-approved-contexts` | Disabled by default; complex |
| `style/important-requires-comment` | Can add in v1.1 | safe (force user to choose) | `info/universal-selector-used` | Lower priority |
| `info/too-many-colors` | Stylesheet-wide analysis | prompt | `info/weird-z-index-usage` | Lower priority |
| `layout/warn-float-or-clear` | Can add in v1.1 | prompt | `layout/warn-display-table-layout` | Less common |
| `debug/suspicious-debug-styles` | Can add in v1.1 | safe (force user to choose) | `design/step-values` | Disabled by default; niche |
| `vars/unused-custom-properties` | Disabled by default |

---

## 1) Safety (errors and hard stops)

### safety/invalid-syntax
- **group:** safety
- **default_severity:** error
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: entire file parse result
- **notes:**
  - Emit when CSS cannot be parsed or contains invalid syntax/value combinations detected by parser.

### safety/parse-error-unclosed-block
- **group:** safety
- **default_severity:** error
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: parser error subtype “unclosed block/braces”
- **notes:**
  - Specific parse error classification for clearer UX.

### safety/parse-error-unexpected-token
- **group:** safety
- **default_severity:** error
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: parser error subtype “unexpected token”
- **notes:**
  - Specific parse error classification for clearer UX.

### safety/parse-error-invalid-value
- **group:** safety
- **default_severity:** error
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: parser error subtype “invalid value”
- **notes:**
  - Specific parse error classification for clearer UX.

### safety/unrecognized-property
- **group:** safety
- **default_severity:** info
- **default_fixability:** none
- **max_fixability:** safe (auto)
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
- **default_fixability:** prompt
- **max_fixability:** prompt
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
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: declaration values containing common typos
  - examples: `2xp`, `1x`, `pX`, `#fffffg`
- **notes:**
  - “Typos spotter” rule for common mistakes.

### safety/duplicate-property-in-block
- **group:** safety
- **default_severity:** error
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: duplicate property name inside the same `{ ... }` block
- **params (session):**
  - `resolution`: `forceUserChoice | alwaysKeepLast` (default `forceUserChoice`)
- **notes:**
  - Strict duplicate detection.
  - Default requires a user decision; max can auto-apply “alwaysKeepLast”.

---

## 2) Format (LLM structure-first)

### format/no-tabs
- **group:** format
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: whitespace/indentation
- **autofix_notes:**
  - Replace `\t` with spaces according to `format/indent-2-spaces`.

### format/indent-2-spaces
- **group:** format
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: indentation inside `{ ... }`
- **params (session):**
  - `indentSize`: number (default 2)
  - allowed: 1, 2, 3, 4, 5
- **autofix_notes:**
  - Normalize indentation to indentSize spaces.

### format/multiple-declarations-per-line
- **group:** format
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: more than one declaration on the same line
- **params (session):**
  - `maxDeclarationsPerLine`: `1|2|3|4|5|infinite` (default `1`)
- **autofix_notes:**
  - Split so each property starts on a new line until the configured max is satisfied.

### format/single-prop-single-line
- **group:** format
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: selector blocks with <= N declarations (N configurable)
- **params (session):**
  - `maxDeclarationsOnSingleLine`: `1|2|3|4|5` (default `1`)
- **autofix_notes:**
  - If block size <= maxDeclarationsOnSingleLine, allow a compact one-line form.

### format/normalize-spaces
- **group:** format
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: spacing around `:` `;` and after `,`
- **autofix_notes:**
  - Ensure `property: value;` spacing is consistent and minimal.

### format/one-selector-per-line
- **group:** format
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: selector lists split by commas
- **params (session):**
  - `maxSelectorsPerLine`: `1|2|3|4|5|infinite` (default `1`)
- **autofix_notes:**
  - Reflow selector lists so no line exceeds maxSelectorsPerLine selectors.

### format/sort-properties
- **group:** format
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
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
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: CSS nesting (native nesting blocks)
- **params (session):**
  - `maxDepth`: number (default 3)
  - allowed: 1..9
- **notes:**
  - Warn if nesting depth exceeds maxDepth.

### format/max-nesting-lines
- **group:** format
- **default_severity:** warning
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: CSS nesting (nested block length)
- **params (session):**
  - `maxLines`: number (default 30)
  - allowed: 0..999
- **notes:**
  - Warn if a single nested block exceeds maxLines.

---

## 3) Tokens (rule-driven, structure-preserving)

### tokens/zero-units
- **group:** tokens
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: numeric values
- **params (session):**
  - `properties`: `all | allowlist | denylist` (default `all`)
  - `list`: list (default `[]`)
- **autofix_notes:**
  - Convert `0&lt;unit&gt;` → `0` when unit is redundant and allowed by config.

### tokens/remove-trailing-zeros
- **group:** tokens
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: numeric values with decimals
  - examples: `1.0` → `1`, `1.50` → `1.5`
- **autofix_notes:**
  - Remove trailing zeros where value remains exact.

### tokens/remove-leading-zero
- **group:** tokens
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: decimals with leading zero
  - examples: `0.5` → `.5`
- **autofix_notes:**
  - Remove leading zero where valid CSS and unchanged value.

### tokens/shorten-hex-colors
- **group:** tokens
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: hex colors
  - only: reducible 6-digit hex (`#ffffff` → `#fff`)
- **params (session):**
  - `expandToFullHex`: boolean (default false)
- **autofix_notes:**
  - If expandToFullHex=false, shorten only when equivalent.
  - If expandToFullHex=true, expand short hex to full hex.

### tokens/remove-redundant-whitespace
- **group:** tokens
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: whitespace inside values where semantics unchanged
- **params (session):**
  - `aggressiveness`: `low | medium` (default low)

---

## 4) Consolidation / Shorthands

### consolidate/shorthand-margin-padding
- **group:** consolidate
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: within a single declaration block
  - properties: `margin-*`, `padding-*`
- **params (session):**
  - `only`: `both | margin | padding` (default `both`)
- **autofix_notes:**
  - Combine longhands into shorthand when deterministic and allowed by config.

### consolidate/shorthand-full-values
- **group:** consolidate
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: shorthand properties using 1–3 values
  - properties: `margin`, `padding`, `inset`
- **params (session):**
  - `expandTo`: number (default 4)
  - `properties`: list (default `["margin","padding","inset"]`)
- **autofix_notes:**
  - Expand shorthand so all values are explicit:
    - `margin: 1px 2px;` → `margin: 1px 2px 1px 2px;`
- **notes:**
  - Expands shorthand properties to their full, explicit form to improve clarity for LLM parsing.

### consolidate/deduplicate-last-wins
- **group:** consolidate
- **default_severity:** warning
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations inside a single block where the same property appears multiple times
- **params (session):**
  - `resolution`: `forceUserChoice | alwaysKeepLast` (default `alwaysKeepLast`)
- **autofix_notes:**
  - Remove earlier declarations of the same property, keeping only the last one.
  - Safe because CSS "last declaration wins" semantics are preserved.
- **notes:**
  - Example: `font-weight: 400; font-weight: 700;` → `font-weight: 700;`
  - Only applies within a single declaration block (not across blocks).

### consolidate/duplicate-selectors
- **group:** consolidate
- **default_severity:** warning
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** false
- **applies_to:**
  - context: stylesheet-level; same selector repeated in multiple blocks
- **params (session):**
  - `resolution`: `forceUserChoice | alwaysKeepLast` (default `forceUserChoice`)
- **notes:**
  - Merging selectors can affect cascade/order; default requires a user decision.

---

## 5) Modern / Best practices

### modern/prefer-dvh-over-vh
- **group:** modern
- **default_severity:** info
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: values using `vh`
- **params (session):**
  - `mode`: `forceUserChoice | auto` (default `forceUserChoice`)
- **notes:**
  - Prefer `dvh` over `vh`.

### modern/prefer-hex-colors
- **group:** modern
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
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
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** false
- **applies_to:**
  - context: `transform:` usage that could be expressed as individual properties
- **params (session):**
  - `onlyIfSingleFunction`: boolean (default true)
- **notes:**
  - Prefer `translate`, `rotate`, `scale` when equivalent and allowed by config.

### modern/suggest-place-shorthand
- **group:** modern
- **default_severity:** info
- **default_fixability:** safe (auto)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: declaration blocks containing `align-*` + `justify-*` pairs
- **params (session):**
  - `requirePair`: boolean (default true)
  - `allowedPlace`: `items | content | self | any` (default `any`)
- **notes:**
  - Use `place-items`, `place-content`, or `place-self` only when replacement is deterministic and behavior-preserving.
  - Example: `align-items: center; justify-items: center;` → `place-items: center;`

### modern/avoid-px-except-approved-contexts
- **group:** modern
- **default_severity:** warning
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
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

> **Note:** `education/explain-rule-logic` was removed from this rulebook.
> It is a UI behavior (show WHAT/WHY/WHEN SAFE for all issues), not a rule that emits issues.
> See `spec/UI_BEHAVIOR.md` for the UI behavior specification.

### style/important-used
- **group:** education
- **default_severity:** info
- **default_fixability:** none
- **max_fixability:** none
- **enabled_by_default:** true
- **applies_to:**
  - context: any declaration containing `!important`
- **notes:**
  - Always emit info when `!important` is used.

### style/important-requires-comment
- **group:** education
- **default_severity:** warning
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: any declaration containing `!important`
  - condition: same line MUST contain approval comment marker
- **params (session):**
  - `requiredCommentMarker`: "review: important-ok:"
  - `sameLineOnly`: true
  - `minReasonLength`: 3
  - `autofixAddsPlaceholderReason`: boolean (default true)
- **notes:**
  - Allowed example:
    - `color: red !important; /* review: important-ok: override legacy */`

### info/universal-selector-used
- **group:** education
- **default_severity:** info
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: selector contains universal selector `*`
- **notes:**
  - Emit info when universal selector is used.

### info/too-many-colors
- **group:** education
- **default_severity:** info
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** false
- **applies_to:**
  - context: entire stylesheet
- **params (session):**
  - `maxDistinctColors`: number (default 20)
  - allowed: 1..50
- **notes:**
  - Emit info if more than maxDistinctColors distinct colors are detected.

### info/weird-z-index-usage
- **group:** education
- **default_severity:** info
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: z-index usage
- **params (session):**
  - `maxDistinctZIndex`: number (default 10)
  - `highValueThreshold`: number (default 999)
  - allowed: 0..99999
- **notes:**
  - Emit info if many distinct z-index values are used or very high values are used.

---

## 7) Layout / Anti-pattern warnings

### layout/warn-float-or-clear
- **group:** modern
- **default_severity:** warning
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations using `float` or `clear`
- **params (session):**
  - `check`: `both | floatOnly | clearOnly` (default `both`)
- **notes:**
  - Warn when float/clear are used.

### layout/warn-display-table-layout
- **group:** modern
- **default_severity:** warning
- **default_fixability:** prompt
- **max_fixability:** prompt
- **enabled_by_default:** true
- **applies_to:**
  - context: `display: table`, `display: table-cell`, etc.
- **notes:**
  - Warn for use of display table for layouts.

### layout/flex-properties-require-flex
- **group:** education
- **default_severity:** info
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: rule blocks that include flex-related properties
- **notes:**
  - Emit info if flex properties are used but `display: flex|inline-flex` is not present in the same block.

### layout/grid-properties-require-grid
- **group:** education
- **default_severity:** info
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
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
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** true
- **applies_to:**
  - context: declarations likely used as debugging
- **params (session):**
  - `suspiciousColors`: ["magenta", "lime"] (to be extended)
  - `suspiciousPatterns`: ["outline: 1px solid red", "outline: 2px solid red"] (to be extended)
- **notes:**
  - Warn when debug-like styles appear (magenta/lime, red outline patterns, etc.).

---

## 9) Design system / value enforcement (optional)

### design/step-values
- **group:** tokens
- **default_severity:** warning
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
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
    - value &lt;= 6 → allowed
    - 7..20 → allowed only if even
    - 21+ → allowed only if divisible by 4

---

## 10) Custom properties (variables)

### vars/unused-custom-properties
- **group:** education
- **default_severity:** info
- **default_fixability:** safe (force user to choose)
- **max_fixability:** safe (auto)
- **enabled_by_default:** false
- **applies_to:**
  - context: custom property definitions `--*` within the provided input
- **notes:**
  - Emit info for custom properties defined but not referenced via `var(--*)` within the same input.

---

## 11) Template for adding new rules (copy/paste)

### &lt;rule_id&gt;
- **group:** &lt;group&gt;
- **default_severity:** &lt;off|info|warning|error&gt;
- **default_fixability:** &lt;safe (auto)|safe (force user to choose)|prompt|none&gt;
- **max_fixability:** &lt;safe (auto)|safe (force user to choose)|prompt|none&gt;
- **enabled_by_default:** &lt;true|false&gt;
- **applies_to:**
  - context: &lt;where in CSS AST&gt;
  - properties/functions: &lt;explicit list or pattern&gt;
  - excludes: &lt;explicit list if needed&gt;
- **autofix_notes:** (only if safe)
  - &lt;conditions required to guarantee semantics-preserving transformation&gt;
- **params (session):** (optional)
  - &lt;paramName&gt;: &lt;type&gt; (default &lt;value&gt;)
- **notes:**
  - &lt;anything else the rule must guarantee&gt;

END
