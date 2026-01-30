<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
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
- format/property-per-line (warning)
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
  display: flex; /* cssreview: format/property-per-line: split declarations */
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
- format/property-per-line (warning)
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

## Example 7 — Prompt-only rule for tricky modernization (no auto-fix)

### Input
```css
.layout {
  align-items: center;
  justify-items: center;
}
```

### Expected issues (summary)
- modern/suggest-place-properties (info, prompt)

### Expected “LLM prompt” output (concept)
```text
TASK:
Modernize the alignment properties using place-* where safe.

CONSTRAINTS:
- Do not change layout behavior.
- Keep selector specificity and rule order unchanged.
- Output must be structured (two spaces indent, one property per line, no minification).

TARGET:
- If align-items and justify-items can be replaced safely, use place-items.

INPUT CSS:
```css
.layout {
  align-items: center;
  justify-items: center;
}
```

EXPECTED OUTPUT FORMAT:
- Two spaces indentation
- One property per line

CHECKLIST:
- Behavior unchanged
- Output formatting matches requirements
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
- format/property-per-line (warning)
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

END
