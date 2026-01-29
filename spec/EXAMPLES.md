# Examples (v1)

These examples define expected behavior for analysis, fixes, formatting, inline comments, and prompt generation.

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

## Example 3 — Tabs to spaces + property-per-line

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

