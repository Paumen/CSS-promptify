# UI Behavior (v1)

This document defines **UI behavior and state**, not visual design.  
It is written to prevent ambiguity and to keep LLM-assisted implementation consistent.

> Source of truth: If anything conflicts, `spec/PRD_BUILD_SPEC.md` wins.

---

## 1) UI goals (v1)
- Make analysis results easy to **see, filter, and understand**.
- Make fixes **selectable**, **previewable**, **applyable**, and **revertible**.
- Make inline tool comments **toggable**, **removable**, and **copyable** (with/without).
- Make everything usable on **mobile**.

---

## 2) Required UI surfaces

### 2.1 Editor Panel (CSS input/output)
- Syntax-highlighted editor
- Line numbers
- Highlighting for selected issue ranges
- The editor shows the **current CSS state** (after applied fixes)

### 2.2 Issues Panel
- Issues grouped by severity: error / warning / info
- Counts per severity
- Filters (severity, group, fixable, search)
- Issue list items are clickable and show selection state

### 2.3 Issue Detail + Rule Logic Panel
When an issue is selected, show:
- rule_id, group, severity
- message
- **Rule logic**:
  - WHAT: what was detected
  - WHY: why it matters (LLM clarity / tokens / consolidation / modernity)
  - WHEN SAFE: constraints / caveats

### 2.4 Fix Preview / Diff Panel
- Before/after diff preview for the selected issue (or for a batch apply)
- “Apply” action must be visible in this context

### 2.5 Applied Fixes Panel (session)
- List of applied fixes (in order applied)
- Each entry has:
  - checkbox (checked = applied)
  - rule_id
  - short description
- Unchecking an applied fix reverts it (see section 6)

### 2.6 Copy + Export Controls
Required buttons:
- Copy output (no comments)
- Copy output (with comments)
- Copy LLM prompt (when available)
- Remove tool comments
- Reset to original input

### 2.7 Stats Bar
Must show BEFORE and AFTER for:
- Token estimate
- Line count
- Character count

---

## 3) Session-only config (v1)
All settings are **session-only** and reset on refresh.

### 3.1 Rule Settings View
Rules are grouped at minimum by:
- modern, consolidation, format, tokens, safety, education

For each rule:
- Toggle ON/OFF
- Quick severity cycle: `off → info → warning → error → off`

For each group:
- Toggle group OFF/ON
- Set group severity (applies to all rules in group) OR “off”

Notes:
- If group settings conflict with per-rule settings, per-rule overrides win within the session.
- v1 does not require saving profiles.

---

## 4) Inline tool comments behavior (v1)

### 4.1 Comments toggle
- UI provides a clear toggle: **Inline comments: ON/OFF**
- When ON: applied fixes include tool comments in the editor output
- When OFF: editor output must not show tool comments

### 4.2 Comment format
- Dedicated marker prefix required: `cssreview:`
- Comments must be **brief but clear** and should include old property/value when applicable.
- Preferred style: **end-of-line** (compact)

Example:
```css
color: #fff; /* cssreview: tokens/shorten-hex-colors: was #ffffff */
```

### 4.3 Remove tool comments
- “Remove tool comments” removes only comments containing `cssreview:` and preserves all other user comments.
- This action must be idempotent.

### 4.4 Copy modes
- Copy output (no comments): copies CSS after stripping tool comments only
- Copy output (with comments): copies CSS including tool comments if comments are ON; if comments are OFF, this copies the same as “no comments”

---

## 5) Analysis + issue navigation behavior

### 5.1 Analyze action
- Runs parsing + rule evaluation and updates:

