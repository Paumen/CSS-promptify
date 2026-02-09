<!--
CLAUDE_PERMISSIONS: READ | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_WITH_HUMAN_PR_REVIEW
PURPOSE: Authoritative Reference
AUTHORITY: None
IF_CONFLICT: N/A (this is root)
IF_OUTDATED: Flag human
PRIORITY: CRITICAL
-->


# PRD / Build SPEC

Version: 1.3

Owner: (human) 

Primary interface: Web UI (cross-platform) 

Config scope in v1-v3:

--- 

## 1) One-liner

A modern CSS review tool that accepts CSS input, flags issues as **error/warning/info**, offers **selective safe fixes**, formats output for **LLM-friendly structure**, and can generate **copy-ready LLM prompts** for fixes that are too risky to automate.

---

## 2) Problem Statement

### 2.1 What’s broken today

- Many existing linters are **outdated** and don’t recognize modern CSS properties/functions (e.g. `place-items`, `place-content`, `container-*`, `light-dark()`), causing false errors or missing guidance.

- Developers increasingly paste CSS into LLMs. Most tools either:

  - minify for least tokens (bad for structure/context), or

  - format for humans (not tuned for LLM parsing and token cost).

### 2.2 Core challenge 

There is a deliberate trade-off:

- **Structure/context for LLM understanding** (good formatting, predictable layout)

vs

- **Lower tokens** (less whitespace/shorter code)


This product optimizes for **LLM context first**, then applies **rule-driven token reductions** that do *not* destroy structure.

---

## 3) Product Principles (Non-Negotiable)

1.  **Cross-platform Parsing:** The parser must recognize modern CSS syntax (e.g., `container-*`, `light-dark()`) and not flag it as invalid.

2.  **Explainable Rules:** Every issue must clearly explain the **What** (the finding), **Why** (the impact), and **Fixibility**.

3.  **User Control & Reversibility:** No silent changes. Every fix is opt-in, previewable, and cleanly reversible by the user.

4.  **Structure Over Minification:** The default output must be well-structured for LLM comprehension, as well as token reduction, achieved via explicit, structure-preserving rules.

5.  **Deterministic Output:** The tool must be idempotent. Given the same input CSS and the same session configuration, it will always produce the exact same set of issues and the same output CSS.

6.  **Fast, Focused Workflow:** The core UX loop (paste, analyze, select, copy) must be fast and efficient, especially on mobile.

---

## 4) Definitions & Data Contracts

> For all official definitions, terminology, and data contracts (e.g., `Issue`, `Rule`, `Fix`), refer to the following canonical sources:

> - `SPEC/TERMINOLOGY.md` — Preferred terms and naming conventions.

> - `SPEC/DATA_CONTRACTS.md` — Enums, invariants, and data shapes.

> - `SPEC/TYPES.md` — TypeScript interfaces.

---


## 5) REQUIREMENTS (SPEC)


### 9.1 UX & UI (UIX)

SPEC-uix-01: Provide syntax-highlighted CSS input and output views with line numbers.
SPEC-uix-02: Support pasting CSS content into the input view.
SPEC-uix-03: An Analyze action runs the rule engine and populates the issues list and stats.
SPEC-uix-04: The issue list must be grouped by severity (info, warning, error) and show counts for each severity.
SPEC-uix-05: Support filtering the issue list by severity, group, fixability, and syntax (selector | property | declaration | at-rule | function | value | comment | unknown).
SPEC-uix-06: Selecting an issue must highlight the corresponding code location and display the rule logic panel (WHAT/WHY/Fixability) plus the proposed diff.

SPEC-uix-07: The UI must clearly show the proposed change as a diff such that generic examples in the logic panel are unnecessary.

SPEC-uix-08: Show a confirmation toast after a successful copy.

SPEC-uix-09: Display before and after stats (line count, character count, token estimate) prominently in the UI.

SPEC-uix-10: Unknown/unrecognized properties must be presented as info-level only.

SPEC-uix-11: Output panel updates within 200ms after a fix toggle for inputs up to 50KB and within 500ms up to 100KB.

SPEC-uix-12: If a property is not recognized, it must emit an info-level issue at most (e.g., "Property not recognized; may be new or experimental.").

SPEC-uix-13: Copy output with comments must include all tool-generated annotations. Copy output without comments must exclude all tool annotations. 

SPEC-uix-14: User can toggle comment visibility in output without modifying underlying code.

SPEC-uix-15: User pastes CSS, selects individual fixes, and sees immediate output updates.

SPEC-uix-16: Allow clear inspection of fixes, so users can trust tool suggestions.

SPEC-uix-17: Output clean, structured CSS optimized for LLM comprehension.

SPEC-uix-20 [v2]: If selected fixes are incompatible, the UI must clearly indicate the conflict and prevent applying an incompatible set (or deterministically resolve with an explicit explanation).

SPEC-uix-21 [v2]: For unsafe/manual issues, the UI offers a Generate LLM Prompt action that must include context, goal, task, constraints, target improvement, relevant CSS snippet, and expected output formatting.

SPEC-uix-22 [v2]: Support ddirect Paste from Clipboard action for input panel.

SPEC-uix-23 [v2]: Support sorting by severity, group, fixability, syntax, and line-number, while maintaining grouping.

SPEC-uix-24 [v2]: Minimum of >10 issues must be visible in issue panel wihout need to scroll.


### 9.2 Engine (ENG)

SPEC-eng-01: CSS parser is css-tree.

SPEC-eng-02: The parser must preserve user comments and treat tool-generated comments separately.

SPEC-eng-03: Each issue must conform to the data contract in SPEC/DATA_CONTRACTS.md including rule_id, severity, group, message, location, logic, and fixability.

SPEC-eng-04: The engine must be deterministic.

SPEC-eng-05: Rules must explicitly declare applicable properties/contexts so fixes cannot apply to unrelated syntax.

SPEC-eng-06: A fix is classified as safe only if it uses consistent programmable logic, needs no user/product-specific context, and can be applied reliably without creating syntax errors; otherwise classify as unsafe/manual.

SPEC-eng-07: The engine must detect incompatible fixes (selected fixes that cannot be applied together without violating constraints or producing invalid output) and expose conflict metadata for UI display.

SPEC-eng-08: Auto-fix generation and application must comply with INVARIANT-01 through INVARIANT-03.

SPEC-eng-09: Display token, line, and character counts accurately before and after fixes.

SPEC-eng-10: Stats recalculation must always be consistent and repeatable, regardless of selected fixes.

SPEC-eng-11: Ensure deterministic behavior for fixes and reverts to facilitate predictable outcomes.


### 9.3 States (STS)

SPEC-sts-01: Maximum CSS input size is 100KB and the tool must warn above 50KB.

SPEC-sts-02: All settings are session-only and reset on page refresh.

SPEC-sts-03: Fixes are never applied automatically and must be explicitly selected by the user.

SPEC-sts-04: Users can enable or disable individual rules.

SPEC-sts-05: Users can configure an entire group at once (e.g., disable all format rules).

SPEC-sts-06: Users can select fixes per-issue, per-rule, per-group, or per-severity (info|warning|error).

SPEC-sts-07: Output is generated by recomputing from original input plus the set of selected fixes.

SPEC-sts-08: Unselecting a fix reverts it by recomputing output from original input without that fix.

SPEC-sts-09: Applying and reverting fixes must be idempotent such that the same input and selected fix set always yields identical output byte-for-byte.

SPEC-sts-10: A diff preview must be available for both single and batched fixes.

SPEC-sts-11: Inline tool comments can be toggled ON/OFF by the user and default is ON. When inline comments are ON, insert a tool comment only for applied fixes.

SPEC-sts-12: Tool comment syntax must be unique and easily detectable as /* review: ... */.

SPEC-sts-13: Tool comment placement rule is to append /* review: ... */ at end of the modified line starting exactly one space after the terminating ';'.

SPEC-sts-14: Tool comments should be concise with length under 80 characters and must explain the change.

SPEC-sts-15: If a fix is reverted, its associated tool comment is automatically removed.

SPEC-sts-16: Provide one action to remove all tool-generated comments without affecting user comments.

SPEC-sts-17: Display before and after stats for line count and character count.

SPEC-sts-20 [v2]: Display before and after token estimate. Token estimate must be computed using a BPE tokenizer aligned with the tool’s default average-model tokenizer (not a simplistic heuristic).

SPEC-sts-21 [v2]: For issues where fixability is unsafe/manual, the system offers a Generate LLM Prompt action.

SPEC-sts-22 [v2]: All settings are maintained across sessions and not resetting on page refresh.

##9.4 Non-functional

SPEC-nfr-01: Ignore backend auth/account handling; focus on local CSS manipulation.

SPEC-nfr-02: Ignore cross-file or project-wide analysis in v1; focus only on current input.

SPEC-nfr-03: Minimize cognitive load on the user by keeping UI simple and responsive.

 ---
 
## 10) INVARIANTS

INVARIANT-01: Auto-fixes must not change selector specificity or result in syntax error.

INVARIANT-02: The tool must not treat valid, modern CSS syntax as an error.

INVARIANT-03: Rules must explicitly declare the properties/contexts they apply to, preventing accidental application to unrelated syntax.

INVARIANT-04: System must never attempt network requests for parsing or fixes. 

INVARIANT-05: Engine must never apply rules to unrelated files or external data.

---

## 11) Rulebook Design

### 11.1 Rule Structure

Rules are defined as a hybrid of:

- **Declarative Metadata:** A simple structured data file (e.g., YAML, JSON) defining the `rule_id`, `group`, default `severity`, `fixability`, and applicable contexts.

- **Implementation Logic:** Code (e.g., TypeScript) that performs the AST traversal, detection, and patch creation.
 

### 11.2 Rule Applicability

- Each rule's metadata must declare its scope (e.g., properties, functions, at-rules it affects) to ensure it only runs where intended.

---

## 12) Data Model (Canonical)

> See `SPEC/DATA_CONTRACTS.md` and `SPEC/TYPES.md` for all data model definitions.

---

## 13) Acceptance Criteria (Testable)

- **AC-03:** Toggling a rule off and re-analyzing removes its issues from the list.

- **AC-04:** Setting a rule group to "off" and re-analyzing removes all issues from that group.

- **AC-05:** Changing a rule's severity is reflected in the issue list upon re-analysis.

- **AC-06:** A user can select a fix, see the output update, then unselect it, and the output correctly reverts to its previous state. If no ;, append after declaration node end. If multi-line, attach comment on last line of affected declaration.

- **AC-07:** Unselecting one fix does not affect other, unrelated selected fixes.

- **AC-08:** After multiple select/unselect cycles, the output remains stable and correct.

- **AC-09:** When the comments toggle is ON, applying a fix adds a `/* review: ... */` comment to the output without syntax error.

- **AC-10:** The "Copy" buttons work correctly for both with and without comments.

- **AC-11:** A "Remove tool comments" action strips all `review:` comments but preserves user-written comments.

- **AC-12:** The stats panel (tokens/lines/chars) updates accurately as fixes are selected and unselected.

- **AC-13:** The entire core workflow (paste, analyze, filter, select, copy) is usable on a standard mobile viewport without horizontal scrolling or blocked actions.

 ---

## 10) Scope v3 and beyond

- **Accurate Token Counting:** Display exact token counts (before/after) using a precise tokenizer.

- **Configuration Profiles:** Allow users to switch between presets (e.g., "Modern vs. Compatibility," "Max Context vs. Min Tokens").

- **Expanded Rule Set further.

 

 END








