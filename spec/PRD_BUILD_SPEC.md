<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# CSS Review Tool — PRD / POD / Build Spec (v1)
Version: 1.2 (v1.1 + clarified “no editing”, recompute apply/revert, “Not planned”, property sorting in v1 as info-only)  
Owner: (you)  
Primary interface: Web UI (mobile-friendly)  
Config scope in v1: **Session only** (no project persistence)

---

## 1) One-liner
A modern CSS review tool that accepts CSS input, flags issues as **error/warning/info**, offers **selective safe fixes**, formats output for **LLM-friendly structure**, and can generate **copy-ready LLM prompts** for fixes that are too risky to automate.

---

## 2) Problem & why now

### 2.1 What’s broken today
- Many existing linters are **outdated** and don’t recognize modern CSS properties/functions (e.g. `place-items`, `place-content`, `container-*`, `light-dark()`), causing false errors or missing guidance.
- Developers increasingly paste CSS into LLMs. Most tools either:
  - minify for least tokens (bad for structure/context), or
  - format for humans (not tuned for LLM parsing and token cost).

### 2.2 Core challenge (explicit)
There is a deliberate trade-off:
- **Structure/context for LLM understanding** (good formatting, predictable layout)
vs
- **Lower tokens** (less whitespace/shorter code)

This product optimizes for **LLM context first**, then applies **rule-driven token reductions** that do *not* destroy structure.

---

## 3) Goals & non-goals

### 3.1 Goals (v1)
- Correctly parse and understand **modern CSS**, including newer properties/functions.
- Show issues as **error/warning/info**, with clear logic and “why it matters”.
- Let users **toggle rules**, change severity, and **toggle whole groups** (session only).
- Let users **select exactly which fixes to apply**.
- Show **inline explanation comments** describing applied fixes (brief + clear), and allow:
  - toggle comments on/off,
  - copy output **with** or **without** comments,
  - remove comments in one action.
- Allow users to **revert** previously applied fixes (deselect) even after seeing output/comments.
- Provide LLM-friendly prompts for tricky fixes that shouldn’t be automated.
- Mobile-friendly UI and interactions.
- Show stats: **tokens, lines, characters** (before/after).
- Include **property sorting** in v1 as a **safe selectable fix** with **default severity = info** (enabled by default; never warning/error in v1).

### 3.2 Non-goals (v1)
- No CLI-first workflow (CLI may come later).
- No “paste from clipboard” button (users paste normally).
- No preprocessor support (SASS/LESS).
- No cross-file analysis (project-wide dead code etc.).
- No persistent “project profiles” saved across sessions in v1.

### 3.3 Not planned (explicit)
These are not planned for v1, v2, v3 (unless explicitly changed later in DECISIONS):
- Auth/accounts (logins, user profiles)
- Project-wide analysis (cross-file; CSS+HTML usage; unused selectors)
- Server-side analysis / hosted API (sending CSS to a backend service)

---

## 4) Target users
- **Primary:** frontend devs + design system maintainers who want modern, clean, LLM-ready CSS.
- **Secondary:** people **learning CSS** who need explainable feedback, not just red squiggles.

---

## 5) Product principles (non-negotiable)
1. **Modern-first parsing:** do not treat new CSS as invalid just because it’s new.
2. **Explainable rules:** every issue must explain “what”, “why”, and “when safe”.
3. **User control:** no silent changes; every fix is opt-in and reversible.
4. **Structure over minify:** keep CSS readable/structured for LLMs by default.
5. **Rule-driven optimization:** token/format improvements come from explicit rules (not hidden magic).
6. **Deterministic output:** same input + same session settings → same issues and same output.

---

## 6) Definitions (controlled vocabulary)
- **Rule:** deterministic check on the CSS AST. Emits zero or more issues.
- **Issue:** finding with `severity`, `rule_id`, `category`, `message`, `location`, `logic`, optional `fix`.
- **Fix:** deterministic transformation that preserves semantics within defined safety constraints.
- **Auto-fix:** a fix the tool can apply, but only if the user selects it.
- **Inline explanation comments:** brief comments inserted to document applied fixes using dedicated syntax.
- **Rule group:** a logical grouping of rules (e.g., modern / consolidation / format / tokens / safety / education).
- **Session config:** current UI settings (rule toggles, severities, rule params) that reset on refresh.

---

## 7) Scope (v1 vs later)

### 7.1 In scope (v1)
- Web UI + mobile support
- CSS input area with syntax highlighting (paste in / view out; no editing workflow beyond paste)
- Analyzer (AST parse + rules)
- Issue list with filtering and logic panel
- Selective fixes + diff preview + revert
- Inline comments: toggle, copy with/without, remove
- LLM prompt generation for non-automatable rules
- Stats: tokens, lines, characters
- Property sorting (safe fix; info-only; enabled by default)

### 7.2 Later (v1.1 / v2)
- CLI + JSON output for CI (v1.1)
- Profiles + parameter sliders (v2):
  - modern vs compatibility
  - context vs token focus
  - structured vs compact formatting
- Persistence of settings across sessions (optional; not in v1)

---

## 8) UX flows (what the user does)

> UX clarification: v1 is paste → analyze → select fixes → copy. No “manual code editing” workflow.

### 8.1 Main flow (review + selective fix)
1. Paste CSS into input
2. Click **Analyze**
3. See issues grouped by severity, filter as needed
4. Click an issue → highlight code + show logic (“what/why/when safe”)
5. Select fixes to apply (single / by rule / by group / by severity)
6. Preview diff
7. Apply (or instantly update output upon selection; see FR-FIX section)
8. Optional: toggle inline comments ON
9. Copy output (with or without comments)

### 8.2 “Tricky fix” flow (LLM prompt)
- For issues marked “not safe to auto-fix”:
  - user clicks **Generate LLM prompt**
  - user copies prompt + relevant CSS snippet
  - tool keeps output formatting requirements explicit in the prompt

### 8.3 Revert flow (must support)
- After applying fixes, user can:
  - uncheck one fix → tool reverts it cleanly
  - keep other applied fixes intact
  - comments update accordingly

---

## 9) Functional requirements (v1)

### 9.1 Editor & input
- **FR-IN-01:** Provide a syntax-highlighted CSS input/output view with line numbers. (No manual editing workflow beyond paste.)
- **FR-IN-02:** Paste input and file upload (`.css`).
- **FR-IN-03:** “Analyze” runs the rule engine and returns issues + stats.
- **FR-IN-04:** No automatic formatting on paste; changes occur only when user selects/apply fixes.

### 9.2 Parsing (modern CSS)
- **FR-PARSE-01:** Parser must support modern CSS constructs and keep accurate source locations.
- **FR-PARSE-02:** Must preserve comments unless user explicitly removes tool-added comments.

### 9.3 Rule engine & issue model
- **FR-RULE-01:** Deterministic output: same input + same session config → same issues and fixes.
- **FR-RULE-02:** Each issue includes:
  - `rule_id`, `severity`, `category`, `message`, `location`
  - `logic`: **WHAT / WHY / WHEN SAFE**
  - `fixable`: yes/no
  - optional `fix` or `llm_prompt`

### 9.4 Rule settings (session only) + groups
- **FR-RCONF-01:** Rules are shown grouped logically (at minimum):
  - `modern`, `consolidation`, `format`, `tokens`, `safety`, `education`
- **FR-RCONF-02:** User can toggle a rule ON/OFF.
- **FR-RCONF-03:** User can cycle severity per rule via quick UI (e.g., click to cycle):
  - `off → info → warning → error → off`
- **FR-RCONF-04:** User can set severity/toggle for an entire group at once.
- **FR-RCONF-05:** Session only in v1 (no saved project profile). Optional “export config” is out of scope for v1 unless explicitly added later.

### 9.5 Fix selection + apply + revert (core)
- **FR-FIX-01:** Fixes are never auto-applied. User selects them.
- **FR-FIX-02:** User can apply fixes:
  - per issue
  - per rule
  - per group
  - per severity
- **FR-FIX-03:** Diff preview before apply (single fix or batch).
- **FR-FIX-04 (updated model):** v1 may implement apply/revert by **recomputing output from original input + selected fixes**:
  - Selecting a fix updates output draft (either immediately or via an “Apply” button).
  - Unselecting a fix reverts it by recomputing output without that fix.
  - Output must be deterministic with a stable fix-application order.
- **FR-FIX-05:** Applying/reverting is idempotent and stable.

### 9.6 Inline explanation comments (brief + clear + reversible)
- **FR-COMMENT-01:** Inline comments are **toggled** by the user (ON/OFF) and are clearly visible in UI.
- **FR-COMMENT-02:** Inline comments are inserted only for **selected/applied** fixes and only when toggle is ON.
- **FR-COMMENT-03:** Comment syntax must be dedicated and easy to detect:
  - `/* cssreview: ... */`
- **FR-COMMENT-04:** Comments must be brief but include:
  - what changed
  - what the old property/value was (when applicable)
  - rule_id (optional but useful)
- **FR-COMMENT-05:** User can remove all tool comments in one action, without touching user comments.
- **FR-COMMENT-06:** If the user reverts a fix, its related inline comment(s) are removed/updated accordingly.

**Example format (end-of-line):**
```css
.button { display: flex; } /* cssreview: format/single-prop: kept single prop on one line */
```

**Example format (multi-line):**
```css
.button {
  margin: 4px 8px; /* cssreview: consolidate/shorthand: was margin-top/right/bottom/left */
}
```

9.7 Copy output (with/without comments)

FR-OUT-01: One-click copy to clipboard:

“Copy output (no comments)”
“Copy output (with comments)”


FR-OUT-02: Copy shows confirmation (toast/snackbar).
FR-OUT-03: No “paste from clipboard” button required.

9.8 Filtering + logic panel

FR-ISSUE-01: Issue list grouped by severity with counts.
FR-ISSUE-02: Filters:

severity
group/category
fixable vs non-fixable
search by rule_id/text


FR-ISSUE-03: Selecting an issue highlights code + opens Rule logic panel with:

WHAT (what detected)
WHY (why it matters: modernity/consolidation/LLM clarity/tokens)
WHEN SAFE (constraints/caveats)


FR-ISSUE-04: No generic examples required if the UI can clearly show the relevant part of the user’s code + the proposed output/diff.

9.9 LLM prompt generation (for hard rules)

FR-LLMP-01: Some rules are marked “not safe to auto-fix”.
FR-LLMP-02: For those, UI offers Generate LLM prompt.
FR-LLMP-03: Prompt must include:

task statement
constraints (preserve cascade/order)
target improvements
the relevant CSS snippet(s)
expected output formatting (LLM-friendly structure)



9.10 Stats (tokens, lines, chars)

FR-STAT-01: Show before/after:

token estimate
line count
character count


FR-STAT-02: Token estimate is consistent and repeatable (exact tokenizer not required in v1).


10) Non-negotiable constraints (hard rules)
10.1 Safety

C-SAFE-01: Auto-fixes must not change selector specificity or rule order.
C-SAFE-02: If deterministic semantic equivalence cannot be guaranteed, do not auto-fix.

10.2 Modern CSS recognition & “unrecognized property”

C-MODERN-01: The tool must not treat valid modern syntax as invalid.
C-MODERN-02: If a property is not recognized by the tool, emit info only:

“Info: property not recognized (may be new/experimental).”


C-MODERN-03: Rules must explicitly state which properties/contexts they apply to, to avoid accidental application.

10.3 Formatting philosophy

C-LLM-01: Default formatting is structured for LLM comprehension, not minified.
C-LLM-02: Token improvements come from explicit rules (e.g., tabs→spaces, whitespace normalization, shorthands) rather than blanket minification.


11) Rulebook design (authoring model = Hybrid “C”)
11.1 Rule structure
Rules are authored as a hybrid:

Declarative metadata (simple file): rule_id, group, default severity, fixability, applicable contexts
Implementation logic (code): AST traversal, detection, patch creation

11.2 Rule must declare applicability
Each rule must include an “applies_to” section:

properties/functions/at-rules affected
contexts (e.g., only inside declaration blocks, only for colors, only for layout)

11.3 Minimum v1 rule set (representative)
Safety

safety/invalid-syntax (error)
safety/unrecognized-property (info only; modern-friendly)

Format (LLM-structure rules)

format/indent-2-spaces (warning/error depending on strictness)
format/no-tabs (warning)
format/property-per-line (warning)
format/single-prop-single-line (configurable):

if selector has only one property, allow one-line formatting


format/sort-properties (info, enabled by default; safe selectable fix)

Consolidation

consolidate/shorthand-margin-padding (warning)
consolidate/deduplicate-last-wins (warning)

Tokens

tokens/zero-units (warning)
tokens/shorten-hex-colors (warning)

Modern (guidance)

modern/suggest-logical-properties (info)
modern/suggest-place-* (info)
modern/container-queries-guidance (info)


12) Formatting rules (LLM-friendly, rule-driven)
Baseline output style:

2 spaces indentation
no tabs
stable structure
predictable line breaks

Token minimization is achieved by specific rules such as:

tabs → spaces
remove excessive spaces
allow single-line for single-property selectors (configurable rule param)
shorten values when safe (0px → 0, #ffffff → #fff)
property sorting (deterministic; info-only; user-selectable)


## 13) Data model (canonical)

### 13.1 Issue object
```json
{
  "rule_id": "format/property-per-line",
  "group": "format",
  "severity": "warning",
  "message": "Put each property on a new line.",
  "location": { "start": { "line": 10, "column": 1 }, "end": { "line": 10, "column": 60 } },
  "logic": {
    "what": "Multiple declarations detected on one line.",
    "why": "Improves LLM parsing and keeps structure predictable.",
    "when_safe": "Always safe; formatting only."
  },
  "fixable": true,
  "fix": {
    "kind": "patch",
    "preview": "...\n"
  }
}
```

13.2 Fix selection tracking (session) — v1 model
v1 may implement apply/revert via output recomputation from original input + selected fixes:

selected fix IDs
deterministic apply order
conflict handling (prevent or deterministic resolution)


14) Acceptance criteria (testable)
14.1 Modern CSS

AC-01: place-items, container-type, light-dark() are not flagged as unknown.
AC-02: Unrecognized property emits info only and never blocks fixes.

14.2 Rule settings (session)

AC-03: User can toggle one rule off and rerun analysis; issues from that rule disappear.
AC-04: User can set an entire rule group to “off”; all group issues disappear.
AC-05: User can cycle severity per rule quickly (click/toggle) and rerun; severities update immediately.

14.3 Fixing + revert

AC-06: User can select a fix, see output updated, then unselect it and output returns accordingly.
AC-07: Unselecting one fix does not remove other selected fixes.
AC-08: After select/unselect cycles, output remains stable (no formatting drift).

14.4 Inline comments

AC-09: When comments toggle is ON, selected fixes add brief inline comments with old value/property reference.
AC-10: Copy output supports both with and without comments.
AC-11: “Remove tool comments” removes only /* cssreview: ... */, preserves user comments.

14.5 Stats

AC-12: UI shows tokens/lines/chars before and after. Values update after selecting/unselecting fixes.

14.6 Mobile

AC-13: On mobile, user can paste, analyze, filter, select/unselect fixes, and copy without UI blocking actions.


15) Roadmap
v1 (this spec)
Web UI-first, session-only config, selective fixes + revert, inline comments toggle/copy/remove, modern recognition, LLM prompt generation, stats, mobile support.
v1.1
CLI wrapper + JSON output for CI.
v2
Switchable profiles/parameters (modern vs compatibility, token vs context, compact vs structured), saved profiles, richer compatibility model.

16) Open questions (optional)

Should default severity for format rules be warning or error?
Should “single-prop single-line” be ON by default?

END
