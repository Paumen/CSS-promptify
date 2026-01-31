<!--
STATUS: RESOLVED - All decisions made and implemented (2026-01-31)
GENERATED: 2026-01-31
LLM_POLICY: This document is now historical reference only. All issues have been resolved.
-->

# Spec Review: Duplicates, Conflicts, and Simplifications

> **STATUS: ALL RESOLVED** (2026-01-31)
>
> All issues identified in this review have been addressed. Decisions are recorded in `spec/DECISIONS.md`.
> This document is kept for historical reference.

This document summarizes findings from a comprehensive review of all specification documents.

---

## Executive Summary

| Category | Count | Status |
|----------|-------|--------|
| Duplicates | 12 | ✅ Consolidated |
| Conflicts | 14 | ✅ Resolved |
| Simplification opportunities | 6 | ✅ Applied |
| New open questions | 5 | ✅ Decided |

---

## 1) Duplicates Found

### 1.1 Enums defined in multiple places

**Severity enum** appears in:
- PRD_BUILD_SPEC.md §6
- DATA_CONTRACTS.md §1.1
- TYPES.md

**Rule groups enum** appears in:
- PRD_BUILD_SPEC.md §9.4
- DATA_CONTRACTS.md §1.2
- TYPES.md
- UI_BEHAVIOR.md §3.1, §7

**Fixability enum** appears in:
- DATA_CONTRACTS.md §1.3
- TYPES.md
- RULEBOOK_INDEX.md §0.1

**Recommendation:** TYPES.md should be the single source. Other docs should reference it.

---

### 1.2 Issue data shape defined in multiple places

Appears in:
- PRD_BUILD_SPEC.md §13.1 (JSON example)
- DATA_CONTRACTS.md §3.1 (canonical)
- TYPES.md (TypeScript interface)

**Recommendation:** DATA_CONTRACTS.md is authoritative per AUTHORITY.md. PRD should reference it rather than duplicate.

---

### 1.3 Recompute model described in multiple places

Appears in:
- PRD_BUILD_SPEC.md §9.5 (FR-FIX-04)
- DATA_CONTRACTS.md §4.3
- UI_BEHAVIOR.md §0, §6.2
- DECISIONS.md (2026-01-29)

**Recommendation:** Define once in DATA_CONTRACTS.md, reference elsewhere.

---

### 1.4 Conflict handling (Option A) described in multiple places

Appears in:
- DATA_CONTRACTS.md §4.5
- UI_BEHAVIOR.md §6.5
- DECISIONS.md

**Recommendation:** Define once in DATA_CONTRACTS.md, reference elsewhere.

---

### 1.5 Comment marker `cssreview:` defined in multiple places

Appears in:
- PRD_BUILD_SPEC.md §9.6
- DATA_CONTRACTS.md §6.4
- UI_BEHAVIOR.md §4.2
- TERMINOLOGY.md
- GLOSSARY.md

**Recommendation:** Define once in TERMINOLOGY.md or DATA_CONTRACTS.md.

---

### 1.6 WHAT/WHY/WHEN SAFE pattern repeated

Appears in:
- PRD_BUILD_SPEC.md §9.3, §9.8
- DATA_CONTRACTS.md §3 (issue.logic)
- UI_BEHAVIOR.md §2.3, §5.2
- EXAMPLES.md

**Recommendation:** Define once in DATA_CONTRACTS.md.

---

### 1.7 GLOSSARY.md overlaps with TERMINOLOGY.md

Both define:
- Rule, Issue, Fix, Auto-fix, Inline comment, Rule group, Session config

**Recommendation:** Merge GLOSSARY.md into TERMINOLOGY.md (see Simplification #1).

---

### 1.8 Tech stack mentioned in multiple places

Appears in:
- DECISIONS.md
- OPEN_QUESTIONS.md
- CLAUDE.md

**Recommendation:** DECISIONS.md is authoritative; others should reference it.

---

### 1.9 Open questions all resolved

OPEN_QUESTIONS.md contains 9 questions, all marked "DECIDED".

**Recommendation:** Archive or remove (see Simplification #2).

---

## 2) Conflicts Found

### CONFLICT 2.1: Rule ID naming - property-per-line [DECISION NEEDED]

| Document | Rule ID |
|----------|---------|
| PRD_BUILD_SPEC.md §11.3 | `format/property-per-line` |
| RULEBOOK_INDEX.md | `format/multiple-declarations-per-line` |
| test-cases.json | `format/property-per-line` |
| EXAMPLES.md Example 3 | `format/property-per-line` |

**Question:** Which name is canonical?

**Recommendation:** Use `format/multiple-declarations-per-line` (more descriptive). Update PRD, test-cases.json, EXAMPLES.md.

---

### CONFLICT 2.2: Rule ID prefix - consolidate vs consolidation [DECISION NEEDED]

| Document | Prefix Used |
|----------|-------------|
| RULEBOOK_INDEX.md | `consolidate/` |
| test-cases.json | `consolidation/` |
| PRD_BUILD_SPEC.md | mixed (`consolidate/`) |

**Question:** Which prefix is canonical: `consolidate/` or `consolidation/`?

**Options:**
- A: `consolidate/` (verb form, matches RULEBOOK_INDEX)
- B: `consolidation/` (noun form, matches group name)

---

### CONFLICT 2.3: suggest-place rule ID inconsistency [DECISION NEEDED]

| Document | Rule ID |
|----------|---------|
| PRD_BUILD_SPEC.md | `modern/suggest-place-*` (wildcard) |
| RULEBOOK_INDEX.md | `modern/suggest-place-shorthand` |
| test-cases.json | `modern/suggest-place-properties` |
| IMPLEMENTATION_CHECKLIST.md | `modern/suggest-place-properties` |

**Question:** Which name is canonical?

**Recommendation:** Use `modern/suggest-place-shorthand` (matches RULEBOOK_INDEX).

---

### CONFLICT 2.4: format/normalize-spaces severity [DECISION NEEDED]

| Document | Severity |
|----------|----------|
| RULEBOOK_INDEX.md | `info` |
| test-cases.json example-1 | `warning` |
| EXAMPLES.md Example 1 | `info` |

**Question:** What is the correct default severity?

**Recommendation:** Use `info` (matches RULEBOOK_INDEX and EXAMPLES.md). Fix test-cases.json.

---

### CONFLICT 2.5: Example 2 - single-prop-single-line behavior [DECISION NEEDED]

| Document | Behavior |
|----------|----------|
| EXAMPLES.md Example 2 | Expects issue `format/single-prop-single-line (info)` |
| test-cases.json example-2 | Expects NO issues (`expected_issues: []`) |

**Question:** When does this rule fire?
- A: When a multi-line single-prop block could be collapsed to one line (suggests change)
- B: When a single-prop block is formatted correctly (just informational)

The input in both cases is already multi-line:
```css
.a {
  color: #fff;
}
```

If the rule suggests converting TO single-line, it should fire. If it just validates existing single-line format, it shouldn't.

---

### CONFLICT 2.6: tokens/remove-redundant-whitespace naming

| Document | Rule ID |
|----------|---------|
| RULEBOOK_INDEX.md | `tokens/remove-redundant-whitespace-in-values` |
| test-cases.json | `tokens/remove-redundant-whitespace` |

**Recommendation:** Use shorter name `tokens/remove-redundant-whitespace`. Update RULEBOOK_INDEX.md.

---

### CONFLICT 2.7: Missing rules from RULEBOOK_INDEX [DECISION NEEDED]

These rules appear in other docs but NOT in RULEBOOK_INDEX.md:

| Rule ID | Appears In |
|---------|-----------|
| `consolidation/merge-adjacent-identical-selectors` | test-cases.json, IMPLEMENTATION_CHECKLIST.md |
| `modern/container-queries-guidance` | PRD_BUILD_SPEC.md, IMPLEMENTATION_CHECKLIST.md |
| `modern/light-dark-guidance` | IMPLEMENTATION_CHECKLIST.md |
| `modern/suggest-logical-properties` | PRD_BUILD_SPEC.md, IMPLEMENTATION_CHECKLIST.md |

**Question:** Should these be added to RULEBOOK_INDEX.md or removed from other docs?

**Recommendation:** Add to RULEBOOK_INDEX.md if planned for v1, or explicitly defer to Tier 3.

---

### CONFLICT 2.8: education/explain-rule-logic - rule or UI feature? [DECISION NEEDED]

| Document | Classification |
|----------|---------------|
| RULEBOOK_INDEX.md | Listed as Tier 1 rule |
| EXAMPLES.md Example 25 | "UI behavior guarantee, not a code transformation rule" |

**Question:** Is this a rule that emits issues, or a UI behavior?

**Options:**
- A: Remove from RULEBOOK_INDEX (it's a UI feature, not a rule)
- B: Keep as rule (meta-rule that ensures logic is shown)

---

### CONFLICT 2.9: File upload in v1? [DECISION NEEDED]

| Document | Statement |
|----------|-----------|
| PRD_BUILD_SPEC.md FR-IN-02 | "Paste input and file upload (.css)" |
| DECISIONS.md | "Primary input method is copy-paste (not file upload)" |

**Question:** Is file upload included in v1?

**Options:**
- A: Yes, as secondary input method (keep FR-IN-02)
- B: No, copy-paste only (update FR-IN-02)

---

### CONFLICT 2.10: UI_STYLE_GUIDE file extension

| Document | Path |
|----------|------|
| AUTHORITY.md | `spec/UI_STYLE_GUIDE.md` |
| Actual file | `spec/UI_STYLE_GUIDE` (no .md) |

**Recommendation:** Rename file to `UI_STYLE_GUIDE.md` for consistency.

---

### CONFLICT 2.11: PRD Open Questions section is stale

PRD_BUILD_SPEC.md §16 lists open questions:
1. "Should default severity for format rules be warning or error?"
2. "Should 'single-prop single-line' be ON by default?"

Both are answered in DECISIONS.md.

**Recommendation:** Remove or mark as "RESOLVED" with references to DECISIONS.md.

---

### CONFLICT 2.12: test-cases.json missing indent issue

Example 1 in test-cases.json doesn't include `format/indent-2-spaces` issue, but EXAMPLES.md Example 1 does.

Input: `.button{display:flex;color:#ffffff}`

EXAMPLES.md expects:
- format/indent-2-spaces (warning)

test-cases.json doesn't include this.

**Recommendation:** Add to test-cases.json or clarify if this rule only fires when there IS indentation (not missing indentation).

---

### CONFLICT 2.13: Example comment text variations

Different comment text formats across files:

| Location | Comment Format |
|----------|---------------|
| PRD §9.6 | `/* cssreview: format/single-prop: kept single prop on one line */` |
| DATA_CONTRACTS §4.1 | `/* cssreview: consolidate/shorthand: was margin-top/right/bottom/left */` |
| EXAMPLES.md | `/* cssreview: consolidate/shorthand-margin-padding: was margin-top/right/bottom/left */` |
| test-cases.json | `/* cssreview: consolidation/shorthand: was margin-top/right/bottom/left */` |

Note the rule_id prefix differences in the comment text itself.

**Recommendation:** Standardize on full rule_id in comments.

---

### CONFLICT 2.14: Tier assignment vs defaults

RULEBOOK_INDEX.md §0.4 says Tier 1+2 = 20 rules for v1.0, but:
- Some Tier 2/3 rules are listed with `enabled_by_default: true`
- Some Tier 1 rules are listed with `enabled_by_default: false`

**Question:** Does tier determine what's implemented, and `enabled_by_default` determines the default state once implemented?

**Recommendation:** Clarify relationship between tier and enabled_by_default.

---

## 3) Simplification Opportunities

### SIMPLIFY 3.1: Merge GLOSSARY.md into TERMINOLOGY.md

GLOSSARY.md is 20 lines with brief definitions.
TERMINOLOGY.md already has a "Core Concepts" table.

**Proposal:** Add GLOSSARY definitions as a section in TERMINOLOGY.md, delete GLOSSARY.md.

---

### SIMPLIFY 3.2: Archive or remove OPEN_QUESTIONS.md

All 9 questions are marked "DECIDED" with references to DECISIONS.md.

**Options:**
- A: Delete file entirely (DECISIONS.md has all answers)
- B: Rename to RESOLVED_QUESTIONS.md for historical reference
- C: Keep but add note "All questions resolved - see DECISIONS.md"

---

### SIMPLIFY 3.3: Remove duplicated invariants

Invariants are listed in:
- PRD_BUILD_SPEC.md §5 (product principles)
- DATA_CONTRACTS.md §6 (invariants)
- CLAUDE.md (critical invariants)

**Proposal:** DATA_CONTRACTS.md §6 is authoritative. PRD §5 becomes "principles" (not invariants). CLAUDE.md references DATA_CONTRACTS.md.

---

### SIMPLIFY 3.4: Consolidate enum definitions

Currently 4+ places define enums.

**Proposal:** TYPES.md is the single source for type definitions. Other docs reference it:
- DATA_CONTRACTS.md §1 says "See TYPES.md for enums"
- PRD links to TYPES.md

---

### SIMPLIFY 3.5: Single source for examples

Currently:
- EXAMPLES.md has 25 examples (human-readable)
- test-cases.json has 12 test cases (machine-readable)

They overlap but have diverged.

**Proposal:** Generate test-cases.json FROM EXAMPLES.md, or vice versa. One source of truth.

---

### SIMPLIFY 3.6: Reduce PRD length by referencing other docs

PRD_BUILD_SPEC.md is 438 lines with duplicated content.

**Proposal:** PRD focuses on WHAT and WHY. Technical HOW references:
- DATA_CONTRACTS.md for data shapes
- TYPES.md for TypeScript
- RULEBOOK_INDEX.md for rules
- UI_BEHAVIOR.md for UI details

---

## 4) New Open Questions Requiring Human Decision

### Q1: Rule ID naming convention [DECISION NEEDED]

**Context:** Inconsistent prefix usage across documents.

**Question:** Which naming pattern is canonical?

| Pattern | Examples | Used By |
|---------|----------|---------|
| Verb prefix | `consolidate/shorthand-*` | RULEBOOK_INDEX |
| Noun prefix | `consolidation/shorthand-*` | test-cases.json |
| Mixed | `format/` (noun), `consolidate/` (verb) | various |

**Options:**
- A: Verb form consistently (`consolidate/`, `format/`, `tokenize/`)
- B: Noun form consistently (`consolidation/`, `format/`, `tokens/`)
- C: Keep current (noun for group name, verb for rule prefix)

---

### Q2: format/single-prop-single-line trigger condition [DECISION NEEDED]

**Context:** Unclear when this rule fires.

**Question:** Does this rule:
- A: Fire when a multi-line single-prop block COULD be collapsed to one line (suggests change)
- B: Fire to confirm a single-prop block IS correctly on one line (informational)
- C: Fire for single-prop blocks regardless of format (always reports)

This determines whether EXAMPLES.md Example 2 or test-cases.json example-2 is correct.

---

### Q3: File upload support in v1 [DECISION NEEDED]

**Context:** PRD says "file upload (.css)" but DECISIONS.md says "primary input is copy-paste".

**Question:** Include file upload in v1?

**Options:**
- A: Yes, as secondary input method
- B: No, defer to v1.1 (update PRD FR-IN-02)

---

### Q4: Missing rules - add or remove? [DECISION NEEDED]

**Context:** These rules appear in docs but not RULEBOOK_INDEX.md:
1. `consolidation/merge-adjacent-identical-selectors`
2. `modern/container-queries-guidance`
3. `modern/light-dark-guidance`
4. `modern/suggest-logical-properties`

**Question:** For each rule:
- A: Add to RULEBOOK_INDEX.md (Tier 1 or 2)
- B: Add to RULEBOOK_INDEX.md (Tier 3 - deferred)
- C: Remove from other documents

---

### Q5: education/explain-rule-logic classification [DECISION NEEDED]

**Context:** Listed as rule in RULEBOOK_INDEX but described as UI feature in EXAMPLES.md.

**Question:** Is this a rule or a UI feature?

**Options:**
- A: Remove from RULEBOOK_INDEX (UI feature, not a rule)
- B: Keep in RULEBOOK_INDEX as meta-rule

---

## 5) Recommended Actions

### Immediate fixes (no decision needed)

1. Rename `spec/UI_STYLE_GUIDE` to `spec/UI_STYLE_GUIDE.md`
2. Mark PRD §16 open questions as "RESOLVED - see DECISIONS.md"
3. Fix test-cases.json example-1 severity: `format/normalize-spaces` should be `info`

### After human decisions

1. Standardize rule ID naming (Q1)
2. Clarify single-prop-single-line behavior (Q2)
3. Update FR-IN-02 re: file upload (Q3)
4. Add/remove missing rules from RULEBOOK_INDEX (Q4)
5. Clarify education/explain-rule-logic (Q5)
6. Apply simplifications 3.1-3.6

---

END
