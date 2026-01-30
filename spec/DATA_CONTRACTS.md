<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# Data Contracts (v1)

This file defines the **canonical data shapes** used by the CSS Review Tool (analyzer output, fix patches, applied-fix tracking) and the **invariants** that must always hold.

> Source of truth: If anything conflicts, `spec/PRD_BUILD_SPEC.md` wins.

---

## 1) Canonical enums

### 1.1 Severity
Allowed values: `error | warning | info`

- `error` = invalid CSS or must-fix to reach “clean”
- `warning` = strong recommendation / safe improvement
- `info` = optional/educational; also used for “property not recognized”

### 1.2 Rule groups (minimum v1)
Allowed values: `modern | consolidation | format | tokens | safety | education`

### 1.3 Fixability
Allowed values: `safe | prompt | none`

- `safe` = deterministic semantics-preserving auto-fix exists (user-selectable)
- `prompt` = not safe to auto-fix; generate LLM prompt instead
- `none` = no fix and no prompt

---

## 2) Location model (used by Issues and Patches)

### 2.1 Position
Positions are **1-based**.
```json
{ "line": 10, "column": 3 }
```

### 2.2 Range
`start` inclusive, `end` exclusive (common editor model).
```json
{
  "start": { "line": 10, "column": 3 },
  "end":   { "line": 12, "column": 1 }
}
```

---

## 3) Issue contract (analyzer output)

### 3.1 Issue (canonical)
```json
{
  "id": "iss_000123",
  "rule_id": "format/property-per-line",
  "group": "format",
  "severity": "warning",
  "message": "Put each property on a new line.",
  "location": {
    "start": { "line": 10, "column": 1 },
    "end": { "line": 10, "column": 60 }
  },
  "logic": {
    "what": "Multiple declarations detected on one line.",
    "why": "Improves LLM parsing and keeps structure predictable.",
    "when_safe": "Always safe; formatting only."
  },
  "fixability": "safe",
  "fix": {
    "id": "fix_000123",
    "kind": "patch_set",
    "preview": ".button {\n  display: flex;\n  color: #fff;\n}\n",
    "patches": [
      {
        "op": "replace_range",
        "range": {
          "start": { "line": 10, "column": 1 },
          "end": { "line": 10, "column": 60 }
        },
        "text": ".button {\n  display: flex;\n  color: #fff;\n}\n"
      }
    ],
    "comment": {
      "enabled_by_ui": true,
      "style": "end_of_line",
      "text": "/* cssreview: format/property-per-line: split declarations */"
    }
  }
}
```

### 3.2 Rules for presence/absence
- If `fixability` = `safe` → `fix` MUST be present and contain ≥ 1 patch.
- If `fixability` = `prompt` → `llm_prompt` MUST be present and `fix` MUST be absent.
- If `fixability` = `none` → both `fix` and `llm_prompt` MUST be absent.

---

## 4) Fix contract (patches + applied tracking + revert)

### 4.1 Patch operations (v1)
v1 supports at least:
- `replace_range` (required)

Canonical patch:
```json
{
  "op": "replace_range",
  "range": {
    "start": { "line": 14, "column": 3 },
    "end": { "line": 18, "column": 1 }
  },
  "text": "  margin: 4px 8px; /* cssreview: consolidate/shorthand: was margin-top/right/bottom/left */\n"
}
```

### 4.2 AppliedFix tracking (session)
To support "apply selected fixes" AND "deselect to revert", the session tracks selected fix IDs.

**SessionState (canonical)**:
```json
{
  "original_css": "/* pasted css */",
  "selected_fix_ids": ["fix_000123", "fix_000200"],
  "comments_enabled": true
}
```

**AppliedFix record** (internal tracking per fix):
```json
{
  "fix_id": "fix_000123",
  "rule_id": "consolidation/shorthand-margin-padding",
  "patches": [
    {
      "op": "replace_range",
      "range": {
        "start": { "line": 14, "column": 3 },
        "end": { "line": 18, "column": 1 }
      },
      "text": "  margin: 4px 8px; /* cssreview: consolidation/shorthand: was margin-top/right/bottom/left */\n"
    }
  ],
  "comment": {
    "was_inserted": true,
    "marker_prefix": "cssreview:",
    "style": "end_of_line"
  }
}
```

### 4.3 Recompute rule (required)
The output is derived, not mutated:

```
output_css = apply(selected_fix_ids, original_css, comments_enabled)
```

Revert is automatic:
- Unselect a fix ID → recompute output without that fix.

### 4.4 Deterministic apply order (required)
To ensure stable results, fixes MUST be applied in a deterministic order. v1 requirement:

1. **Primary sort key**: earliest patch start position (`range.start.line`, then `range.start.column`)
2. **Tie-breakers**: `rule_id` (lexicographic), then `fix.id` (lexicographic)

This order must be consistent every run.

### 4.5 Conflicts (required behavior)
If two selected fixes modify overlapping ranges (conflict), the system must behave deterministically and visibly. v1 acceptable options:

- **Option A (preferred)**: prevent selecting both and show a conflict notice
- **Option B**: allow selection but apply a deterministic resolution and show a conflict notice

In both cases:
- behavior must be deterministic
- user must be able to understand which fix is blocked/overridden

---

## 5) LLM prompt contract (for non-automatable fixes)

If `fixability` = `prompt`, the Issue includes an `llm_prompt` object.

```json
{
  "llm_prompt": {
    "id": "prompt_000045",
    "title": "Refactor CSS safely (preserve cascade)",
    "format": "text",
    "copy_text": "TASK:\nRefactor the CSS to reduce duplication while preserving cascade behavior.\n\nCONSTRAINTS:\n- Do not change selector specificity or rule order.\n- Do not change computed values.\n- Keep output structured: two-space indent, one property per line, no minification.\n\nTARGET:\n- Consolidate where safe.\n- Avoid risky merges unless guaranteed.\n\nINPUT CSS:\n```css\n/* snippet */\n```\n\nEXPECTED OUTPUT FORMAT:\n- Two spaces indentation\n- One property per line\n\nCHECKLIST:\n- Cascade unchanged\n- No missing declarations\n"
  }
}
```

---

## 6) Invariants (must always be true)

### 6.1 Determinism
Same CSS input + same session config + same selected fixes ⇒ same Issues, same severities, same output formatting.

### 6.2 Safety
A safe fix MUST preserve selector specificity, rule order, and computed values (within deterministic equivalence like `0px → 0`). If equivalence cannot be guaranteed deterministically, fixability MUST be `prompt` or `none`.

### 6.3 User control
No fixes are applied automatically; only via explicit user selection. Revert MUST be possible by unselecting fixes (output recomputation).

### 6.4 Tool comments only
"Remove tool comments" MUST remove only comments that contain the marker prefix `cssreview:` and MUST NOT remove/alter user comments. Copy output must support both modes: with tool comments / without tool comments.

### 6.5 Modern CSS & unrecognized properties
Unrecognized properties MUST produce `info` only and MUST NOT block other fixes. Rules MUST declare applicability to prevent firing on unintended properties/contexts.

---

## 7) Minimal validation rules (for implementers)

- `severity` ∈ `{error, warning, info}`
- `group` ∈ `{modern, consolidation, format, tokens, safety, education}`
- `fixability` ∈ `{safe, prompt, none}`
- If `fixability = safe` ⇒ `fix` present and `patches.length ≥ 1`
- If `fixability = prompt` ⇒ `llm_prompt` present and `fix` absent
- If `fixability = none` ⇒ both `fix` and `llm_prompt` absent
- Deterministic apply order rule must be implemented
- Conflicts must be handled deterministically (block or deterministic resolve) with user-visible notice

---

END
