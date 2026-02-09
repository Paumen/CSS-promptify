<!--
CLAUDE_PERMISSIONS: READ | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_WITH_HUMAN_PR_REVIEW
PURPOSE: Authoritative Reference
AUTHORITY: spec/PRD_BUILD_SPEC.md
IF_CONFLICT: Defer to spec/PRD_BUILD_SPEC.md
IF_OUTDATED: Flag human
PRIORITY: HIGH
-->

# Examples (v1)

These examples define expected behavior for analysis, fixes, formatting, inline comments, prompt generation, and the selection/recompute model.

> Source of truth: If anything conflicts, `spec/PRD_BUILD_SPEC.md` wins.

---

## Example 1 — LLM-friendly formatting + color shortening

### Input
```css
.button{display:flex;color:#ffffff}
```

### Expected issues (summary)
- format/normalize-spaces (info)
- format/multiple-declarations-per-line (warning)
- format/indent-2-spaces (warning)
- tokens/shorten-hex-colors (warning)

### Expected output (no comments)
```css
.button {
  display: flex;
  color: #fff;
}
```

### Expected output (with comments)
```css
.button {
  display: flex; /* cssreview: format/multiple-declarations-per-line: split declarations */
  color: #fff; /* cssreview: tokens/shorten-hex-colors: was #ffffff */
}
```

---

## Example 2 — Single-property selector stays one line (token-aware)

### Input
```css
.a{
  color: #fff;
}
```

### Expected issues (summary)
- format/single-prop-single-line (info)

### Expected output (no comments)
```css
.a { color: #fff; }
```

### Expected output (with comments)
```css
.a { color: #fff; } /* cssreview: format/single-prop-single-line: single property kept on one line */
```

---

## Example 3 — Tabs to spaces + property-per-line + zero units

### Input
```css
.card{
\tpadding:8px;\tmargin:0px;
}
```

### Expected issues (summary)
- format/no-tabs (warning)
- format/normalize-spaces (info)
- format/multiple-declarations-per-line (warning)
- tokens/zero-units (warning)

### Expected output (no comments)
```css
.card {
  padding: 8px;
  margin: 0;
}
```

### Expected output (with comments)
```css
.card {
  padding: 8px; /* cssreview: format/no-tabs: converted tabs to spaces */
  margin: 0; /* cssreview: tokens/zero-units: was 0px */
}
```

---

## Example 4 — Consolidate margin longhands into shorthand

### Input
```css
.box {
  margin-top: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  margin-left: 8px;
}
```

### Expected issues (summary)
- consolidate/shorthand-margin-padding (warning)

### Expected output (no comments)
```css
.box {
  margin: 4px 8px;
}
```

### Expected output (with comments)
```css
.box {
  margin: 4px 8px; /* cssreview: consolidate/shorthand-margin-padding: was margin-top/right/bottom/left */
}
```

---

## Example 5 — Deduplicate last-wins inside same block

### Input
```css
.title {
  font-weight: 400;
  font-weight: 700;
}
```

### Expected issues (summary)
- consolidate/deduplicate-last-wins (warning)

### Expected output (no comments)
```css
.title {
  font-weight: 700;
}
```

### Expected output (with comments)
```css
.title {
  font-weight: 700; /* cssreview: consolidate/deduplicate-last-wins: removed earlier overridden value 400 */
}
```

---

## Example 6 — Unrecognized property is info-only (never blocks) + modern property recognized

### Input
```css
.weird {
  place-items: center;
  super-new-property: 123;
}
```

### Expected issues (summary)
- (no issue for place-items; must be recognized as valid)
- safety/unrecognized-property (info) for `super-new-property`

### Expected output (no comments)
```css
.weird {
  place-items: center;
  super-new-property: 123;
}
```

### Notes
- No auto-fix required.
- The info issue must not block other safe fixes elsewhere.

---

## Example 7 — Place-* shorthand modernization (safe auto-fix when deterministic)

### Input
```css
.layout {
  align-items: center;
  justify-items: center;
}
```

### Expected issues (summary)
- modern/suggest-place-shorthand (info, safe (auto))

### Expected output (no comments)
```css
.layout {
  place-items: center;
}
```

### Expected output (with comments)
```css
.layout {
  place-items: center; /* cssreview: modern/suggest-place-shorthand: replaced align-items + justify-items */
}
```

---

## Example 8 — Property sorting (enabled by default, info-only, user-selectable)

### Input
```css
.card {
  color: #fff;
  display: flex;
  align-items: center;
}
```

### Expected issues (summary)
- format/sort-properties (info)

### Expected output (no comments) — grouped mode example
```css
.card {
  display: flex;
  align-items: center;
  color: #fff;
}
```

### Expected output (with comments)
```css
.card {
  display: flex;
  align-items: center;
  color: #fff; /* cssreview: format/sort-properties: reordered properties (mode=grouped) */
}
```

### Notes
- Sorting is **info-only** in v1 (never warning/error).
- Sorting must be deterministic.
- Sorting is **enabled by default**, but must still be **user-selectable** to apply.

---

## Example 9 — Selection model: apply + revert via recompute-from-original

This example locks the v1 behavior that output is derived from **original input + selected fixes**.

### Input
```css
.btn{margin-top:4px;margin-right:8px;margin-bottom:4px;margin-left:8px;color:#ffffff}
```

### Expected issues (summary)
- consolidate/shorthand-margin-padding (warning)
- format/normalize-spaces (info)
- format/multiple-declarations-per-line (warning)
- format/indent-2-spaces (warning)
- tokens/shorten-hex-colors (warning)

### Expected sequence (behavior)
1) User clicks Analyze  
2) User selects only the shorthand fix (consolidate/shorthand-margin-padding)  
3) Output updates (either immediately or after clicking Apply selected)  
4) User unselects that shorthand fix  
5) Output returns to state as if that fix was never selected (recompute from original)

### Expected output after selecting shorthand only (no comments)
```css
.btn {
  margin: 4px 8px;
  color: #ffffff;
}
```

### Expected output after unselecting shorthand (no comments)
```css
.btn {
  margin-top: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  margin-left: 8px;
  color: #ffffff;
}
```

### Notes
- This verifies recompute behavior (no undo-stack needed).
- Copy “no comments” must never include tool comments, regardless of toggle state.

# Additional Examples for Missing Rules (spec/EXAMPLES.md append)

> Generated from the current repo specs. Append these sections to `spec/EXAMPLES.md` (after Example 9, before `END`).

---

## Example 10 — One selector per line (comma lists)

Covers: `format/one-selector-per-line` (safe)

### Input
```css
.btn, .btn-primary, .btn-secondary { color: red; }
```

### Expected issues (summary)
- format/one-selector-per-line (info)

### Expected output (no comments)
```css
.btn,
.btn-primary,
.btn-secondary {
  color: red;
}
```

### Expected output (with comments)
```css
.btn,
.btn-primary,
.btn-secondary {
  color: red; /* cssreview: format/one-selector-per-line: split selector list */
}
```

---

## Example 11 — Multiple declarations per line → split

Covers: `format/multiple-declarations-per-line` (safe)

### Input
```css
.card { padding: 8px; margin: 0; color: #112233; }
```

### Expected issues (summary)
- format/multiple-declarations-per-line (warning)

### Expected output (no comments)
```css
.card {
  padding: 8px;
  margin: 0;
  color: #112233;
}
```

### Expected output (with comments)
```css
.card {
  padding: 8px; /* cssreview: format/multiple-declarations-per-line: split declarations */
  margin: 0;
  color: #112233;
}
```

---

## Example 12 — Numeric normalization (trailing + leading zeros)

Covers: `tokens/remove-leading-zero` (safe), `tokens/remove-trailing-zeros` (safe)

### Input
```css
.num {
  opacity: 0.50;
  line-height: 1.0;
}
```

### Expected issues (summary)
- tokens/remove-leading-zero (info)
- tokens/remove-trailing-zeros (warning)

### Expected output (no comments)
```css
.num {
  opacity: .5;
  line-height: 1;
}
```

### Expected output (with comments)
```css
.num {
  opacity: .5; /* cssreview: tokens/remove-leading-zero: was 0.50 */
  line-height: 1; /* cssreview: tokens/remove-trailing-zeros: was 1.0 */
}
```

---

## Example 13 — Remove redundant whitespace in values

Covers: `tokens/remove-redundant-whitespace` (safe)

### Input
```css
.spaced {
  margin: 10px   20px;
  padding: 5px    0;
}
```

### Expected issues (summary)
- tokens/remove-redundant-whitespace (info)

### Expected output (no comments)
```css
.spaced {
  margin: 10px 20px;
  padding: 5px 0;
}
```

### Expected output (with comments)
```css
.spaced {
  margin: 10px 20px; /* cssreview: tokens/remove-redundant-whitespace: normalized spacing */
  padding: 5px 0; /* cssreview: tokens/remove-redundant-whitespace: normalized spacing */
}
```

---

## Example 14 — Expand shorthand to full values

Covers: `consolidate/shorthand-full-values` (safe)

### Input
```css
.box {
  margin: 4px 8px;
}
```

### Expected issues (summary)
- consolidate/shorthand-full-values (warning)

### Expected output (no comments)
```css
.box {
  margin: 4px 8px 4px 8px;
}
```

### Expected output (with comments)
```css
.box {
  margin: 4px 8px 4px 8px; /* cssreview: consolidate/shorthand-full-values: expanded from 2-value shorthand */
}
```

---

## Example 15 — !important policy (info + safe comment marker insertion)

Covers: `style/important-used` (info, none), `style/important-requires-comment` (warning, safe (force user to choose))

### Input
```css
.title {
  color: red !important;
}
```

### Expected issues (summary)
- style/important-used (info)
- style/important-requires-comment (warning, safe (force user to choose))

### Expected output (no comments)
```css
.title {
  color: red !important;
}
```

### Notes
- Default requires a user choice; max can auto-insert a same-line approval marker comment (placeholder reason allowed).

---

## Example 16 — Property typos (prompt) + suspicious tokens (error)

Covers: `safety/misspelled-property` (warning, prompt), `safety/typo-suspicious-units-and-tokens` (error, safe (force user to choose))

### Input
```css
.bad {
  widht: 100px;
  margin: 2xp;
}
```

### Expected issues (summary)
- safety/misspelled-property (warning, prompt) for `widht`
- safety/typo-suspicious-units-and-tokens (error, safe (force user to choose)) for `2xp`

### Expected output (no comments)
```css
.bad {
  widht: 100px;
  margin: 2xp;
}
```

---

## Example 17 — Duplicate property in block (safe, requires choice by default)

Covers: `safety/duplicate-property-in-block` (error, safe (force user to choose))

### Input
```css
.dup {
  color: red;
  color: blue;
}
```

### Expected issues (summary)
- safety/duplicate-property-in-block (error, safe (force user to choose))

### Expected output (no comments)
```css
.dup {
  color: red;
  color: blue;
}
```

### Notes
- Default forces a choice (or configuration) before removing earlier duplicates; max can auto-apply “always keep last”.

---

## Example 18 — Layout checks (warnings + infos)

Covers:
- `info/universal-selector-used` (info, prompt)
- `layout/warn-float-or-clear` (warning, prompt)
- `layout/warn-display-table-layout` (warning, prompt)
- `layout/flex-properties-require-flex` (info, safe (force user to choose))
- `layout/grid-properties-require-grid` (info, safe (force user to choose))

### Input
```css
* { box-sizing: border-box; }

.legacy {
  float: left;
  display: table;
}

.flexy {
  align-items: center;
}

gridy {
  grid-template-columns: 1fr 1fr;
}
```

### Expected issues (summary)
- info/universal-selector-used (info)
- layout/warn-float-or-clear (warning)
- layout/warn-display-table-layout (warning)
- layout/flex-properties-require-flex (info)
- layout/grid-properties-require-grid (info)

### Expected output (no comments)
```css
* { box-sizing: border-box; }

.legacy {
  float: left;
  display: table;
}

.flexy {
  align-items: center;
}

gridy {
  grid-template-columns: 1fr 1fr;
}
```

### Notes
- Guidance rules (no safe fix).

---

## Example 19 — Debug + stylesheet-wide signals

Covers:
- `debug/suspicious-debug-styles` (warning, safe (force user to choose))
- `info/weird-z-index-usage` (info, prompt)
- `vars/unused-custom-properties` (info, safe (force user to choose))
- `info/too-many-colors` (info, prompt — only when threshold exceeded)

### Input
```css
:root {
  --accent: #ff00ff;
}

.debug {
  outline: 2px solid red;
  z-index: 9999;
  color: #ff00ff;
}
```

### Expected issues (summary)
- debug/suspicious-debug-styles (warning)
- info/weird-z-index-usage (info)
- vars/unused-custom-properties (info) for `--accent` (not referenced via `var(--accent)`)
- info/too-many-colors (info) ONLY if config `maxDistinctColors` is exceeded

### Expected output (no comments)
```css
:root {
  --accent: #ff00ff;
}

.debug {
  outline: 2px solid red;
  z-index: 9999;
  color: #ff00ff;
}
```

---

## Example 20 — Modern guidance + prefer hex (safe)

Covers:
- `modern/prefer-dvh-over-vh` (info, safe (force user to choose))
- `modern/prefer-individual-transform-properties` (info, safe (auto))
- `modern/avoid-px-except-approved-contexts` (warning, safe (force user to choose) — typically disabled by default)
- `modern/prefer-hex-colors` (info, safe)

### Input
```css
.modern {
  height: 100vh;
  transform: translateX(10px) rotate(10deg);
  color: rgb(17, 34, 51);
  margin: 7px;
}
```

### Expected issues (summary)
- modern/prefer-dvh-over-vh (info, safe (force user to choose))
- modern/prefer-individual-transform-properties (info, safe (auto))
- modern/avoid-px-except-approved-contexts (warning, safe (force user to choose)) ONLY if enabled in session
- modern/prefer-hex-colors (info, safe)

### Expected output (no comments)
```css
.modern {
  height: 100vh;
  transform: translateX(10px) rotate(10deg);
  color: #112233;
  margin: 7px;
}
```

### Expected output (with comments)
```css
.modern {
  height: 100vh;
  transform: translateX(10px) rotate(10deg);
  color: #112233; /* cssreview: modern/prefer-hex-colors: was rgb(17, 34, 51) */
  margin: 7px;
}
```

### Notes
- Prompt-only modern rules do not change output; they provide “Copy LLM prompt”.

---

## Example 21 — Duplicate selectors (safe, requires choice by default)

Covers: `consolidate/duplicate-selectors` (warning, safe (force user to choose))

### Input
```css
.btn {
  color: red;
}

.other {
  padding: 4px;
}

.btn {
  background: blue;
}
```

### Expected issues (summary)
- consolidate/duplicate-selectors (warning, safe (force user to choose))

### Expected output (no comments)
```css
.btn {
  color: red;
}

.other {
  padding: 4px;
}

.btn {
  background: blue;
}
```

### Notes
- Default requires a choice; max can auto-merge when configured.

---

## Example 22 — Parse errors (classified)

Covers:
- `safety/invalid-syntax` (error, prompt)
- `safety/parse-error-unclosed-block` (error, safe (force user to choose))

### Input
```css
.broken {
  color: red
  width: 10px;
```

### Expected issues (summary)
- safety/invalid-syntax (error)
- safety/parse-error-unclosed-block (error)

### Expected output (no comments)
```css
.broken {
  color: red
  width: 10px;
```

### Notes
- UI must stay usable even when parsing fails.

---

## Example 23 — Design step values (safe, requires choice by default)

Covers: `design/step-values` (warning, safe (force user to choose))

### Input
```css
.spacing {
  margin: 7px;
  padding: 11px;
}
```

### Expected issues (summary)
- design/step-values (warning, safe (force user to choose))

### Expected output (no comments)
```css
.spacing {
  margin: 7px;
  padding: 11px;
}
```

---

## Example 24 — Nesting limits (only when enabled)

Covers: `format/max-nesting-depth` (warning, prompt), `format/max-nesting-lines` (warning, prompt)

### Input
```css
.a {
  &amp; .b {
    &amp; .c {
      &amp; .d {
        color: red;
      }
    }
  }
}
```

### Expected issues (summary)
- format/max-nesting-depth (warning) ONLY if enabled in session
- format/max-nesting-lines (warning) ONLY if enabled in session

### Expected output (no comments)
```css
.a {
  &amp; .b {
    &amp; .c {
      &amp; .d {
        color: red;
      }
    }
  }
}
```

---
## Example 25 — Rule logic is always shown (WHAT / WHY / WHEN SAFE)

> **Note:** This is a UI behavior guarantee, not a rule that emits issues.
> See `spec/UI_BEHAVIOR.md` for the specification.

### Scenario
User selects any issue in the Issues Panel.

### Expected behavior
- Issue Detail / Rule Logic panel shows:
  - WHAT (what was detected)
  - WHY (why it matters)
  - WHEN SAFE (constraints/caveats)

### Notes
- Every issue includes rule logic in its `logic` field.
- The UI must display this for all issues.
- This is enforced by the Issue data contract, not by a separate rule.

END
