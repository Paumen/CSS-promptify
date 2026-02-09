<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# CSS Review Tool — PRD / POD / Build Spec (v1)
Version: 1.2 
Owner: (human)  
Primary interface: Web UI (mobile-friendly)  
Config scope in v1-v3: 

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

## 3) Goals & Non-Goals

### 3.1 Goals (v1)
- Implement a web-based, mobile-friendly CSS review tool.
- Analyze pasted CSS, identifying issues and offering safe, selective fixes.
- Output clean, structured CSS optimized for LLM comprehension.
- For non-safe fixes, generate copy-ready LLM prompts.
- Provide a fast, intuitive workflow: paste → analyze → select fixes → copy.

### 3.2 Non-Goals (Out of Scope for v1-v3)
- No user accounts or authentication.
- No project-wide or cross-file analysis.
- No server-side analysis or hosted API.
- No preprocessor support (Sass/Less).
- No CLI-first workflow.

---

## 4) Target Users
- **Primary:** Frontend developers and design system maintainers who want modern, clean, LLM-ready CSS.
- **Secondary:** Learners who need explainable feedback on their CSS.

---

## 5) Product Principles (Non-Negotiable)
1.  **Modern-First Parsing:** The parser must recognize modern CSS syntax (e.g., `container-*`, `light-dark()`) and not flag it as invalid.
2.  **Explainable Rules:** Every issue must clearly explain the **What** (the finding), **Why** (the impact), and **When Safe** (the constraints for fixing).
3.  **User Control & Reversibility:** No silent changes. Every fix is opt-in, previewable, and cleanly reversible by the user.
4.  **Structure Over Minification:** The default output must be well-structured for LLM comprehension. Token reduction is a secondary goal, achieved via explicit, structure-preserving rules.
5.  **Deterministic Output:** The tool must be idempotent. Given the same input CSS and the same session configuration, it will always produce the exact same set of issues and the same output CSS.
6.  **Fast, Focused Workflow:** The core UX loop (paste, analyze, select, copy) must be fast and efficient, especially on mobile.

---

## 6) Definitions & Data Contracts

> For all official definitions, terminology, and data contracts (e.g., `Issue`, `Rule`, `Fix`), refer to the following canonical sources:
> - `spec/TERMINOLOGY.md` — Preferred terms and naming conventions.
> - `spec/DATA_CONTRACTS.md` — Enums, invariants, and data shapes.
> - `spec/TYPES.md` — TypeScript interfaces.

---

## 7) Scope & Versioning

### 7.1 In Scope (v1)
- Web UI with mobile support.
- CSS input area (paste-only) and syntax-highlighted output view.
- Core analyzer engine (AST parser + rule runner).
- An initial set of at least 15 rules from "Tier 1."
- Issues panel with filtering by severity, group, and fixability.
- Selective fixes with diff preview and revert functionality.
- A "Rule Logic" panel showing WHAT/WHY/WHEN SAFE for each issue.
- Toggleable inline comments for applied fixes (e.g., `/* cssreview: ... */`).
- Stats display (lines, characters, and a token estimate).
- Property sorting rule (safe fix, info-level, on by default).

### 7.2 New in v2
- Generate LLM-friendly prompts for complex fixes that cannot be safely automated.
- "Paste from clipboard" button for faster input.
- Expand rule set to at least 25 total rules (Tier 1 & 2).

### 7.3 Potential Future Features (v3 and beyond)
- **Accurate Token Counting:** Display exact token counts (before/after) using a precise tokenizer.
- **Configuration Profiles:** Allow users to switch between presets (e.g., "Modern vs. Compatibility," "Max Context vs. Min Tokens").
- **Persistence:** Optionally save user severity preferences across sessions.
- **Expanded Rule Set:** Grow to 35+ rules.

---

## 8) UX Flows (What the User Does)

> UX clarification: v1 is paste → analyze → select fixes → copy. There is no manual code editing workflow.

### 8.1 Main Flow (Review & Selective Fix)
1.  Paste CSS into the input panel.
2.  Click **Analyze**.
3.  View issues, grouped by severity. Filter or sort them as needed.
4.  Click an issue to highlight the relevant code and see its logic (What/Why/When Safe).
5.  Select fixes to apply (individually, by rule, by group, or by severity).
6.  Preview the diff of pending changes.
7.  Apply the fixes to the output panel.
8.  Toggle inline explanation comments ON to see what changed.
9.  Copy the final CSS to the clipboard (with or without comments).

### 8.2 "Tricky Fix" Flow (LLM Prompt Generation)
- For issues marked as not safe to automate (`prompt`):
  - User clicks a **Generate LLM Prompt** button.
  - The tool generates a prompt containing the task, constraints, and the relevant CSS snippet.
  - User copies the complete prompt for use in an LLM.

### 8.3 Revert Flow
- After applying fixes, the user can:
  - Uncheck a single fix.
  - The tool cleanly reverts that specific change, leaving other applied fixes intact.
  - Inline comments are updated automatically.

---

## 9) Functional Requirements

### 9.1 Editor & Input
- **FR-IN-01:** Provide syntax-highlighted CSS input/output views with line numbers.
- **FR-IN-02:** Support pasting CSS content into the input view.
- **FR-IN-03:** An "Analyze" action runs the rule engine, populating the issues list and stats.
- **FR-IN-04:** No automatic formatting on paste. Changes only occur when the user selects and applies fixes.

### 9.2 Parsing (Modern CSS)
- **FR-PARSE-01:** The parser must correctly handle modern CSS constructs (e.g., nesting, `light-dark()`) and maintain accurate source locations.
- **FR-PARSE-02:** The parser must preserve user comments. Tool-generated comments are handled separately.

### 9.3 Rule Engine & Issue Model
- **FR-RULE-01:** The engine must be deterministic, as defined in the Product Principles.
- **FR-RULE-02:** Each issue must conform to the data contract in `spec/DATA_CONTRACTS.md`, including `rule_id`, `severity`, `group`, `message`, `location`, `logic`, and `fixability`.

### 9.4 Rule Settings (Session Only)
- **FR-RCONF-01:** Rules must be displayed in logical groups (e.g., `modern`, `consolidation`, `format`).
- **FR-RCONF-02:** The user can toggle individual rules ON or OFF for the current session.
- **FR-RCONF-03:** The user can cycle the severity of a rule (`off → info → warning → error`).
- **FR-RCONF-04:** The user can configure an entire group at once (e.g., set all "format" rules to "off").
- **FR-RCONF-05:** All settings are session-only in v1 and reset on page refresh.

### 9.5 Fix Selection, Apply, & Revert (Core)
- **FR-FIX-01:** Fixes are never applied automatically. The user must select them.
- **FR-FIX-02:** The user can select fixes per-issue, per-rule, per-group, or per-severity.
- **FR-FIX-03:** A diff preview must be available for both single and batched fixes.
- **FR-FIX-04 (Implementation Model):** The output is generated by recomputing from the original input plus the set of selected fixes. Unselecting a fix reverts it by recomputing the output without that fix. This ensures a stable and predictable process.
- **FR-FIX-05:** Applying and reverting fixes must be idempotent and stable.

### 9.6 Inline Explanation Comments
- **FR-COMMENT-01:** Inline comments can be toggled ON/OFF by the user.
- **FR-COMMENT-02:** Comments are inserted only for applied fixes and only when the toggle is ON.
- **FR-COMMENT-03:** Comment syntax must be unique and easily detectable: `/* cssreview: ... */`.
- **FR-COMMENT-04:** Comments should be concise (target <80 characters) and explain the change, optionally including the `rule_id`.
- **FR-COMMENT-05:** The user can remove all tool-generated comments in one action without affecting user comments.
- **FR-COMMENT-06:** If a fix is reverted, its associated comment is automatically removed.

**Example:**
```css
/* cssreview: shorthand-margin: Collapsed margin: 0px 8px 0px 8px */
margin: 0 8px;
```

### 9.7 Copy Output
- **FR-OUT-01:** Provide one-click "Copy" buttons for the output, both with and without comments.
- **FR-OUT-02:** Show a confirmation (e.g., toast) after a successful copy.

### 9.8 Filtering & Logic Panel
- **FR-ISSUE-01:** The issue list must be grouped by severity with counts for each group.
- **FR-ISSUE-02:** Support filtering the issue list by `severity`, `group`, `fixability`, and free text search.
- **FR-ISSUE-03:** Selecting an issue must highlight the corresponding code and display the rule's logic panel (WHAT/WHY/WHEN SAFE).
- **FR-ISSUE-04:** The UI should clearly show the proposed change (diff), making generic examples in the logic panel unnecessary.

### 9.9 LLM Prompt Generation
- **FR-LLMP-01:** Rules that are not safe to automate are marked accordingly.
- **FR-LLMP-02:** For these rules, the UI offers a "Generate LLM Prompt" action.
- **FR-LLMP-03:** The generated prompt must include a clear task, constraints, the target improvement, the relevant CSS snippet, and expected output formatting.

### 9.10 Stats
- **FR-STAT-01:** Display "before" and "after" stats for line count and character count.
- **FR-STAT-02:** Display a "before" and "after" token estimate. 

---

## 10) Non-Negotiable Constraints (Hard Rules)
### 10.1 Safety
- **C-SAFE-01:** Auto-fixes must not change selector specificity or CSS rule order.
- **C-SAFE-02:** If deterministic semantic equivalence cannot be guaranteed, the fix must not be classified as safe.

### 10.2 Modern CSS Recognition
- **C-MODERN-01:** The tool must not treat valid, modern CSS syntax as an error.
- **C-MODERN-02:** If a property is not recognized, it should emit an `info`-level issue at most (e.g., "Property not recognized; may be new or experimental.").
- **C-MODERN-03:** Rules must explicitly declare the properties/contexts they apply to, preventing accidental application to unrelated syntax.

### 10.3 Formatting Philosophy
- **C-LLM-01:** The default output format is structured for LLM comprehension, not minified for size.
- **C-LLM-02:** Token reduction is achieved through explicit, documented rules, not blanket minification.

---

## 11) Rulebook Design
### 11.1 Rule Structure
Rules are defined as a hybrid of:
- **Declarative Metadata:** A simple structured data file (e.g., YAML, JSON) defining the `rule_id`, `group`, default `severity`, `fixability`, and applicable contexts.
- **Implementation Logic:** Code (e.g., TypeScript) that performs the AST traversal, detection, and patch creation.

### 11.2 Rule Applicability
- Each rule's metadata must declare its scope (e.g., properties, functions, at-rules it affects) to ensure it only runs where intended.

---

## 12) Formatting & Tokenization Rules (LLM-Friendly)
- **Baseline Style:** 2-space indentation, no tabs, stable structure, and predictable line breaks.
- **Token Reduction:** Achieved via specific, configurable rules, such as:
  - `tabs-to-spaces`
  - `normalize-whitespace`
  - `zero-value-no-unit` (`0px` → `0`)
  - `hex-shorthand` (`#ffffff` → `#fff`)
  - `sort-properties` (deterministic order)

---

## 13) Data Model (Canonical)

> See `spec/DATA_CONTRACTS.md` and `spec/TYPES.md` for all data model definitions.

---

## 14) Acceptance Criteria (Testable)
### 14.1 Modern CSS
- **AC-01:** Pasting CSS with `place-items`, `container-type`, or `light-dark()` does not produce "unknown property" errors.
- **AC-02:** An unrecognized property (e.g., `--my-new-prop: oklch(50% 0.15 250)`) emits an `info`-level issue and does not block other fixes.

### 14.2 Rule Settings
- **AC-03:** Toggling a rule off and re-analyzing removes its issues from the list.
- **AC-04:** Setting a rule group to "off" and re-analyzing removes all issues from that group.
- **AC-05:** Changing a rule's severity is reflected in the issue list upon re-analysis.

### 14.3 Fixing & Revert
- **AC-06:** A user can select a fix, see the output update, then unselect it, and the output correctly reverts to its previous state.
- **AC-07:** Unselecting one fix does not affect other, unrelated selected fixes.
- **AC-08:** After multiple select/unselect cycles, the output remains stable and correct.

### 14.4 Inline Comments
- **AC-09:** When the comments toggle is ON, applying a fix adds a `/* cssreview: ... */` comment to the output.
- **AC-10:** The "Copy" buttons work correctly for both with and without comments.
- **AC-11:** A "Remove tool comments" action strips all `cssreview:` comments but preserves user-written comments.

### 14.5 Stats
- **AC-12:** The stats panel (tokens/lines/chars) updates accurately as fixes are selected and unselected.

### 14.6 Mobile
- **AC-13:** The entire core workflow (paste, analyze, filter, select, copy) is usable on a standard mobile viewport without horizontal scrolling or blocked actions.

spec-uix-01: Output pane updates immediately as user checks/unchecks fixes.
spec-uix-02: Copy actions are explicit: “copy with comments” or “copy without comments.”
spec-uix-03: Inline tool comments are brief and end-of-line style.

spec-eng-01: CSS parser is css-tree.
spec-eng-02: Apply/revert implemented via recompute from original input + selected fixes.
spec-eng-03: Rule IDs use verb prefix consistently: e.g., consolidate/, format/, tokenize/.
spec-eng-04: Conflicting fixes cannot both be selected; conflicts must be visible to the user.

spec-sts-01: Maximum CSS input size is 100KB; warn above 50KB.
spec-sts-02: Rule toggles, severities, and parameters are session-only in v1; reset on refresh.
spec-sts-03: Users can select fixes individually and revert independently.

spec-nfr-01: Token estimate uses character-based heuristic (tokens ≈ characters / 4).
spec-nfr-02: Stats display token estimate, line count, and character count before/after.
spec-nfr-03: Properties not recognized by the tool are reported as info-only; never warning/error.

END
