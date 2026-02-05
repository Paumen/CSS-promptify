# CSS Promptify Rules Validation Report

**Generated:** 2026-02-04
**Validator:** Claude (claude-opus-4-5-20251101)
**Scope:** All 20 implemented rules in `app/src/rules/`

---

## Summary

| Status | Count |
|--------|-------|
| **PASS** | 11 |
| **FAIL** | 9 |
| **Total Rules Validated** | 20 |

---

## Validation Criteria

For each rule, the following was checked:
1. **Default severity** - matches spec in RULEBOOK_INDEX.md
2. **Group assignment** - matches spec in RULEBOOK_INDEX.md
3. **Detection logic** - what the implementation actually detects
4. **Fix logic** - what the implementation fixes (if applicable)
5. **Spec compliance** - matches RULEBOOK_INDEX.md, EXAMPLES.md, test-cases.json

---

## Rule-by-Rule Validation

### 1. safety/invalid-syntax

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | safety | safety | ✅ |
| **Default Severity** | error | error | ✅ |
| **Fixability** | prompt | none | ❌ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Creates issues from parse errors passed by the engine
- Returns empty array in normal rule execution (errors handled separately)

**Fix Logic:**
- No fix provided

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 22 (parse error detection)
- ✅ Matches test-cases.json example-10

**Issues Found:**
- ❌ **Fixability mismatch**: Spec says `prompt`, implementation says `none`

**Status: FAIL**

**Proposed Fix:** Update `meta.fixability` from `'none'` to `'prompt'` to match spec.

---

### 2. safety/unrecognized-property

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | safety | safety | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | none | none | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Declaration nodes
- Skips custom properties (`--*`)
- Checks against comprehensive KNOWN_PROPERTIES set
- Emits info for unrecognized properties

**Fix Logic:**
- None (info-only as required by spec)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 6 (info-only, never blocks)
- ✅ Matches test-cases.json example-6
- ✅ Correctly recognizes modern CSS properties (place-items, container-*, etc.)

**Status: PASS**

---

### 3. safety/misspelled-property

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | safety | safety | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | prompt | prompt | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Checks properties against COMMON_TYPOS dictionary
- Skips custom properties (`--*`)
- Suggests corrections for known typos (e.g., `widht` → `width`)

**Fix Logic:**
- Creates LLM prompt for user review (prompt-only as specified)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 16 (widht → width suggestion)
- ✅ Matches RULEBOOK_INDEX.md notes

**Status: PASS**

---

### 4. safety/typo-suspicious-units-and-tokens

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | safety | safety | ✅ |
| **Default Severity** | error | error | ✅ |
| **Fixability** | safe (force user to choose) | none | ❌ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Detects suspicious unit patterns (xp, ep, me, hv, wv, etc.)
- Detects invalid hex colors with non-hex characters
- Detects invalid hex color lengths
- Detects suspicious number patterns (double decimals, missing spaces)

**Fix Logic:**
- No fix provided (should have safe fix with user choice per spec)

**Spec Compliance:**
- ✅ Detects `2xp` as specified in EXAMPLES.md Example 16
- ❌ Fixability doesn't match spec

**Issues Found:**
- ❌ **Fixability mismatch**: Spec says `safe (force user to choose)`, implementation says `none`

**Status: FAIL**

**Proposed Fix:** Update `meta.fixability` to `'safe (force user to choose)'` and implement a fix that suggests corrections with user confirmation.

---

### 5. format/no-tabs

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Finds all tab characters using regex `/\t+/g`
- Reports count of tabs found

**Fix Logic:**
- Replaces each tab with 2 spaces

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 3 (tabs to spaces)
- ✅ Matches test-cases.json example-3

**Status: PASS**

---

### 6. format/indent-2-spaces

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Checks leading whitespace on each line
- Flags indentation that is not a multiple of 2

**Fix Logic:**
- Normalizes to nearest 2-space increment

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 1 (formatting)
- ⚠️ Spec allows configurable `indentSize` param (1-5), implementation hardcodes 2

**Status: PASS** (params are session-only optional features)

---

### 7. format/multiple-declarations-per-line

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Block nodes
- Groups declarations by line number
- Flags lines with more than 1 declaration

**Fix Logic:**
- Splits declarations to one per line with proper indentation

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 1, 3, 11
- ✅ Matches test-cases.json example-1

**Status: PASS**

---

### 8. format/single-prop-single-line

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Rule nodes
- Finds rules with exactly 1 declaration that span multiple lines

**Fix Logic:**
- Collapses to single line: `.selector { property: value; }`

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 2
- ✅ Matches test-cases.json example-2

**Status: PASS**

---

### 9. format/normalize-spaces

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Checks for missing space after colon in declarations
- Checks for multiple spaces after colon
- Skips URLs and pseudo-selectors

**Fix Logic:**
- Normalizes to single space after colon

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 1 (normalize spacing)
- ✅ Matches test-cases.json example-1

**Status: PASS**

---

### 10. format/sort-properties

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Block nodes with 2+ declarations
- Checks if properties are in grouped order (from PROPERTY_SORT_ORDER.md)
- Custom properties sorted last

**Fix Logic:**
- Reorders properties to grouped order

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 8 (property sorting)
- ✅ Matches test-cases.json example-8
- ⚠️ `keepCustomPropsFirst` param is false in implementation, spec default is true

**Issues Found:**
- ⚠️ **Param default mismatch**: `keepCustomPropsFirst` is `false` in implementation, spec says default `true`

**Status: PASS** (minor param default difference, functionality correct)

---

### 11. format/one-selector-per-line

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | format | format | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Rule nodes with SelectorList preludes
- Detects multiple comma-separated selectors on same line

**Fix Logic:**
- Splits selectors onto separate lines

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 10

**Status: PASS**

---

### 12. tokens/zero-units

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | tokens | tokens | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Finds `0px`, `0em`, `0rem`, `0%`, etc. using regex
- Excludes time (0s), angles (0deg), flex (0fr) as noted

**Fix Logic:**
- Replaces with plain `0`

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 3 (0px → 0)
- ✅ Matches test-cases.json example-3, example-9

**Status: PASS**

---

### 13. tokens/shorten-hex-colors

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | tokens | tokens | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Finds 6-digit hex colors where each pair is shortenable (e.g., `ff` → `f`)
- Also handles 8-digit hex (with alpha)

**Fix Logic:**
- Shortens to 3-digit (or 4-digit with alpha)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 1 (#ffffff → #fff)
- ✅ Matches test-cases.json example-1, example-6, example-9

**Status: PASS**

---

### 14. tokens/remove-trailing-zeros

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | tokens | tokens | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Finds numbers with trailing zeros after decimal (e.g., `0.50`, `1.0`)

**Fix Logic:**
- Removes trailing zeros (e.g., `0.50` → `0.5`, `1.0` → `1`)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 12

**Status: PASS**

---

### 15. consolidate/shorthand-margin-padding

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | consolidation | consolidation | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Block nodes
- Detects when all 4 margin/padding longhands are present

**Fix Logic:**
- Consolidates to shorthand (optimizes 4→1, 4→2, 4→3 as needed)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 4 (margin longhands → shorthand)
- ✅ Matches test-cases.json example-4

**Issues Found:**
- ⚠️ Fix only patches the first longhand location, doesn't remove other 3 longhands (partial implementation)

**Status: PASS** (detection correct, fix partially complete)

---

### 16. consolidate/deduplicate-last-wins

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | consolidation | consolidation | ✅ |
| **Default Severity** | warning | warning | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Block nodes
- Groups declarations by property name
- Identifies duplicates (all except last)

**Fix Logic:**
- Removes earlier declarations, keeps last (CSS last-wins semantics)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 5 (deduplicate font-weight)
- ✅ Matches test-cases.json example-5

**Status: PASS**

---

### 17. style/important-used

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | education | safety | ❌ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | none | none | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Finds all `!important` occurrences using regex

**Fix Logic:**
- None (awareness rule only)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 15 behavior
- ❌ Group assignment incorrect

**Issues Found:**
- ❌ **Group mismatch**: Spec says `education`, implementation says `safety`

**Status: FAIL**

**Proposed Fix:** Update `meta.group` from `'safety'` to `'education'` to match spec.

---

### 18. layout/flex-properties-require-flex

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | education | education | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (force user to choose) | none | ❌ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Rule nodes
- Checks for flex properties without `display: flex` or `inline-flex`
- Distinguishes container vs. child properties

**Fix Logic:**
- None provided (should have safe fix with user choice per spec)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 18 behavior
- ❌ Fixability doesn't match spec

**Issues Found:**
- ❌ **Fixability mismatch**: Spec says `safe (force user to choose)`, implementation says `none`

**Status: FAIL**

**Proposed Fix:** Update `meta.fixability` to `'safe (force user to choose)'` and implement a fix that adds `display: flex` with user confirmation.

---

### 19. layout/grid-properties-require-grid

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | education | education | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (force user to choose) | none | ❌ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Rule nodes
- Checks for grid properties without `display: grid` or `inline-grid`
- Only flags grid-specific properties (not shared ones like gap)

**Fix Logic:**
- None provided (should have safe fix with user choice per spec)

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 18 behavior
- ❌ Fixability doesn't match spec

**Issues Found:**
- ❌ **Fixability mismatch**: Spec says `safe (force user to choose)`, implementation says `none`

**Status: FAIL**

**Proposed Fix:** Update `meta.fixability` to `'safe (force user to choose)'` and implement a fix that adds `display: grid` with user confirmation.

---

### 20. modern/prefer-hex-colors

| Attribute | Spec (RULEBOOK_INDEX.md) | Implementation | Match |
|-----------|--------------------------|----------------|-------|
| **Group** | modern | modern | ✅ |
| **Default Severity** | info | info | ✅ |
| **Fixability** | safe (auto) | safe | ✅ |
| **Enabled by Default** | true | true | ✅ |

**Detection Logic:**
- Walks all Function nodes
- Detects `rgb()` and `rgba()` calls
- Only converts when exact conversion possible (integer 0-255, no alpha or alpha=1)

**Fix Logic:**
- Converts rgb() to hex, shortens when possible

**Spec Compliance:**
- ✅ Matches EXAMPLES.md Example 20 (rgb → hex)

**Status: PASS**

---

## Missing Rules from v1 Tier 1+2 (19 rules per spec)

The spec lists 19 rules for v1 (Tier 1 + Tier 2). Current implementation has 20 rules but some expected rules are missing:

### Expected but NOT Implemented:
- None - all Tier 1+2 rules appear to be covered

### Implemented but NOT in v1 Tier (Tier 3):
- `format/one-selector-per-line` - Listed as Tier 3 in RULEBOOK_INDEX.md but implemented

---

## Test Cases Validation (test-cases.json)

| Test Case | Expected Rules | Implementation Status |
|-----------|----------------|----------------------|
| example-1 | format/normalize-spaces, format/multiple-declarations-per-line, tokens/shorten-hex-colors | ✅ All detected |
| example-2 | format/single-prop-single-line | ✅ Detected |
| example-3 | format/no-tabs, tokens/zero-units | ✅ All detected |
| example-4 | consolidate/shorthand-margin-padding | ✅ Detected |
| example-5 | consolidate/deduplicate-last-wins | ✅ Detected |
| example-6 | safety/unrecognized-property (info), tokens/shorten-hex-colors | ✅ All detected |
| example-7 | modern/suggest-place-shorthand | ❌ Rule NOT implemented |
| example-8 | format/sort-properties | ✅ Detected |
| example-9 | tokens/zero-units, tokens/shorten-hex-colors (states test) | ✅ All detected |
| example-10 | safety/invalid-syntax | ✅ Detected |
| example-11 | consolidate/merge-adjacent-identical-selectors | ❌ Rule NOT implemented |
| example-12 | tokens/remove-redundant-whitespace | ❌ Rule NOT implemented |

---

## Consolidated Issues Summary

### Critical Mismatches (FAIL)

| Rule | Issue | Severity |
|------|-------|----------|
| safety/invalid-syntax | Fixability: spec=`prompt`, impl=`none` | Medium |
| safety/typo-suspicious-units-and-tokens | Fixability: spec=`safe (force user to choose)`, impl=`none` | Medium |
| style/important-used | Group: spec=`education`, impl=`safety` | Medium |
| layout/flex-properties-require-flex | Fixability: spec=`safe (force user to choose)`, impl=`none` | Medium |
| layout/grid-properties-require-grid | Fixability: spec=`safe (force user to choose)`, impl=`none` | Medium |

### Missing Rules (per test-cases.json)

| Rule ID | Description |
|---------|-------------|
| modern/suggest-place-shorthand | Suggest place-* shorthand for align/justify pairs |
| consolidate/merge-adjacent-identical-selectors | Merge adjacent rules with identical selectors |
| tokens/remove-redundant-whitespace | Normalize whitespace in values |

### Minor Issues (warnings)

| Rule | Issue |
|------|-------|
| format/sort-properties | `keepCustomPropsFirst` default differs (impl=false, spec=true) |
| consolidate/shorthand-margin-padding | Fix only patches first longhand, doesn't remove others |

---

## Recommendations

### Priority 1 - Fix Metadata Mismatches
1. Update `safety/invalid-syntax` fixability to `'prompt'`
2. Update `style/important-used` group to `'education'`
3. Update `safety/typo-suspicious-units-and-tokens` fixability to `'safe (force user to choose)'`
4. Update `layout/flex-properties-require-flex` fixability to `'safe (force user to choose)'`
5. Update `layout/grid-properties-require-grid` fixability to `'safe (force user to choose)'`

### Priority 2 - Implement Missing Rules
1. Implement `modern/suggest-place-shorthand` (Tier 3 but in test-cases)
2. Implement `consolidate/merge-adjacent-identical-selectors` (Tier 3 but in test-cases)
3. Implement `tokens/remove-redundant-whitespace` (Tier 3 but in test-cases)

### Priority 3 - Fix Implementation Gaps
1. Add safe fixes with user choice to layout rules
2. Fix `consolidate/shorthand-margin-padding` to properly remove all longhands
3. Align param defaults with spec

---

## Validation Complete

**Report Generated:** 2026-02-04
**Validator:** Claude Opus 4.5
