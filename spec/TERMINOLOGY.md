<!--
CLAUDE_PERMISSIONS: READ | FOLLOW | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_WITH_HUMAN_PR_REVIEW
PURPOSE: Authoritative Reference
AUTHORITY: spec/PRD_BUILD_SPEC.md
IF_CONFLICT: Defer to spec/PRD_BUILD_SPEC.md
IF_OUTDATED: Flag human
PRIORITY: MEDIUM
-->

# Terminology

This document standardizes terminology across the project.
Use the **preferred terms** consistently. Avoid the **deprecated terms**.

---

## Core Concepts

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Select (a fix)** | User chooses to include a fix in output | "apply", "enable" |
| **Unselect (a fix)** | User removes a fix from selection (triggers revert) | "deselect", "disable", "unapply" |
| **Revert** | Output returns to state without a fix (via recompute) | "undo", "rollback" |
| **Recompute** | Regenerate output from original + selected fixes | "recalculate", "refresh" |
| **Original CSS** | The CSS the user pasted (never mutated) | "input CSS", "source CSS" |
| **Output CSS** | The derived CSS after applying selected fixes | "result CSS", "final CSS" |

---

## Fix Types

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Safe fix (auto)** | Deterministic, semantics-preserving transformation that the tool can apply automatically once selected | "auto-fix", "automatic fix" |
| **Safe fix (force user to choose)** | Safe transformation exists, but the tool must ask for a choice (or use session config) before applying | "semi-auto fix" |
| **Prompt fix** | Not safe to change code automatically; provide guidance / copy-ready LLM prompt | "manual fix", "suggested fix" |
| **No fix** | Detection only; no fix is offered | "not fixable" (ambiguous) |
| **default_fixability** | Default behavior for a rule’s fix offering (auto vs needs choice vs prompt vs none) | "fixability" (legacy), "default fix" |
| **max_fixability** | Maximum allowed fix level for a rule (caps what the tool may do) | "fixability" (legacy) |

---

## Issues & Rules

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Issue** | A finding with severity, rule_id, message, location | "error", "warning", "problem" (too specific) |
| **Rule** | Deterministic check that emits issues | "linter", "check" |
| **rule_id** | Unique identifier like "format/no-tabs" | "rule name", "rule code" |
| **Severity** | error \| warning \| info | "level", "priority" |

---

## Comments

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Tool comment** | Comment with `cssreview:` marker | "auto comment", "generated comment" |
| **User comment** | Any comment without `cssreview:` marker | "manual comment", "original comment" |
| **Comment marker** | The prefix `cssreview:` | "comment prefix", "marker prefix" |

---

## UI Elements

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Issues Panel** | UI showing list of issues | "errors panel", "problems panel" |
| **Selected Fixes Panel** | UI showing currently selected fixes | "applied fixes panel", "fix queue" |
| **Rule Logic** | WHAT / WHY / WHEN SAFE explanation | "rule description", "rule details" |

---

## Actions

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Analyze** | Run parsing + rule evaluation | "scan", "lint", "check" |
| **Copy output** | Copy derived CSS to clipboard | "export", "download" |
| **Remove tool comments** | Strip only `cssreview:` comments | "clean comments", "strip comments" |
| **Reset** | Return to original CSS, clear selections | "clear", "start over" |

---

## Data

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Patch** | Single text replacement operation | "edit", "change" |
| **Range** | Start/end positions (start inclusive, end exclusive) | "span", "selection" |
| **Position** | Line + column (1-based) | "location" (use for Issue.location only) |

---

## Configuration

| Preferred Term | Definition | Deprecated/Avoid |
|----------------|------------|------------------|
| **Session config** | Rule settings that reset on refresh | "settings", "preferences" |
| **Rule group** | Category of rules (format, tokens, etc.) | "rule category", "rule type" |

---

## Usage Examples

### Correct
- "The user **selected** the `format/no-tabs` fix."
- "After **unselecting** the fix, the output **reverts** via **recompute**."
- "This is a **safe fix (auto)** with **default_fixability: safe (auto)**."
- "This is a **safe fix (force user to choose)** with **default_fixability: safe (force user to choose)**."
- "**Tool comments** use the `cssreview:` **marker**."
- "Check the **Issues Panel** for all findings."

### Incorrect
- ~~"The user **applied** the fix."~~ → Use "selected"
- ~~"**Undo** the fix."~~ → Use "unselect" or "revert"
- ~~"This is an **auto-fix**."~~ → Use "safe fix"
- ~~"Remove **generated comments**."~~ → Use "tool comments"

---

## Code Naming Conventions

### Variables & Functions
```typescript
// Good
const selectedFixIds: string[] = [];
function recomputeOutput(originalCss: string, selectedFixIds: string[]): string
const issueList: Issue[] = [];

// Avoid
const appliedFixes = [];  // Use selectedFixIds
function refreshOutput()  // Use recomputeOutput
const errors = [];        // Use issues
```

### Types
```typescript
// Good
type DefaultFixability = 'safe (auto)' | 'safe (force user to choose)' | 'prompt' | 'none';
type MaxFixability = 'safe (auto)' | 'safe (force user to choose)' | 'prompt' | 'none';
interface Issue { ... }
interface SessionState { ... }

// Avoid
type FixType = ...      // Use DefaultFixability/MaxFixability
interface Error { ... } // Use Issue
interface State { ... } // Use SessionState
```

### UI Components
```typescript
// Good
<IssuesPanel />
<SelectedFixesPanel />
<RuleLogicPanel />

// Avoid
<ErrorList />        // Use IssuesPanel
<AppliedFixesList /> // Use SelectedFixesPanel
```

---

## Commit Message Conventions

```
feat: add format/no-tabs rule
fix: correct recompute when unselecting fix
docs: update terminology for tool comments
refactor: rename appliedFixes to selectedFixIds
```

---

## Quick Reference Glossary

> Merged from GLOSSARY.md — Use for quick lookup of core concepts.

| Term | Definition |
|------|------------|
| **Rule** | Deterministic check on the CSS AST. Emits zero or more issues. |
| **Issue** | Finding with severity (error/warning/info), rule_id, message, and location. |
| **Fix** | Deterministic transformation that preserves semantics (safe) and is user-selectable. |
| **Safe fix** | Semantics-preserving fix. May be **safe (auto)** or **safe (force user to choose)**. |
| **default_fixability** | Default fix offering level for a rule. |
| **max_fixability** | Maximum fix offering level for a rule. |
| **Tool comment** | Tool-added comment `/* cssreview: ... */` describing what changed. |
| **Rule group** | Logical grouping of rules (modern/consolidation/format/tokens/safety/education). |
| **Session config** | Rule toggles, severities, and parameters that reset on refresh (v1). |
| **LLM prompt** | Copy-ready prompt generated for complex fixes that are not safe to automate. |
| **Selected fix** | A fix the user has chosen to include in the output. |
| **Recompute** | Regenerating output CSS from original input + currently selected fixes. |
| **Conflict** | When two fixes modify overlapping ranges; must be handled deterministically. |

---

END
