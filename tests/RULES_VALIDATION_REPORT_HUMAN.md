<!--
CLAUDE_PERMISSIONS: READ
CLAUDE_UPDATE_POLICY: STRICTLY_DISALLOWED
PURPOSE: Human-Only
AUTHORITY: None
IF_CONFLICT: request HUMAN if unclear
IF_OUTDATED: Ignore
PRIORITY: LOW
-->

# CSS Promptify Rules Validation Report (Human)

**Generated:** 2026-02-04  
**Validator:** Human  
**Scope:** All 20 implemented rules in `app/src/rules/`  
**Branch:** `claude/validate-rules-implementation-9u1Aq`  
**Codespace:** `jubilant bassoon`

---

## Test Approach

1. Claude (claude-opus-4-5-20251101) did extensive tests. Results: `@tests/RULES_VALIDATION_REPORT.md`.
2. Human asked Claude (claude-opus-4-5-20251101), in the same session, to create a simple short `.css` file where each rule can be detected exactly once. Claude created: `@tests/test-all-rules.css`.
3. Human used `@tests/test-all-rules.css` for an end-to-end test in GitHub Codespace via `npm run dev`:
   a. Copy-paste full `@tests/test-all-rules.css` into the app input panel and press **Analyze**.
   b. Check total number of issues, totals per group, and totals per severity.
   c. Check whether each of the 20 rules was detected.

---

## Summary

### Generic (end-to-end)

| Status | Issues expected | Issues actual |
|--------|----------------|--------------|
| **FAIL** | 20 | 53 |

**Main reasons (high level):**
- End-to-end issue totals do not match the test file expectation (20 → 53).
- Multiple auto-fixes corrupt output CSS (stray characters like `c`, `r`, extra `.`, missing `;`, braces removed).
- UX/UI has multiple clarity issues (totals, sorting, too few visible issues at once).

### Specific rules (rule-by-rule)

> **Pass definition:** PASS only if **Detection + Fix (if applicable) + UX/UI** are OK.

| Status | Count |
|--------|-------|
| **PASS** | 6 |
| **FAIL** | 14 |
| **Total Rules Validated** | 20 |

Rules marked PASS: 2, 3, 4, 17, 18, 19.

---

## Validation Criteria

### Generic (criteria) — Are implemented rules coherently working as expected end-to-end?

1. **Detection logic** — When a `.css` file where each of the 20 rules can be detected exactly once is put in the input panel and **Analyze** is pressed:
   - there are exactly 20 issues in the issue panel.
   - totals per group match spec.
   - totals per severity match spec.
2. **Fix logic** — When each implemented safe fix is selected, and the output is copied, the app is reset, the input panel is filled with the copied (fixed) `.css` content, and analyzed again:
   - no “safe / fixable / selectable” issues remain.
   - no new issues are created that were not present in the first analyze.
   - only rules that have an implemented fix according to `@tests/RULES_VALIDATION_REPORT.md` are tested.
3. **UX/UI** — UX/UI is easy to understand for the general user base.

### Specific (criteria) — For each rule, the following is checked:

1. **Detection logic** — Implementation detects what it should, and the rule is detected exactly once.
2. **Fix logic** — Implementation fixes what it should, and does so correctly (including not creating new/other issues).
3. **UX/UI** — UX/UI related to the rule is easy to understand for the general user base.

---

## Generic (test results) — Are implemented rules coherently working as expected end-to-end?

### 1) Detection logic (results)

When `@tests/test-all-rules.css` is pasted into the input panel and **Analyze** is pressed:
- exactly 20 issues shown ❌
- totals per group matching spec ❌
- totals per severity matching spec ❌

#### Per severity

> Note: **Expected severity breakdown is not updated yet**. This table is kept to capture observed values.

| Severity | Expected | Actual | Status |
|----------|----------|--------|--------|
| error | TBD | 1 | N/A |
| warning | TBD | 9 | N/A |
| info | TBD | 43 | N/A |
| **total** | 20 | 53 | **FAIL** |

#### Per group (as shown in UI)

Format 41  
Tokens 3  
consolidate 2  
safety 5  
layout 2  
Modern 1

#### Per fixability

| Fixability | Expected | Actual | Status |
|------------|----------|--------|--------|
| non-fixable | 7 | 7 | **PASS** |
| fixable | 13 | 47 | **FAIL** |
| **total** | 20 | 53 | **FAIL** |


### 2) Fix logic (results)

When each implemented safe fix is selected, the output is copied, the app is reset, the copied CSS is pasted back in, and analyzed again:
- no “safe / fixable / selectable” issues remain ❌
- no new issues are created that were not present in first analyze ❌

### 3) UX/UI (results)

Overall UX/UI is easy to understand for the general user base ❌

#### 3.1) Input panel
- ...

#### 3.2) Issue panel
- It’s easy to mix up **total issues** (“53”) vs **total selectable issues** (“0/47”).
  - Human decision: spec should require non-selectable, selected, and total issues to be shown together.
- Sorting is on grouping. It would be more logical to group by severity and, within each severity, sort by line number.
  - Human decision: spec to define this as new default. In a later version also support grouping by group and fixability, plus combined sorting by group/rule/severity/fixability and filters for these.
- Only ~3 issues are visible at once. Too much scrolling is needed.
  - Human decision: spec should require minimum of 10 issues visible at once.

#### 3.3) Output panel
- ...

### Other findings during testing
- The stats are not changing.
- Copy output is not working.

---

## Rule-by-rule results

> Format note: For rules with no auto-fix, “Fix logic” is marked NA and does not affect PASS/FAIL.

### 1. safety/invalid-syntax

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Rule is not triggered, but this is due to an error in the testing data | ⚠️ |
| Is issue selectable if fixable | Not yet, but desired | ⚠️ |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | No — description is too generic; not clear the issue is a missing `;` | ❌ |


Human adjusted testing data:

**From (valid):**
```css
/* 20. safety/invalid-syntax (at end to not break parsing) */
.invalid-syntax {
  color: red /* it's valid syntax for last property+value not to end with ";" within  {} */
}
```

**To (invalid):**
```css
/* 20. safety/invalid-syntax (at end to not break parsing) */
.invalid-syntax {
  color: red /* it's invalid syntax if it's not last property+value not to end with ";" within {} */
  background: red
}
```

**Status: FAIL**

**Human Decisions**
- Make issue description/explanation more explicit about what causes the error.
- Support SAFE (auto-fix).

---

### 2. safety/unrecognized-property

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | NA | NA |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | Excellent — clearly specifies what causes the issue | ✅ |

**Status: PASS**

**Human Decisions**
- Keep as is.

---

### 3. safety/misspelled-property

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Not yet, but desired | ⚠️ |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | Excellent — clearly specifies what causes the issue | ✅ |

**Status: PASS**

**Human Decisions**
- Support SAFE (auto-fix).

---

### 4. safety/typo-suspicious-units-and-tokens

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Not yet, but desired | ⚠️ |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | Best-in-class description: `Suspicious unit "xp" — did you mean "px"?: "10xp"` | ✅✅ |

**Status: PASS**

**Human Decisions**
- Add best-in-class UX/UI example to `@spec/UI_style_guide.md`.
- Support SAFE (auto-fix).

---

### 5. format/no-tabs

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | Yes | ✅ |
| Is (surrounding) syntax still correct after fixing | Possibly not when “show comments” is enabled | ⚠️ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Best-in-class: selecting issue shows the fix and line number color change | ✅✅ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment is injected in front of `property: value;` on same line instead of after | ❌ => ✅ (after phase 0 fixes) |

**Input**
```css
/* 4. format/no-tabs */
.has-tab {
	color: red;
}
```

**Observed output (wrong)**
```css
  /* 4. format/no-tabs */
  .has-tab {
     /* review: format/no-tabs: converted tabs to spaces */color: red;
  }
```

**Expected output (good)**
```css
/* 4. format/no-tabs */
.has-tab {
  color: red; /* review: format/no-tabs: converted tabs to spaces */
}
```

**Status: FAIL => PASS (after phase 0 fixes)**

**Human Decisions**
- Inject comments after `property: value;` (same line), with exactly 1 space after `;`.

---

### 6. format/indent-2-spaces

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | Yes | ✅ => ⚠️ (after phase 0 fixes, should be 2 spaces for nesting level 1 deep) |
| Is (surrounding) syntax still correct after fixing | Possibly not when “show comments” is enabled | ⚠️ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Best-in-class: selecting issue shows fix and line number color change | ✅✅ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injected in front of `property: value;` instead of after | ❌ => ✅ (after phase 0 fixes) |

**Input**
```css
/* 5. format/indent-2-spaces (3-space indent) */
.bad-indent {
   color: blue;
}
```

**Observed output (wrong)**
```css
/* 5. format/indent-2-spaces (3-space indent) */
.bad-indent {
     /* review: format/indent-2-spaces: normalized from 3 to 4 spaces */color: blue;
}
```

**Expected output (good)**
```css
/* 5. format/indent-2-spaces (3-space indent) */
.bad-indent {
  color: blue; /* review: format/indent-2-spaces: normalized from 3 to 4 spaces */
}
```

**Status: FAIL => PASS (after phase 0 fixes)**

**Human Decisions**
- Add best-in-class UX/UI example to `@spec/UI_style_guide.md`.
- Inject comments after `property: value;` (same line), with exactly 1 space after `;`.
- Future edge case to test: nested levels (2 spaces per nesting level).

---

### 7. format/multiple-declarations-per-line

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No — output is corrupted (extra `c`, spacing, brace placement) | ❌ => ⚠️ (after phase 0 fixes, the comment is two rows lower than expected, the } is on line too high) |
| Is (surrounding) syntax still correct after fixing | No | ❌ => ⚠️ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Hard to judge due to incorrect fix | ⚠️ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injection is correct in this case | ✅ |


**Observed output (wrong)**
```css
/* 6. format/multiple-declarations-per-line */
.multi-decl { c  color: red;
  background: blue; /* review: format/multiple-declarations-per-line: split declarations */}
```

**Expected output (good)**
```css
/* 6. format/multiple-declarations-per-line */
.multi-decl {
  color: red;
  background: blue; /* review: format/multiple-declarations-per-line: split declarations */
}
```

**Status: FAIL => PASS (after phase 0 fxes)**

**Human Decisions**
- Critical auto-fix: each property starts on a new line; do not inject random characters/spaces; closing `}` on a new line.

---

### 8. format/single-prop-single-line

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | No — shown multiple times (test file intentionally short; overlaps with other triggers) | ⚠️ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No — output is corrupted (extra `.`; brace placement) | ❌ (also after phase 0 fixes, the } is shown after the comment instead of before) |
| Is (surrounding) syntax still correct after fixing | No | ❌ => ⚠️ (technically yes after phase0 fixes) |
| Is UX/UI easy to understand for the general user base | Hard to judge due to incorrect fix | ⚠️ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injection is correct in this case | ✅ |

**Observed output (wrong)**
```css
/* 7. format/single-prop-single-line */
..single-prop { color: green; } /* review: format/single-prop-single-line: single property kept on one line */
```

**Expected output (good)**
```css
/* 7. format/single-prop-single-line */
.single-prop { color: green; /* review: format/single-prop-single-line: single property kept on one line */
}
```

**Status: FAIL => PASS **

**Human Decisions**
- Critical auto-fix: do not inject extra `.`; closing `}` must be on a new line and last (after comment).

---

### 9. format/normalize-spaces

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | Yes | ✅ |
| Is (surrounding) syntax still correct after fixing | Possibly not when “show comments” is enabled | ⚠️ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Probably OK | ✅ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injected after property but before value | ❌  => ✅ (after phase 0 fixes) |

**Observed output (wrong)**
```css
.no-space {
  color:  /* review: format/normalize-spaces: added space after colon */red;
}
```

**Expected output (good)**
```css
.no-space {
  color: red; /* review: format/normalize-spaces: added space after colon */
}
```

**Status: FAIL**

**Human Decisions**
- Inject comments after `property: value;` (same line), with exactly 1 space after `;`.

---

### 10. format/sort-properties

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No — selector and `{}` removed | ❌ (also after phase0 fixes, a ";" too many) |
| Is (surrounding) syntax still correct after fixing | No — selector and `{}` removed | ❌  (also after phase0 fixes, a ";" too many) |
| Is UX/UI easy to understand for the general user base | Hard to judge due to incorrect fix | ⚠️ |
| Is UX/UI easy to understand if “show comments” is enabled | Hard to judge due to incorrect fix | ⚠️ |

**Observed output (wrong)**
```css
/* 6. format/multiple-declarations-per-line */
background: blue;
color: red; /* review: format/sort-properties: reordered to grouped order */
```

**Expected output (good)**
```css
/* 6. format/multiple-declarations-per-line */
.multi-decl {
  background: blue; /* review: format/sort-properties: reordered to grouped order */
  color: red; /* review: format/sort-properties: reordered to grouped order */
}
```

**Status: FAIL**

**Human Decisions**
- Critical auto-fix: never drop selector or braces; keep block structure.

---

### 11. format/one-selector-per-line

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | No — triggered 19 times; message says multiple comma-separated selectors but this is not true in most cases | ❌ => ✅ (after phase 0 fixes) |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No | ❌ => ✅ (after phase 0 fixes) |
| Is (surrounding) syntax still correct after fixing | Possibly not | ⚠️=> ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Hard to judge due to incorrect fix | ⚠️ |
| Is UX/UI easy to understand if “show comments” is enabled | No | ❌ => ⚠️ (after phase 0 fixes) |

**Observed output (wrong)**
```css
/* 10. format/one-selector-per-line */
..sel-a,
.sel-b /* review: format/one-selector-per-line: split selectors to separate lines */{ color: pink; }
```

**Expected output (good)**
```css
/* 10. format/one-selector-per-line */
.sel-a, /* review: format/one-selector-per-line: split selectors to separate lines */
.sel-b { /* review: format/one-selector-per-line: split selectors to separate lines */
  color: pink;
}
```

**Status: FAIL => PASS (after phase 0) fixes **

**Human Decisions**
- Critical auto-fix: do not inject extra `.`; closing `}` must be on a new line and last.

---

### 12. tokens/zero-units

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | Yes | ✅ |
| Is (surrounding) syntax still correct after fixing | Possibly not when “show comments” is enabled | ⚠️ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Excellent | ✅ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injected in front of `;` instead of after | ❌ => ✅ (after phase 0 fixes) |

**Status: FAIL => PASS (after phase 0 fixes)**

**Human Decisions**
- Inject comments after `property: value;` (same line), with exactly 1 space after `;`.

---

### 13. tokens/shorten-hex-colors

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | In test data yes, but if a class is changed to an id starting with `#` it triggers while it should not | ❌ (rule no longer triggered at all after phase 0 fixes) |
| Is issue selectable if fixable | Yes | ✅ => ❌ (rule no longer triggered at all after phase 0 fixes) |
| Is selecting the issue fixing the output panel | Yes | ✅ => ❌ (rule no longer triggered at all after phase 0 fixes) |
| Is (surrounding) syntax still correct after fixing | Possibly not when “show comments” is enabled | ⚠️ |
| Is UX/UI easy to understand for the general user base | Fix preview is highlighted in blue info color for no good reason | ❌ |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injected in front of `;` instead of after | ❌ |

**Status: FAIL**

**Human Decisions**
- Inject comments after `property: value;` (same line), with exactly 1 space after `;`.
- Ensure rule triggers only for values, not selectors.
- Do not highlight fixes with severity colors; prefer no highlight or normal syntax highlighting.

---

### 14. tokens/remove-trailing-zeros

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | Yes | ✅ |
| Is (surrounding) syntax still correct after fixing | Possibly not when “show comments” is enabled | ⚠️ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Fix preview is highlighted in blue info color for no good reason | ❌ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand if “show comments” is enabled | Comment injected in front of `;` instead of after | ❌ => ✅ (after phase 0 fixes) |

**Status: FAIL**

**Human Decisions**
- Inject comments after `property: value;` (same line), with exactly 1 space after `;`.
- Do not highlight fixes with severity colors; prefer no highlight or normal syntax highlighting.

---

### 15. consolidate/shorthand-margin-padding

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No — extra `p`, longhands not removed | ❌ => ✅ (after phase 0 fixes) |
| Is (surrounding) syntax still correct after fixing | No — `;` removed when it should not be | ❌ (also after phase 0 fixes, one too many ";" remaians) |
| Is UX/UI easy to understand for the general user base | Fix preview is highlighted in blue info color for no good reason | ❌  => ✅ (after phase 0 fixes)|
| Is UX/UI easy to understand if “show comments” is enabled | Comment injected in front of `;` instead of after | ❌ => ✅ (after phase 0 fixes) |

**Observed output (wrong)**
```css
/* 14. consolidate/shorthand-margin-padding */
.longhands {
  ppadding: 10px /* review: consolidate/shorthand-margin-padding: was padding-top/right/bottom/left */
  padding-right: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
}
```

**Expected output (good)**
```css
/* 14. consolidate/shorthand-margin-padding */
.longhands {
  padding: 10px; /* review: consolidate/shorthand-margin-padding: was padding-top/right/bottom/left */
}
```

**Status: FAIL**

**Human Decisions**
- Critical auto-fix: remove longhands, do not add extra `p`, and keep required `;`.
- Do not highlight fixes with severity colors; prefer no highlight or normal syntax highlighting.

---

### 16. consolidate/deduplicate-last-wins

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No — stray `c` remains | ❌ => ✅ (after phase 0 fixes) |
| Is (surrounding) syntax still correct after fixing | No — output line is corrupted | ❌  => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Fix preview is highlighted in blue info color for no good reason | ❌ => ✅ (after phase 0 fixes)|
| Is UX/UI easy to understand if “show comments” is enabled | Comment text is a bit ambiguous for less experienced users | ⚠️ => ✅ (after phase 0 fixes) |

**Observed output (wrong)**
```css
/* 15. consolidate/deduplicate-last-wins */
.duplicate {
  c /* review: consolidate/deduplicate-last-wins: removed earlier overridden value red */
  color: blue;
}
```

**Expected output (good)**
```css
/* 15. consolidate/deduplicate-last-wins */
.duplicate {
  /* review: consolidate/deduplicate-last-wins: removed earlier overridden value red */
  color: blue;
}
```

**Status: FAIL => PASS (after phase 0 fixes)**

**Human Decisions**
- Critical auto-fix: remove stray `c` on the same line.
- Do not highlight fixes with severity colors; prefer no highlight or normal syntax highlighting.

---

### 17. style/important-used

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | NA | NA |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | Average | ✅ |

**Status: PASS**

**Human Decisions**
- None.

---

### 18. layout/flex-properties-require-flex

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Not yet, but desired | ⚠️ |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | Average | ✅ |

**Status: PASS**

**Human Decisions**
- Support SAFE (auto-fix) in future.

---

### 19. layout/grid-properties-require-grid

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Not yet, but desired | ⚠️ |
| Is selecting the issue fixing the output panel | NA | NA |
| Is syntax still correct after fixing | NA | NA |
| Is UX/UI easy to understand for the general user base | Average | ✅ |

**Status: PASS**

**Human Decisions**
- Support SAFE (auto-fix) in future.

---

### 20. modern/prefer-hex-colors

| Validation | Test result | Verdict |
|-----------|-------------|---------|
| Is rule detected exactly once | Yes | ✅ |
| Is issue selectable if fixable | Yes | ✅ |
| Is selecting the issue fixing the output panel | No — stray `r` remains | ❌ => ✅ (after phase 0 fixes) |
| Is (surrounding) syntax still correct after fixing | No — missing `;` | ❌ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand for the general user base | Fix preview is highlighted in blue info color for no good reason | ❌ => ✅ (after phase 0 fixes) |
| Is UX/UI easy to understand if “show comments” is enabled | Good | ✅ |

**Observed output (wrong)**
```css
/* 19. modern/prefer-hex-colors */
.rgb-color {
  color: r#f00 /* review: modern/prefer-hex-colors: converted from rgb(255,0,0) */
}
```

**Expected output (good)**
```css
/* 19. modern/prefer-hex-colors */
.rgb-color {
  color: #f00; /* review: modern/prefer-hex-colors: converted from rgb(255,0,0) */
}
```

**Status: FAIL => PASS (after phase 0 fixes)**

**Human Decisions**
- Critical auto-fix: remove stray `r` and add `;` after value.
- Do not highlight fixes with severity colors; prefer no highlight or normal syntax highlighting.

---

## Consolidated Issues Summary

### Issues Overview (Generic)

| Issue | Impact | Evidence section | Suggested fix |
|------|--------|------------------|--------------|
| Issue totals mismatch (20 expected vs 53 actual) | High — undermines trust in results | Generic (test results) → Detection logic | Fix rule triggering and/or duplicate reporting; ensure 1 issue per intended trigger in test file |
| Fixes corrupt CSS output (stray `c`, `r`, extra `.`, missing `;`, braces removed) | Critical — can break user CSS | Rules 7, 8, 10, 11, 15, 16, 20 | Fix transformer logic; add snapshot tests for exact expected output |
| Comment injection placement inconsistent | High — reduces readability and can break lines | Rules 5, 6, 9, 12–15 | Standardize comment placement: after `property: value;` with one space |
| Issue panel totals confusing (53 vs 0/47) | Medium — UX confusion | Generic → UX/UI → Issue panel | Show non-selectable, selected, and total issues together |
| Sorting/grouping default not user-friendly | Medium — hard navigation | Generic → UX/UI → Issue panel | Default: group by severity, sort by line number |
| Too few issues visible (~3) | Medium — too much scrolling | Generic → UX/UI → Issue panel | Require minimum 10 visible issues |
| Stats not changing | High — may indicate state update bug | Generic → Other findings | Investigate UI state updates for totals/stats |

### Issues Overview (Specific)

| Rule | Issue | Severity |
|------|-------|----------|
| safety/invalid-syntax | Issue text too generic; missing `;` not clear; auto-fix desired | Medium |
| format/no-tabs | Comment injection before declaration when comments enabled | High |
| format/indent-2-spaces | Comment injection before declaration when comments enabled | High |
| format/multiple-declarations-per-line | Auto-fix corrupts output (`c`, spacing, brace placement) | Critical |
| format/single-prop-single-line | Auto-fix corrupts selector (`..`) and brace placement | Critical |
| format/normalize-spaces | Comment injection between `:` and value | High |
| format/sort-properties | Auto-fix removes selector and braces | Critical |
| format/one-selector-per-line | Over-triggers + auto-fix corrupts selector (`..`) and formatting | Critical |
| tokens/zero-units | Comment injected before `;` | High |
| tokens/shorten-hex-colors | Triggers on selectors; comment placement; odd highlighting | High |
| tokens/remove-trailing-zeros | Comment placement; odd highlighting | Medium |
| consolidate/shorthand-margin-padding | Auto-fix adds `p`, removes `;`, does not remove longhands | Critical |
| consolidate/deduplicate-last-wins | Auto-fix leaves stray `c`; confusing highlight | High |
| modern/prefer-hex-colors | Auto-fix leaves stray `r`; missing `;`; confusing highlight | Critical |

END
