# Root Cause Analysis and Action Plan

**Generated:** 2026-02-05
**Context:** Comparison of Claude validation (`tests/RULES_VALIDATION_REPORT.md`) vs Human validation (`tests/RULES_VALIDATION_REPORT_HUMAN.md`)

---

## Part 1: Root Cause Analysis

### 1.1 Summary of Discrepancy

| Metric | Claude Report | Human Report | Gap |
|--------|---------------|--------------|-----|
| **Rules Passing** | 11 | 6 | -5 |
| **Rules Failing** | 9 | 14 | +5 |
| **Issues Expected** | 20 | 20 | — |
| **Issues Actual** | Not tested | 53 | +33 false positives |
| **Fix Corruption** | 1 noted | 8 critical | +7 missed |

### 1.2 Root Causes Identified

#### RC-1: Static Code Analysis vs End-to-End Runtime Testing

**What happened:** Claude's validation read source code and compared metadata/logic descriptions against spec documents. It did NOT:
- Run the app end-to-end
- Execute the analysis engine with real CSS input
- Test patch application logic
- Verify actual CSS output after fixes

**Why it matters:** Many bugs only manifest at runtime when:
- Patches are applied via the engine (`applyFixes` function)
- Multiple rules interact with the same CSS
- Comment injection happens
- Range calculations compound

**Evidence:**
- Claude marked `format/multiple-declarations-per-line` as PASS
- Human testing showed fix produces `c  color: red;` (corrupted)
- Bug exists in patch application, not in detection logic

#### RC-2: Patch Range Calculation Bugs in Individual Rules

**What happened:** Multiple rules calculate `Range` objects incorrectly, causing:
- Extra characters included in patch (stray `c`, `r`, `p`)
- Missing characters (dropped `;`)
- Over-aggressive replacement (removed selectors/braces)

**Affected rules:**
| Rule | Corruption Type |
|------|-----------------|
| format/multiple-declarations-per-line | Extra `c`, bad spacing, brace placement |
| format/single-prop-single-line | Extra `.` in selector |
| format/sort-properties | Removes selector and braces entirely |
| format/one-selector-per-line | Extra `.`, bad brace placement |
| consolidate/shorthand-margin-padding | Extra `p`, removes `;`, longhands not deleted |
| consolidate/deduplicate-last-wins | Stray `c` remains |
| modern/prefer-hex-colors | Stray `r`, missing `;` |

**Root cause:** Rules calculate patch ranges using AST node locations, but:
1. Some include the first character of adjacent tokens
2. Some exclude required semicolons
3. Multi-patch rules don't coordinate removal of all affected declarations

#### RC-3: Comment Injection Architecture Flaw

**What happened:** Comments are appended to patch text in `engine/index.ts:173-175`:
```typescript
if (includeComments && fix.comment.text) {
  replacement += ` /* ${fix.comment.text} */`;
}
```

**The problem:** Patches often target just part of a declaration (e.g., the colon or the value), NOT the full `property: value;` line. Appending a comment to a partial patch puts comments:
- Between `:` and value (`color:  /* comment */red;`)
- Before the semicolon (`margin: 0 /* comment */;`)
- At arbitrary points mid-line

**Correct behavior per spec:** Comments should always appear AFTER `property: value;` with one space:
```css
color: red; /* cssreview: ... */
```

**This is a fundamental architecture issue:** Comment placement should be a post-processing step that finds the end of each affected declaration, not an inline patch modification.

#### RC-4: Detection Logic Over-Triggering

**What happened:** Some rules fire on patterns they shouldn't:

| Rule | Expected Triggers | Actual Triggers | Over-trigger |
|------|-------------------|-----------------|--------------|
| format/one-selector-per-line | 1 | 19 | +18 |
| tokens/shorten-hex-colors | values only | also selectors | yes |

**Root causes:**
- `format/one-selector-per-line`: Regex/AST matching is too broad; fires on any Rule node
- `tokens/shorten-hex-colors`: Uses regex that matches `#` anywhere, including in ID selectors like `#header`

#### RC-5: No Snapshot Testing for Fix Output

**What happened:** The test suite (`rules.test.ts`) only verifies:
- ✅ Issues are detected
- ✅ Issue count is correct
- ✅ `fix.preview` value is correct

It does NOT verify:
- ❌ CSS output after `applyFixes()` is called
- ❌ Applied CSS is syntactically valid
- ❌ Applied CSS matches expected output
- ❌ Comment injection placement

**Evidence:** All rules with fix corruption bugs passed Claude's static analysis because their `fix.preview` values were correct.

#### RC-6: Spec Lacks Explicit Output Examples

**What happened:** Spec documents (`EXAMPLES.md`, `RULEBOOK_INDEX.md`) describe:
- ✅ What should be detected
- ✅ What the fix should do conceptually
- ⚠️ Some before/after CSS examples

But they don't consistently provide:
- ❌ Exact expected output for every rule
- ❌ Expected output WITH comments enabled
- ❌ Edge cases (multiple issues in same rule block, etc.)

**Impact:** Without explicit expected output, there's no clear specification to test against.

---

## Part 2: How to Prevent Recurrence

### 2.1 Mandatory Testing Requirements

**For any rule implementation or fix:**

1. **Unit test: Detection** (exists today)
   - Verify issue is detected
   - Verify issue metadata (severity, group, message)

2. **Unit test: Fix Preview** (exists today)
   - Verify `fix.preview` is correct

3. **NEW: Integration test: Fix Application**
   - Call `applyFixes()` with issue
   - Verify output CSS matches expected
   - Verify output CSS is syntactically valid

4. **NEW: Integration test: With Comments**
   - Same as above but with `includeComments: true`
   - Verify comment placement is correct

5. **NEW: E2E test: Multi-rule interaction**
   - Test CSS that triggers multiple rules
   - Apply all fixes
   - Verify final output

### 2.2 Spec Document Improvements

1. **EXAMPLES.md must include:**
   - Exact input CSS
   - Exact expected output CSS (without comments)
   - Exact expected output CSS (with comments)
   - For every rule with a fix

2. **RULEBOOK_INDEX.md must include:**
   - Clear "triggers on" and "does not trigger on" examples
   - Edge cases that should NOT trigger

3. **New: TEST_CONTRACTS.md**
   - Machine-readable test specifications
   - Input → expected output mappings
   - Can be auto-validated

### 2.3 Architecture Changes

1. **Separate comment injection from patch application**
   - `applyFixes()` applies patches only
   - `injectComments()` post-processes to add comments at end-of-declaration

2. **Patch validation layer**
   - Before applying, verify patch range is within bounds
   - Verify patch doesn't include extraneous characters
   - Verify result is valid CSS (quick parse check)

3. **Multi-patch coordination for consolidation rules**
   - Rules like `shorthand-margin-padding` need to emit patches that:
     - Replace first longhand with shorthand
     - Delete remaining longhands (as separate patches)

---

## Part 3: Actionable Phased Plan

### Phase 0: Immediate Stabilization (Critical Fixes)

**Goal:** Fix CSS corruption bugs that make the tool unusable.

**Batch 0A: Fix Patch Application Engine**
1. Fix comment injection to be post-processing (end-of-declaration)
2. Add patch validation (range bounds check)
3. Add CSS validity check after fix application

**Batch 0B: Fix Critical Rule Corruption Bugs**

| Rule | Fix Required |
|------|--------------|
| format/multiple-declarations-per-line | Fix range to not include extra `c`; proper line splitting |
| format/single-prop-single-line | Fix range to not double selector `.` |
| format/sort-properties | Keep selector and braces; only patch block contents |
| format/one-selector-per-line | Fix over-triggering; fix range calculation |
| consolidate/shorthand-margin-padding | Add patches to delete other longhands; keep `;` |
| consolidate/deduplicate-last-wins | Delete full declaration line including leading whitespace |
| modern/prefer-hex-colors | Fix range to not include first char of `rgb`; ensure `;` preserved |

**Deliverables:**
- [ ] Updated `app/src/engine/index.ts` with comment post-processing
- [ ] Fixed rule implementations (7 rules)
- [ ] Integration tests for each fixed rule

---

### Phase 1: Testing Infrastructure

**Goal:** Ensure bugs are caught before human testing.

**Batch 1A: Add Fix Application Tests**

For each rule with a fix, add test:
```typescript
it('applies fix correctly', () => {
  const input = '...';
  const expected = '...';
  const { issues } = analyze(input, config);
  const { css } = applyFixes(input, issues, [issues[0].fix.id], false);
  expect(css).toBe(expected);
});
```

**Batch 1B: Add Comment Injection Tests**

Same as above but with `includeComments: true`:
```typescript
it('injects comment correctly', () => {
  const input = '...';
  const expectedWithComment = '... /* cssreview: ... */';
  const { issues } = analyze(input, config);
  const { css } = applyFixes(input, issues, [issues[0].fix.id], true);
  expect(css).toBe(expectedWithComment);
});
```

**Batch 1C: Add E2E Snapshot Tests**

Use `test-all-rules.css` as input, capture expected output snapshot.

**Deliverables:**
- [ ] Fix application tests for all 13 rules with fixes
- [ ] Comment injection tests for all 13 rules
- [ ] E2E snapshot test with `test-all-rules.css`

---

### Phase 2: Spec Updates

**Goal:** Make specs explicit enough to drive testing.

**Batch 2A: Update EXAMPLES.md**

For each rule, add:
```markdown
### Rule: tokens/zero-units

**Input:**
```css
.card { margin: 0px; }
```

**Output (fix applied, no comments):**
```css
.card { margin: 0; }
```

**Output (fix applied, with comments):**
```css
.card { margin: 0; /* cssreview: tokens/zero-units: removed unnecessary unit from 0 */ }
```
```

**Batch 2B: Update RULEBOOK_INDEX.md**

Add explicit "Does NOT trigger on" examples:
```markdown
**Does NOT trigger on:**
- ID selectors like `#header` (hex color rule)
- Single selector rules (one-selector-per-line rule)
```

**Batch 2C: Update UI_STYLE_GUIDE.md**

Add comment placement specification:
```markdown
## Comment Injection

Comments MUST be placed:
- After the semicolon of the affected declaration
- With exactly 1 space after the semicolon
- On the same line as the declaration

Correct: `color: red; /* cssreview: ... */`
Incorrect: `color:  /* cssreview: ... */red;`
```

**Batch 2D: Update CLAUDE.md**

Add validation checklist for future implementations:
```markdown
## Rule Implementation Checklist

Before marking a rule complete:
1. [ ] Unit test: detection
2. [ ] Unit test: fix preview
3. [ ] Integration test: fix application
4. [ ] Integration test: with comments
5. [ ] Verify against EXAMPLES.md expected output
6. [ ] Run `npm test` passes
7. [ ] Manual E2E test with test-all-rules.css
```

**Deliverables:**
- [ ] Updated `spec/EXAMPLES.md` with exact outputs
- [ ] Updated `spec/RULEBOOK_INDEX.md` with "does not trigger" cases
- [ ] Updated `spec/UI_STYLE_GUIDE.md` with comment placement rules
- [ ] Updated `CLAUDE.md` with implementation checklist

---

### Phase 3: Metadata and UX Fixes

**Goal:** Align implementation with spec metadata; improve UX.

**Batch 3A: Fix Rule Metadata**

| Rule | Fix |
|------|-----|
| safety/invalid-syntax | `fixability: 'prompt'` |
| style/important-used | `group: 'education'` |
| safety/typo-suspicious-units-and-tokens | Add safe fix |
| layout/flex-properties-require-flex | Add safe fix |
| layout/grid-properties-require-grid | Add safe fix |

**Batch 3B: UX Improvements (from human report)**

| Issue | Fix |
|-------|-----|
| Total vs selectable count confusing | Show: "X issues (Y fixable, Z selected)" |
| Sorting default unhelpful | Default: sort by severity, then line number |
| Too few issues visible | CSS: min-height for issue list to show 10 |
| Fix preview highlighting | Remove severity-colored highlighting |
| Stats not updating | Debug state update for stats |
| Copy output not working | Debug clipboard functionality |

**Deliverables:**
- [ ] Fixed rule metadata (5 rules)
- [ ] UI fixes (6 items)

---

### Phase 4: Future Proofing

**Goal:** Ensure new rule implementations don't repeat these issues.

**Batch 4A: Add CI Validation**

- GitHub Action to run all tests
- Fail PR if any test fails

**Batch 4B: Add Pre-commit Validation**

- Hook to run affected tests on changed rule files

**Batch 4C: Documentation**

- Update `prompts/IMPLEMENTATION_CHECKLIST.md` with new testing requirements

**Deliverables:**
- [ ] GitHub Actions workflow
- [ ] Pre-commit hooks
- [ ] Updated implementation checklist

---

## Part 4: Execution Order Summary

| Phase | Priority | Effort | Dependencies |
|-------|----------|--------|--------------|
| **0** | CRITICAL | 2-3 days | None |
| **1** | HIGH | 2 days | Phase 0 |
| **2** | HIGH | 1 day | Phase 0 |
| **3** | MEDIUM | 1-2 days | Phase 0 |
| **4** | MEDIUM | 1 day | Phase 1 |

**Recommended Order:**
1. Phase 0A (engine fix) — unblocks all other fixes
2. Phase 0B (rule fixes) — makes tool usable
3. Phase 1A-C (tests) — prevents regression
4. Phase 2A-D (spec updates) — documents expectations
5. Phase 3A-B (metadata + UX) — polish
6. Phase 4A-C (CI + docs) — future-proof

---

## Part 5: Documents to Update

| Document | Updates Required |
|----------|------------------|
| `app/src/engine/index.ts` | Comment injection refactor |
| `app/src/rules/format/*.ts` | 4 rules with range fixes |
| `app/src/rules/consolidation/*.ts` | 2 rules with range fixes |
| `app/src/rules/modern/*.ts` | 1 rule with range fix |
| `app/src/rules/style/*.ts` | 1 rule metadata fix |
| `app/src/rules/safety/*.ts` | 2 rules metadata/fix additions |
| `app/src/rules/education/*.ts` | 2 rules fix additions |
| `app/src/rules/rules.test.ts` | Add fix application tests |
| `spec/EXAMPLES.md` | Add exact expected outputs |
| `spec/RULEBOOK_INDEX.md` | Add "does not trigger" cases |
| `spec/UI_STYLE_GUIDE.md` | Add comment placement rules |
| `CLAUDE.md` | Add implementation checklist |
| `prompts/IMPLEMENTATION_CHECKLIST.md` | Add testing requirements |
| `tests/test-all-rules.css` | Fix invalid-syntax test case |

---

## Part 6: Answers to Specific Questions

### Q: How can we prevent this from reoccurring when implementing more rules?

**A:** Require integration tests that verify actual CSS output, not just detection. Add to CLAUDE.md implementation checklist.

### Q: How can we improve testing and validation to catch issues?

**A:**
1. Add fix application tests for every rule with a fix
2. Add E2E snapshot tests with known-good output
3. Add CSS validity check after fix application

### Q: Are there architectural changes we must consider?

**A:** Yes:
1. Separate comment injection from patch application (post-processing)
2. Add patch validation layer
3. Multi-patch coordination for consolidation rules

### Q: Are there structural weak links that will keep things fragile?

**A:** Yes:
1. Range calculation in rules is error-prone — consider helper functions
2. No CSS validity check after fix — silent corruption
3. Comment injection coupled to patch application — wrong architecture

### Q: Is our detailed spec not explicit enough?

**A:** Partially:
- Detection specs are good
- Fix output specs are incomplete (no exact expected CSS)
- Comment placement not specified
- "Does not trigger" cases not documented

---

## Appendix A: Test Data Correction

The `tests/test-all-rules.css` file has one error:

**Current (line 98-101):**
```css
/* 20. safety/invalid-syntax (at end to not break parsing) */
.invalid-syntax {
  color: red
}
```

This is **valid CSS** (last property doesn't require `;`).

**Corrected:**
```css
/* 20. safety/invalid-syntax (at end to not break parsing) */
.invalid-syntax {
  color: red
  background: blue;
}
```

Missing `;` after `red` when it's NOT the last property triggers parse error.

---

**End of Document**
