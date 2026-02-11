<!--
CLAUDE_PERMISSIONS: READ | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_AND_INFORM
PURPOSE: Authoritative Reference
AUTHORITY: None
IF_CONFLICT: N/A
IF_OUTDATED: Flag human
PRIORITY: HIGH
-->

# Permissions Review & Recommendations

Comprehensive analysis of CLAUDE_PERMISSIONS for all 23 documents with justifications and suggested changes.

---

## Priority Level Definitions

| Priority | Meaning | Examples |
|----------|---------|----------|
| **CRITICAL** | Core system governance. Affects all decisions. Changes cascade. | PRD_BUILD_SPEC, DATA_CONTRACTS, AUTHORITY, DECISIONS, SYSTEM_PROMPT |
| **HIGH** | Directly affects implementation quality/correctness. Must be followed closely. | UI_BEHAVIOR, RULEBOOK_INDEX, EXAMPLES, TYPES, TERMINOLOGY, IMPLEMENTATION_CHECKLIST |
| **MEDIUM** | Important but not blocking. Provide guidance or context. | CLAUDE.md, README, WORKFLOW, RCA analysis, validation reports |
| **LOW** | Reference material. Nice to have but not essential. | app/README, human validation report |

---

## Detailed Analysis by Document

### SPEC FILES (9 documents)

#### 1. `spec/PRD_BUILD_SPEC.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: CRITICAL

**Analysis:**
- ✅ READ: Required (it's authoritative source)
- ❌ FOLLOW: **SHOULD ADD** - Claude must implement per this spec, not deviate
- ✅ SUGGEST: Correct (can propose spec improvements)
- ❌ EDIT: Correct to exclude (spec is human-owned)

**Recommendation:** `READ | FOLLOW | SUGGEST`

**Justification:** This is THE requirements document. Claude should not just read it—must actively follow it during implementation. Following = implementing per spec without deviation.

---

#### 2. `spec/DATA_CONTRACTS.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: CRITICAL

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: **SHOULD ADD** - Data shapes must be followed exactly
- ✅ SUGGEST: Correct
- ❌ EDIT: Correct to exclude

**Recommendation:** `READ | FOLLOW | SUGGEST`

**Justification:** Data invariants are non-negotiable. Claude must FOLLOW these shapes in all code. Deviation breaks system guarantees.

---

#### 3. `spec/AUTHORITY.md`
**Current:** READ | FOLLOW | Policy: STRICTLY_DISALLOWED | Priority: CRITICAL

**Analysis:**
- ✅ READ: Required
- ✅ FOLLOW: Correct (hierarchy must be followed)
- ❌ SUGGEST: **COULD ADD** - Could suggest hierarchy improvements
- ❌ EDIT: Correct to exclude (governance is human-owned)

**Recommendation:** `READ | FOLLOW | SUGGEST` with **SUGGEST only after explicit approval**

**Justification:** SUGGEST is low-risk (non-binding), but given CRITICAL priority + governance implications, could require `ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL` for changes. However, suggesting improvements is safe.

**Alternative:** Keep as-is if you want stricter control.

---

#### 4. `spec/TYPES.md`
**Current:** READ | FOLLOW | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: HIGH

**Status:** ✅ **Already optimal**

**Analysis:**
- ✅ READ: Required (interface definitions)
- ✅ FOLLOW: Correct (must use these types in implementation)
- ✅ SUGGEST: Correct (can suggest type improvements)
- ❌ EDIT: Correct to exclude (spec-owned)

---

#### 5. `spec/UI_BEHAVIOR.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: HIGH

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: **SHOULD ADD** - UI behavior is behavioral spec, must be followed
- ✅ SUGGEST: Correct
- ❌ EDIT: Correct to exclude

**Recommendation:** `READ | FOLLOW | SUGGEST`

**Justification:** "Behavior" specs are meant to be implemented exactly. Claude must follow these behaviors during UI implementation.

---

#### 6. `spec/RULEBOOK_INDEX.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: HIGH

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: **SHOULD ADD** - Rules must be implemented per index
- ✅ SUGGEST: Correct (rule improvements)
- ❌ EDIT: Correct to exclude (rule spec is human-defined)

**Recommendation:** `READ | FOLLOW | SUGGEST`

**Justification:** Rule catalog is prescriptive. Claude must implement rules exactly as indexed (IDs, defaults, fixability).

---

#### 7. `spec/EXAMPLES.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: HIGH

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: **SHOULD ADD** - Examples define expected behavior/test cases
- ✅ SUGGEST: Correct (suggest more examples)
- ❌ EDIT: Correct to exclude (spec-owned)

**Recommendation:** `READ | FOLLOW | SUGGEST`

**Justification:** Examples are the source of truth for "correct output." Claude must follow them when validating implementation.

---

#### 8. `spec/UI_STYLE_GUIDE.md`
**Current:** READ | FOLLOW | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: HIGH

**Status:** ✅ **Already optimal**

**Analysis:**
- ✅ READ: Required
- ✅ FOLLOW: Correct (styling rules are prescriptive)
- ✅ SUGGEST: Correct (style improvements)
- ❌ EDIT: Correct to exclude

---

#### 9. `spec/TERMINOLOGY.md`
**Current:** READ | FOLLOW | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: MEDIUM

**Status:** ✅ **Already optimal**

**Analysis:**
- ✅ READ: Required
- ✅ FOLLOW: Correct (must use terms consistently)
- ✅ SUGGEST: Correct (suggest term improvements)
- ❌ EDIT: Correct to exclude

---

### PROMPT/INSTRUCTION FILES (4 documents)

#### 10. `prompts/SYSTEM_PROMPT.md`
**Current:** READ | FOLLOW | Policy: STRICTLY_DISALLOWED | Priority: CRITICAL

**Status:** ✅ **Correct and must stay locked**

**Analysis:**
- ✅ READ: Required
- ✅ FOLLOW: Mandatory (LLM working instructions)
- ❌ SUGGEST: Correct to exclude (these are not open to suggestions)
- ❌ EDIT: Correct to exclude (STRICTLY_DISALLOWED)

**Justification:** Meta-instructions for how Claude works. Suggesting changes to instructions would create meta-loops. Keep locked.

---

#### 11. `prompts/IMPLEMENTATION_CHECKLIST.md`
**Current:** READ | FOLLOW | Policy: ALLOWED_AND_INFORM | Priority: HIGH

**Analysis:**
- ✅ READ: Required
- ✅ FOLLOW: Correct (phases must be followed in order)
- ❌ SUGGEST: **COULD ADD** - Can suggest phase improvements (low-risk)
- ❌ EDIT: **COULD ADD** - Could update with notes/progress (ALLOWED_AND_INFORM)

**Recommendation:** `READ | FOLLOW | SUGGEST` (add SUGGEST for phase improvements)

**Justification:** Suggesting better phasing is valuable. Phase progress tracking could be helpful too.

**Alternative:** Keep stricter if you want clear phase boundaries.

---

#### 12. `prompts/WORKFLOW.md`
**Current:** READ | Policy: ALLOWED_AND_INFORM | Priority: MEDIUM

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (it's a guide, not a command)
- ❌ SUGGEST: **COULD ADD** - Can suggest workflow improvements
- ❌ EDIT: Not necessary

**Recommendation:** `READ | SUGGEST`

**Justification:** "Guide" docs benefit from Claude suggesting improvements. This is helpful, not controlling.

---

#### 13. `prompts/CHANGE_REQUEST_PROMPT.md`
**Current:** READ | Policy: ALLOWED_AND_INFORM | Priority: MEDIUM

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (it's a template for humans)
- ❌ SUGGEST: **COULD ADD** - Can suggest template improvements
- ❌ EDIT: Not necessary

**Recommendation:** `READ | SUGGEST`

**Justification:** Templates benefit from improvement suggestions.

---

### ROOT LEVEL & OTHER (8 documents)

#### 14. `CLAUDE.md`
**Current:** READ | FOLLOW | Policy: ALLOWED_AND_INFORM | Priority: CRITICAL

**Analysis:**
- ✅ READ: Required
- ✅ FOLLOW: Correct (these are Claude Code session instructions)
- ❌ SUGGEST: **COULD ADD** - Can suggest doc improvements (non-critical)
- ❌ EDIT: Correct to exclude (instructions are human-owned)

**Recommendation:** `READ | FOLLOW | SUGGEST`

**Justification:** Can suggest improvements to documentation quality without compromising instruction integrity.

---

#### 15. `README.md`
**Current:** READ | Policy: ALLOWED_AND_INFORM | Priority: MEDIUM

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (overview, not instructions)
- ❌ SUGGEST: **SHOULD ADD** - Can suggest content improvements
- ❌ EDIT: **COULD ADD** - Can make minor updates (ALLOWED_AND_INFORM)

**Recommendation:** `READ | SUGGEST | EDIT`

**Justification:** Overview docs benefit from Claude keeping them current. EDIT + ALLOWED_AND_INFORM is safe for minor updates like corrected links, clearer descriptions.

---

#### 16. `app/README.md`
**Current:** READ | EDIT | Policy: ALLOWED_AND_INFORM | Priority: LOW

**Status:** ✅ **Already optimal for low-priority boilerplate**

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding
- ❌ SUGGEST: Implied by EDIT
- ✅ EDIT: Correct (can update setup docs)

---

#### 17. `docs/ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | Priority: MEDIUM

**Status:** ✅ **Already optimal**

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (analysis, not instructions)
- ✅ SUGGEST: Correct (can suggest additions/corrections)
- ❌ EDIT: Correct (requires explicit approval - human analysis)

**Justification:** Good balance. SUGGEST is safe, EDIT requires approval.

---

#### 18. `tests/RULES_VALIDATION_REPORT.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_WITH_HUMAN_PR_REVIEW | Priority: MEDIUM

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (report, not instructions)
- ✅ SUGGEST: Correct
- ❌ EDIT: **COULD ADD** - Could update report with new validations (PR review required)

**Recommendation:** `READ | SUGGEST | EDIT` (with ALLOWED_WITH_HUMAN_PR_REVIEW)

**Justification:** If Claude generates/updates validation reports, EDIT makes sense with PR review gate.

---

#### 19. `tests/RULES_VALIDATION_REPORT_HUMAN.md`
**Current:** READ | Policy: STRICTLY_DISALLOWED | Priority: LOW

**Status:** ✅ **Correct - human-only analysis**

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding
- ❌ SUGGEST: Correct to exclude (human's detailed work)
- ❌ EDIT: Correct to exclude (STRICTLY_DISALLOWED)

---

#### 20. `spec/COMMENT_HEADERS.md`
**Current:** READ | Policy: STRICTLY_DISALLOWED | Priority: CRITICAL

**Status:** ✅ **Correct - governance document**

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (it's metadata about other docs)
- ❌ SUGGEST: Excluded (governance stays human-controlled)
- ❌ EDIT: Correct (STRICTLY_DISALLOWED)

**Justification:** Governance system itself must not be Claude-modified. Prevents meta-loops and governance drift.

---

#### 21. `spec/DOCUMENT_REGISTRY.md`
**Current:** READ | SUGGEST | Policy: ALLOWED_AND_INFORM | Priority: MEDIUM

**Analysis:**
- ✅ READ: Required
- ❌ FOLLOW: Not binding (reference table)
- ✅ SUGGEST: Correct (can suggest registry improvements)
- ❌ EDIT: **COULD ADD** - Could update when docs change (ALLOWED_AND_INFORM)

**Recommendation:** `READ | SUGGEST | EDIT` (with ALLOWED_AND_INFORM)

**Justification:** Registry should stay current. Claude maintaining it with notification is low-risk.

---

## Summary of Recommended Changes

### Upgrade to READ | FOLLOW | SUGGEST (5 docs)
Rationale: These are **prescriptive specs** - Claude must follow them, not just read.

1. `spec/PRD_BUILD_SPEC.md` – Add FOLLOW
2. `spec/DATA_CONTRACTS.md` – Add FOLLOW
3. `spec/UI_BEHAVIOR.md` – Add FOLLOW
4. `spec/RULEBOOK_INDEX.md` – Add FOLLOW
5. `spec/EXAMPLES.md` – Add FOLLOW

### Upgrade to READ | SUGGEST (3 docs)
Rationale: These are **guidance docs** - suggestions improve them.

6. `prompts/WORKFLOW.md` – Add SUGGEST
7. `prompts/CHANGE_REQUEST_PROMPT.md` – Add SUGGEST
8. `CLAUDE.md` – Add SUGGEST

### Upgrade to READ | SUGGEST | EDIT (3 docs)
Rationale: These are **living docs** - Claude can help keep them current.

9. `README.md` – Add SUGGEST + EDIT
10. `tests/RULES_VALIDATION_REPORT.md` – Add EDIT
11. `spec/DOCUMENT_REGISTRY.md` – Add EDIT

### Optional Enhancement (1 doc)
**`spec/AUTHORITY.md`** – Could add SUGGEST (non-binding improvements to governance docs are safe)

---

## Candidates for ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL

| Document | Current Policy | Suggested Policy | Rationale |
|----------|----------------|------------------|-----------|
| `spec/RULEBOOK_INDEX.md` | ALLOWED_WITH_HUMAN_PR_REVIEW | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | Adding new rules is major decision. Explicit approval prevents surprises. |
| `spec/AUTHORITY.md` | STRICTLY_DISALLOWED | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | Hierarchy changes need explicit approval but shouldn't be completely forbidden. |
| `prompts/IMPLEMENTATION_CHECKLIST.md` | ALLOWED_AND_INFORM | ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL | Major phase restructuring should require approval (minor: ALLOWED_AND_INFORM). |

---

## Recommended Priority Updates

Several documents should have priority adjusted:

| Document | Current | Recommended | Reason |
|----------|---------|-------------|--------|
| `spec/AUTHORITY.md` | Not set | **CRITICAL** | Hierarchy affects ALL other docs |
| `spec/RULEBOOK_INDEX.md` | **HIGH** | ✅ Correct | Rules are core functionality |
| `spec/EXAMPLES.md` | **HIGH** | ✅ Correct | Test cases validate implementation |
| `spec/TERMINOLOGY.md` | **MEDIUM** | **HIGH** | Consistency is more important |

---

## Implementation Checklist

To apply these recommendations:

- [ ] Update 5 spec files: add FOLLOW permission
- [ ] Update 3 prompt files: add SUGGEST permission
- [ ] Update 3 living docs: add SUGGEST/EDIT permissions
- [ ] Consider 3 candidates for ALLOWED_AFTER_HUMAN_EXPLICIT_APPROVAL
- [ ] Update priority for AUTHORITY.md (→ CRITICAL)
- [ ] Update priority for TERMINOLOGY.md (→ HIGH)
- [ ] Regenerate DOCUMENT_REGISTRY.md with all changes
