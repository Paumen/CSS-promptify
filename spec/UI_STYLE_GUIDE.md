<!--
STATUS: Authoritative reference for UI visual styling + CSS maintainability
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: Follow these styling rules when building the React UI.
-->

# UI Style Guide (v1)

This document defines **visual styling rules** and **CSS maintainability constraints**.
Behavior and UI state are defined in `spec/UI_BEHAVIOR.md`. This file is about styling.

> Goals:
> - Keep styling maintainable and coherent.
> - Reuse a small set of primitives (Panel/Button/etc.), not per-screen classes.
> - Prefer modern CSS (`light-dark()`, grid, container queries, shorthands).

---

## 1) Styling approach (required)

### 1.1 Use CSS Modules for component styling
- Component-specific styles MUST live in `*.module.css`.
- Avoid global class selectors for app components (prevents leakage and collisions).

### 1.2 Use a small global tokens layer
- Global tokens MUST live in `app/src/styles/tokens.css`.
- Component CSS Modules MUST only reference colors/spacing via tokens (no hardcoded colors).

### 1.3 Prefer reusable UI primitives over new classes
Reusable primitives MUST exist (as React components) and be used across the app:
- `Panel`
- `Button`
- `Stack` (vertical spacing)
- `Row` (horizontal alignment)
- `CodeBlock`
- `Badge` (severity chips)

Rule: Do NOT create separate “panel variants” like `panelInput`, `panelIssues`, `panelOutput`.
Use the same `Panel` component three times.

---

## 2) Design tokens (small set, not too many)

### 2.1 Token budget rule
- If a value is used in **3+ places**, make it a token.
- Otherwise, inline it in the component module.
- Keep the token set small and stable.

### 2.2 Required token categories
Tokens MUST cover:
- Colors: background, surface, text, muted text, border, accent, danger/warn/info
- Spacing: 4–6 steps max
- Radius: 2–3 values
- Typography: 3–4 sizes max
- Shadow: 1–2 max

### 2.3 Light/dark via `light-dark()`
- Use semantic tokens with `light-dark()`.
- Do not define separate theme files in v1.

Example intent (exact values may differ):
- `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`
- `--danger`, `--warn`, `--info`

---

## 3) Layout rules (required)

### 3.1 Use Grid for the main layout
- The main shell MUST use CSS Grid.
- Desktop: 2–3 columns layout is acceptable.
- Mobile: panels become tabs/screens (per `spec/UI_BEHAVIOR.md`), or stack vertically.

### 3.2 Use container queries inside panels
- Panels MUST set `container-type: inline-size;` so internal layouts can adapt.
- Prefer container queries over many viewport breakpoints.

### 3.3 Prefer `gap` over margin hacks
- Use `gap` for spacing in rows/columns.
- Avoid “margin-bottom on every child” patterns.

---

## 4) Modern CSS + shorthand rules (required)

### 4.1 Shorthands preferred when clearer
Prefer:
- `place-items`, `place-content`, `place-self`
- `margin` / `padding` shorthands
- `border` shorthand
- `grid-template` / `grid` shorthands when readable

### 4.2 Avoid over-clever selectors
- Keep selectors shallow (max ~2 levels).
- Avoid chaining like `.Panel .Header .Title span`.

---

## 5) Component styling standards (coherence rules)

### 5.1 Panels
- A `Panel` has: header, body, footer (even if some are empty).
- Padding, radius, border, and surface color MUST be consistent across all panels.
- Panel spacing MUST use spacing tokens.

### 5.2 Buttons
- A single base Button style MUST define:
  - height
  - padding
  - font size/weight
  - radius
- Variants may change only color/border/background.
- All buttons must share the same height and horizontal padding by default.

### 5.3 Inputs / Textareas
- Inputs and textareas MUST visually match buttons (radius, border, focus style).
- Use consistent padding and font sizing.

### 5.4 Code blocks
- Code blocks MUST be horizontally scrollable (no destructive wrapping).
- Use a consistent monospace font and token-based colors.

---

## 6) Accessibility styling (required)
- Focus states MUST be visible (not removed).
- Tap targets on mobile should be comfortable (avoid tiny buttons/checkboxes).
- Maintain good contrast between text and surfaces in both light and dark.

---

## 7) File/folder conventions (recommended)

Suggested structure:
- `app/src/styles/tokens.css` (global tokens + base reset)
- `app/src/ui/primitives/Panel/Panel.tsx` + `Panel.module.css`
- `app/src/ui/primitives/Button/Button.tsx` + `Button.module.css`
- `app/src/ui/primitives/...`

Primitives are reused across all screens.

---

END
