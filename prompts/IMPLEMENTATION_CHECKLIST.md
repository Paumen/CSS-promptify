<!--
CLAUDE_PERMISSIONS: READ | FOLLOW | SUGGEST | EDIT
CLAUDE_UPDATE_POLICY: ALLOWED_AND_INFORM
PURPOSE: Instructions
AUTHORITY: None
IF_CONFLICT: request HUMAN if unclear
IF_OUTDATED: Flag human
PRIORITY: HIGH
-->

# Implementation Checklist

This document breaks down CSS Promptify implementation into phases and slices.
Complete each phase before moving to the next.

---

## Implementation Status Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 0: Project Setup | ✅ Complete | 100% |
| Phase 1: Core Engine | ✅ Complete | 100% (21 rules implemented) |
| Phase 2: Fix Application Engine | ✅ Complete | 100% |
| Phase 3: UI Implementation |  🔄 In Progress | ~85% |
| Phase 4: Testing & Polish | 🔄 In Progress | ~40% |
| Phase 5: Future (v2) | ⏳ Not Started | 0% |

**v1.0 Release Status:** Core functionality complete. Syntax highlighting added. Testing and polish remaining.

---

## Phase 0: Project Setup

### 0.1 Repository Setup
- [x] Create spec documents
- [x] Create CLAUDE.md
- [x] Create AUTHORITY.md
- [x] Create supporting docs (TYPES.md, TERMINOLOGY.md, etc.)
- [x] All open questions resolved (see spec/DECISIONS.md)

### 0.2 Application Scaffolding
- [x] Initialize React + TypeScript project (Vite)
- [x] Configure TypeScript with strict mode
- [x] Set up ESLint
- [x] Add basic folder structure:
- [x] Copy TypeScript types from spec/TYPES.md
- [x] Verify build works

---

## Phase 1: Core Engine (No UI)

### 1.1 CSS Parser Integration
- [x] Research CSS parsers (css-tree, postcss, lightningcss)
- [x] Choose parser with best modern CSS support (css-tree)
- [x] Create parser wrapper with location tracking
- [x] Implement AST traversal utilities
- [x] Handle parse errors gracefully
- [x] Write parser tests

### 1.2 Rule Engine Skeleton
- [x] Implement Rule interface from TYPES.md
- [x] Create RuleRunner that executes rules on AST
- [x] Implement rule registration system
- [x] Add session config handling (enabled/disabled, severity override)
- [x] Write rule engine tests

### 1.3 Safety Rules (Tier 1 + Tier 2)
- [x] Implement `safety/invalid-syntax` (parse error reporting)
- [x] Implement `safety/unrecognized-property` (info-only)
- [x] Implement `safety/misspelled-property` (Tier 2, prompt fix)
- [x] Implement `safety/typo-suspicious-units-and-tokens` (Tier 2)
- [x] Verify invariant: unrecognized properties = info only
- [x] Write tests matching spec/EXAMPLES.md

### 1.4 Format Rules (Safe Fixes)
- [x] Implement `format/no-tabs` (tabs → 2 spaces)
- [x] Implement `format/indent-2-spaces`
- [x] Implement `format/multiple-declarations-per-line`
- [x] Implement `format/single-prop-single-line`
- [x] Implement `format/normalize-spaces`
- [x] Implement `format/sort-properties`
- [x] Implement `format/one-selector-per-line`
- [x] All fixes must be deterministic
- [x] Write tests matching spec/EXAMPLES.md

### 1.5 Token Rules (Safe Fixes)
- [x] Implement `tokens/zero-units` (0px → 0)
- [x] Implement `tokens/shorten-hex-colors` (#ffffff → #fff)
- [x] Implement `tokens/remove-trailing-zeros` (1.0 → 1)
- [x] Write tests matching spec/EXAMPLES.md


### 1.6 Consolidation Rules (Safe Fixes)
- [x] Implement `consolidate/shorthand-margin-padding`
- [x] Implement `consolidate/deduplicate-last-wins`
- [x] Write tests matching spec/EXAMPLES.md

### 1.7 Modern CSS Rules (Tier 2)
- [x] Implement `modern/prefer-hex-colors` (fixability: safe)
- [x] Write tests

### 1.8 Education Rules (Tier 1)
- [x] Implement `style/important-used` (info-only)
- [x] Implement `layout/flex-properties-require-flex` (info-only)
- [x] Implement `layout/grid-properties-require-grid` (info-only)
- [x] Write tests

### 1.9 Rule Count Verification (PRD §7.1)
- [x] Verify at least 15 rules implemented for v1 (current: 21 rules)
- [x] Verify Tier 1 (14 rules) + Tier 2 (5 rules) = 19 required, 21 implemented

---

## Phase 2: Fix Application Engine

### 2.1 Patch Application
- [x] Implement `replace_range` patch operation
- [x] Implement deterministic sort order (position → rule_id → fix.id)
- [x] Handle multi-patch fixes correctly
- [x] Write patch application tests

### 2.2 Recompute Model (PRD FR-FIX-04)
- [x] Implement `apply(selected_fix_ids, original_css, comments_enabled)`
- [x] Verify determinism: same inputs = same output
- [x] Support comments ON/OFF toggle
- [x] Output updates immediately on fix selection (Variant A per DECISIONS.md)
- [x] Write recompute tests

### 2.3 Conflict Detection
- [x] Detect overlapping ranges between fixes
- [x] Implement conflict handling (Option A: prevent selecting both)
- [x] Generate user-visible conflict messages
- [x] Write conflict tests

### 2.4 Comment Handling (PRD FR-COMMENT-01 to FR-COMMENT-06)
- [x] Implement tool comment insertion (`/* cssreview: ... */`)
- [x] Comments max ~40 characters with old value reference (FR-COMMENT-04)
- [x] Implement tool comment removal (preserve user comments)
- [x] Verify idempotency of remove operation
- [x] Write comment handling tests

### 2.5 Statistics (PRD FR-STAT-01, FR-STAT-02)
- [x] Implement token count estimation (chars ÷ 4 heuristic per DECISIONS.md)
- [x] Implement line count
- [x] Implement character count
- [x] Generate before/after comparison
- [x] Stats update live after selecting/unselecting fixes (AC-12)
- [x] Write stats tests

---

## Phase 3: UI Implementation

### 3.1 State Management (Zustand)
- [x] Implement SessionState (original_css, selected_fix_ids, comments_enabled)
- [x] Implement SessionConfig (rule settings per rule and per group)
- [x] Add state persistence (session-only, reset on refresh per FR-RCONF-05)
- [x] Connect to engine (analyzeInput, toggleFix, etc.)

### 3.2 Input View (InputPanel)
- [x] Create CSS input textarea
- [x] Add "Analyze" button
- [x] Show parse errors gracefully
- [x] Character count display
- [x] Ctrl+Enter keyboard shortcut for analysis
- [x] Mobile-friendly design
- [x] Syntax-highlighted preview toggle (after analysis)

### 3.3 Output View (OutputPanel)
- [x] Create CSS output display (read-only CodeBlock)
- [x] Add syntax highlighting with modern CSS support
  - [x] Custom CSS tokenizer supporting modern features (@layer, @container, light-dark(), is(), has(), etc.)
  - [x] Modern units support (cqi, dvh, fr, svw, lvh, etc.)
  - [x] Line numbers (not copied with output)
  - [x] Nesting depth colors for braces (6 levels)
  - [ ] Tool comments vs user comments differentiation
  - [x] Severity highlighting for issue locations (fill color line number)
  - [x] Toggle color matches tool comment syntax color
  - [x] Colors defined as CSS custom properties for easy adjustment
- [x] Show before/after stats in header

### 3.4 Issues Panel (IssuesPanel)
- [ ] List issues grouped by severity (grouping not yet fully working)
- [x] Show counts per severity (badges)
- [ ] Implement filters (severity, group, fixability, search) per FR-ISSUE-02
- [x] Make issues clickable
- [x] Show location (line/column) for each issue

### 3.5 Issue Detail (Expandable in IssuesPanel)
- [x] Show rule_id, group, severity
- [x] Show message
- [x] Show rule logic (WHAT / WHY / WHEN SAFE) per FR-ISSUE-03
- [x] Show fix preview for safe fixes
- [ ] Show "Copy LLM prompt" for prompt fixes (v2 enhancement)

### 3.6 Fix Selection (PRD FR-FIX-01, FR-FIX-02)
- [x] Add checkboxes for fix selection (user control, never auto-apply)
- [x] Support issue-level selection
- [ ] Support rule-level batch selection
- [ ] Support group-level batch selection
- [x] Support severity-level batch selection (FR-FIX-02)
- [x] Implement immediate update (Variant A per DECISIONS.md)
- [x] Select all / Unselect all controls

### 3.7 Selected Fixes Tracking
- [x] Track selected fixes in state
- [x] Allow unselecting (revert) per FR-FIX-04
- [x] Maintain deterministic order
- [ ] Show conflicts if any (prevent conflicting selection)

### 3.8 Copy & Export Controls (PRD FR-OUT-01, FR-OUT-02)
- [x] "Copy output (no comments)" button
- [x] "Copy output (with comments)" button
- [x] Copy shows confirmation toast/snackbar (FR-OUT-02)
- [ ] Comment toggle switch (comments not yet showing)
- [ ] "Reset" button to clear session

### 3.9 Settings View (SettingsPanel Modal)
- [x] Rule toggles grouped by category (FR-RCONF-01)
- [x] Severity cycle (off → info → warning → error → off) per FR-RCONF-03
- [ ] Group-level toggles (FR-RCONF-04)
- [x] Rule count per group displayed
- [x] Session-only (no persistence) per FR-RCONF-05

### 3.10 Mobile Optimization (PRD AC-13)
- [x] Responsive panel layout
- [x] Large tap targets for checkboxes/buttons
- [x] Horizontal scroll for code blocks
- [x] Accessible copy buttons

---

## Phase 4: Testing & Polish

### 4.1 Integration Tests
- [x] Set up Vitest + React Testing Library
- [x] Rule unit tests (rules.test.ts)
- [x] Type validation tests (types/index.test.ts)
- [ ] Run all test-cases.json through engine
- [ ] Verify outputs match expected
- [ ] Test all invariants (CLAUDE.md §Critical Invariants)

### 4.2 UI Testing
- [ ] Test full user flow: paste → analyze → select → copy
- [ ] Test revert flow (AC-06, AC-07, AC-08)
- [ ] Test comment toggle (AC-09, AC-10, AC-11)
- [ ] Test mobile layout (AC-13)

### 4.3 Edge Cases
- [ ] Empty input
- [ ] Very large input (performance, 100KB limit per DECISIONS.md)
- [ ] All fixes selected
- [ ] No issues found
- [ ] Parse errors with partial fixes

### 4.4 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (UI_STYLE_GUIDE.md)

### 4.5 Documentation
- [x] App README created
- [ ] Update README with usage instructions
- [ ] Add screenshots
- [ ] Document deployment

---

## Phase 5: Future (v2) - not yet complete

### 5.1 Saved Settings across sessions
- [ ] Profile persistence
- [ ] Preset profiles

---

## Definition of Done (per slice)

A slice is complete when:
- [ ] Implementation matches spec
- [ ] Tests pass
- [ ] Determinism verified
- [ ] No new scope added
- [ ] Code reviewed

---

## Working with This Checklist

1. **Pick one slice** from the current phase
2. **Read relevant spec sections** (PRD, DATA_CONTRACTS, EXAMPLES)
3. **Implement** matching the spec exactly
4. **Test** against examples
5. **Mark complete** and move to next slice

---

## PRD Alignment Notes

This checklist aligns with `spec/PRD_BUILD_SPEC.md` v1. Key requirements mapped:

| PRD Section | Checklist Coverage |
|-------------|-------------------|
| FR-IN-01 to FR-IN-04 | Phase 3.2 (Input View) |
| FR-PARSE-01, FR-PARSE-02 | Phase 1.1 (Parser) |
| FR-RULE-01, FR-RULE-02 | Phase 1.2 (Rule Engine) |
| FR-RCONF-01 to FR-RCONF-05 | Phase 3.9 (Settings) |
| FR-FIX-01 to FR-FIX-05 | Phase 2.2, 3.6, 3.7 |
| FR-COMMENT-01 to FR-COMMENT-06 | Phase 2.4 |
| FR-OUT-01, FR-OUT-02 | Phase 3.8 |
| FR-ISSUE-01 to FR-ISSUE-04 | Phase 3.4, 3.5 |
| FR-LLMP-01 to FR-LLMP-03 | Phase 3.5 (v2 scope) |
| FR-STAT-01, FR-STAT-02 | Phase 2.5 |
| AC-01 to AC-13 | Phase 4 (Testing) |

---

END
