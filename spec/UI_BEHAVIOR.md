<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# UI Behavior (v1)

This document defines **UI behavior and state**, not visual design.
It is written to prevent ambiguity and to keep LLM-assisted implementation consistent.

> Source of truth: If anything conflicts, `spec/PRD_BUILD_SPEC.md` wins.
>
> **Related specifications:**
> - `spec/DATA_CONTRACTS.md` — canonical definitions for recompute model (§4.3), conflict handling (§4.5), deterministic ordering (§4.4), and invariants (§6)
> - `spec/TYPES.md` — TypeScript interfaces

---

## 0) UX clarification (v1)
v1 is intentionally: **paste → analyze → select fixes → copy output**.

- No “manual code editing” workflow beyond paste.
- Apply/revert is implemented via **recompute output from original input + selected fixes** (deterministic).

---

## 1) UI goals (v1)
- Make analysis results easy to **see, filter, and understand**.
- Make fixes **selectable**, **previewable**, **applyable**, and **revertible**.
- Make inline tool comments **toggable**, **removable**, and **copyable** (with/without).
- Make everything usable on **mobile**.

---

## 2) Required UI surfaces

### 2.1 Input / Output view (CSS)
- Syntax-highlighted CSS view
- Line numbers (best-effort)
- Highlighting for selected issue ranges (best-effort)
- The tool shows:
  - **Original input CSS** (what the user pasted)
  - **Derived output CSS** (after selected fixes are applied)

Notes:
- v1 does not require live editing; paste in, copy out.

### 2.2 Issues Panel
- Issues grouped by severity: error / warning / info
- Counts per severity
- Filters (severity, group, fixability, search)
- Issue list items are clickable and show selection state

### 2.3 Issue Detail + Rule Logic Panel

> **Important:** Every issue MUST display rule logic (WHAT/WHY/WHEN SAFE).
> This is a UI behavior guarantee, not a separate rule.
> The `logic` field is required in every Issue object (see `spec/DATA_CONTRACTS.md` §3).

When an issue is selected, show:
- rule_id, group, severity
- message
- **Rule logic** (required for all issues):
  - WHAT: what was detected
  - WHY: why it matters (LLM clarity / tokens / consolidation / modernity)
  - WHEN SAFE: constraints / caveats
- If fixability starts with `safe`:
  - show fix preview/diff
  - show "Select fix" checkbox (or equivalent action)
- If fixability = `safe (force user to choose)`:
  - require a user choice (or session config) before generating/applying patches
- If fixability = prompt:
  - show "Copy LLM prompt" action

### 2.4 Fix Preview / Diff Panel
- Before/after diff preview for:
  - selected issue fix, OR
  - a batch of selected fixes
- The UI must clearly show what will change before the user commits to it.

### 2.5 Selected Fixes Panel (session)  ✅ (replaces “Applied Fixes Panel”)
Because v1 uses **recompute-from-original**, we track *selected* fixes (not an undo stack).

- List of **selected fixes** (deterministic order)
- Each entry has:
  - checkbox (checked = selected)
  - rule_id
  - short description
- Unchecking a selected fix reverts it automatically (by recompute).

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
- When ON: selected fixes include tool comments in the derived output
- When OFF: derived output must not show tool comments

### 4.2 Comment format
- Dedicated marker prefix required: `cssreview:`
- Comments must be **brief but clear** and should include old property/value when applicable.
- Preferred style: **end-of-line** (compact)

Example:
```css
color: #fff; /* cssreview: tokens/shorten-hex-colors: was #ffffff */
```

### 4.3 Remove tool comments

“Remove tool comments” removes only comments containing cssreview: and preserves all other user comments.
This action must be idempotent.

### 4.4 Copy modes

Copy output (no comments): copies CSS after stripping tool comments only
Copy output (with comments): copies CSS including tool comments if comments are ON; if comments are OFF, this copies the same as “no comments”.


## 5) Analysis + issue navigation behavior
### 5.1 Analyze action

Runs parsing + rule evaluation and updates:

Issues list
Stats (before baseline)
Available fixes/prompts


If parsing fails:

show safety/invalid-syntax issue(s)
keep UI usable (user can still copy original input, adjust settings, etc.)



### 5.2 Selecting an issue
Selecting an issue must:

highlight code location (best-effort)
show full rule logic panel (WHAT/WHY/WHEN SAFE)
show fix preview/diff or LLM prompt actions depending on fixability


## 6) Fix selection + apply + revert (core)
### 6.1 Selection model (v1)

Fixes are never auto-applied.
User selects fixes via checkboxes (issue-level / rule-level / group-level / severity-level).
Selected fixes are tracked as selected_fix_ids in session state.

### 6.2 Apply model (v1)
**v1 Decision:** Use Variant A (immediate update).

Output updates immediately as soon as user checks/unchecks fixes. No "Apply" button required.

Behavior:
- User checks a fix → output recomputes instantly with that fix applied
- User unchecks a fix → output recomputes instantly without that fix
- Output is always derived from `original_css + selected_fix_ids + comments_enabled`

Performance note: May need debouncing if rapid selection causes lag.

### 6.3 Revert model (v1)
Revert is simply unselect:

User unchecks a selected fix
Tool recomputes output CSS without that fix
Output returns to the state “as if that fix was never selected”

### 6.4 Deterministic ordering (required)
When multiple fixes are selected, UI must apply them in a deterministic order (as defined in DATA_CONTRACTS):

sort by earliest patch start position (line/column)
tie-break by rule_id then fix.id

The UI may display this order in “Selected Fixes Panel”.
### 6.5 Conflicts (required)
**v1 Decision:** Use Option A — prevent selecting both conflicting fixes.

If two fixes overlap/conflict:
1. UI blocks selection of the second fix
2. UI shows a conflict notice: "Fix A conflicts with Fix B. Deselect Fix A to select Fix B."
3. User must explicitly deselect the conflicting fix before selecting another

This ensures behavior is deterministic and user explicitly chooses which fix to apply.


## 7) Filtering behavior (Issues Panel)
Filters must include:

severity: error / warning / info (multi-select)
group: modern / consolidation / format / tokens / safety / education (multi-select)
fixability: safe (auto) / safe (force user to choose) / prompt / none
search: matches rule_id and message text

Filters apply instantly to the visible list.

## 8) Mobile behavior
Minimum mobile requirements:

Panels can be tabs/screens (Input / Fixes / Output / Settings)
Tap targets are large enough for fingers
Code is horizontally scrollable (no destructive wrapping)
Copy buttons are reachable without precision clicking


## 9) UI acceptance checks (behavioral)

User can: paste → analyze → filter → select issue → preview fix → select fix → see output → unselect fix → output reverts → copy output.
User can toggle inline comments ON/OFF and see output update immediately.
Copy “no comments” never includes cssreview: comments even if comments are ON.
“Remove tool comments” removes only tool comments, not user comments.

END
