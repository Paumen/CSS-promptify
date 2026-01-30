<!--
STATUS: Implementation guide for phased development
LLM_POLICY: Follow phases in order. Complete each phase before moving to next.
-->

# Implementation Checklist

This document breaks down CSS Promptify implementation into phases and slices.
Complete each phase before moving to the next.

---

## Phase 0: Project Setup

### 0.1 Repository Setup
- [x] Create spec documents
- [x] Create CLAUDE.md
- [x] Create AUTHORITY.md
- [x] Create supporting docs (TYPES.md, TERMINOLOGY.md, etc.)
- [ ] Review and resolve OPEN_QUESTIONS.md

### 0.2 Application Scaffolding
- [ ] Initialize React + TypeScript project (Vite recommended)
- [ ] Configure TypeScript with strict mode
- [ ] Set up ESLint + Prettier
- [ ] Add basic folder structure:
  ```
  app/
  ├── src/
  │   ├── types/        # From spec/TYPES.md
  │   ├── parser/       # CSS parsing
  │   ├── rules/        # Rule implementations
  │   ├── engine/       # Analysis engine
  │   ├── state/        # Session state management
  │   └── ui/           # React components
  ├── package.json
  └── vite.config.ts
  ```
- [ ] Copy TypeScript types from spec/TYPES.md
- [ ] Verify build works

---

## Phase 1: Core Engine (No UI)

### 1.1 CSS Parser Integration
- [ ] Research CSS parsers (css-tree, postcss, lightningcss)
- [ ] Choose parser with best modern CSS support
- [ ] Create parser wrapper with location tracking
- [ ] Implement AST traversal utilities
- [ ] Handle parse errors gracefully
- [ ] Write parser tests

### 1.2 Rule Engine Skeleton
- [ ] Implement Rule interface from TYPES.md
- [ ] Create RuleRunner that executes rules on AST
- [ ] Implement rule registration system
- [ ] Add session config handling (enabled/disabled, severity override)
- [ ] Write rule engine tests

### 1.3 First Rules (Safety Group)
- [ ] Implement `safety/invalid-syntax` (parse error reporting)
- [ ] Implement `safety/unrecognized-property` (info-only)
- [ ] Verify invariant: unrecognized properties = info only
- [ ] Write tests matching spec/EXAMPLES.md

### 1.4 Format Rules (Safe Fixes)
- [ ] Implement `format/no-tabs` (tabs → 2 spaces)
- [ ] Implement `format/indent-2-spaces`
- [ ] Implement `format/property-per-line`
- [ ] Implement `format/single-prop-single-line`
- [ ] Implement `format/normalize-spaces`
- [ ] Implement `format/sort-properties` (use PROPERTY_SORT_ORDER.md)
- [ ] All fixes must be deterministic
- [ ] Write tests matching spec/EXAMPLES.md

### 1.5 Token Rules (Safe Fixes)
- [ ] Implement `tokens/zero-units` (0px → 0)
- [ ] Implement `tokens/shorten-hex-colors` (#ffffff → #fff)
- [ ] Implement `tokens/remove-redundant-whitespace`
- [ ] Write tests matching spec/EXAMPLES.md

### 1.6 Consolidation Rules (Safe Fixes)
- [ ] Implement `consolidation/shorthand-margin-padding`
- [ ] Implement `consolidation/deduplicate-last-wins`
- [ ] Implement `consolidation/merge-adjacent-identical-selectors`
- [ ] Write tests matching spec/EXAMPLES.md

### 1.7 Modern CSS Rules (Prompt-Based)
- [ ] Implement `modern/suggest-place-properties` (fixability: prompt)
- [ ] Implement `modern/container-queries-guidance` (fixability: none)
- [ ] Implement `modern/light-dark-guidance` (fixability: none)
- [ ] Implement `modern/suggest-logical-properties` (fixability: prompt)
- [ ] Generate LLM prompts per DATA_CONTRACTS spec
- [ ] Write tests

---

## Phase 2: Fix Application Engine

### 2.1 Patch Application
- [ ] Implement `replace_range` patch operation
- [ ] Implement deterministic sort order (position → rule_id → fix.id)
- [ ] Handle multi-patch fixes correctly
- [ ] Write patch application tests

### 2.2 Recompute Model
- [ ] Implement `apply(selected_fix_ids, original_css, comments_enabled)`
- [ ] Verify determinism: same inputs = same output
- [ ] Support comments ON/OFF toggle
- [ ] Write recompute tests

### 2.3 Conflict Detection
- [ ] Detect overlapping ranges between fixes
- [ ] Implement conflict handling (Option A: prevent selecting both)
- [ ] Generate user-visible conflict messages
- [ ] Write conflict tests

### 2.4 Comment Handling
- [ ] Implement tool comment insertion (`/* cssreview: ... */`)
- [ ] Implement tool comment removal (preserve user comments)
- [ ] Verify idempotency of remove operation
- [ ] Write comment handling tests

### 2.5 Statistics
- [ ] Implement token count estimation
- [ ] Implement line count
- [ ] Implement character count
- [ ] Generate before/after comparison
- [ ] Write stats tests

---

## Phase 3: UI Implementation

### 3.1 State Management
- [ ] Implement SessionState (original_css, selected_fix_ids, comments_enabled)
- [ ] Implement SessionConfig (rule settings)
- [ ] Add state persistence (session-only, reset on refresh)
- [ ] Connect to engine

### 3.2 Input View
- [ ] Create CSS input textarea
- [ ] Add "Analyze" button
- [ ] Show parse errors gracefully
- [ ] Mobile-friendly design

### 3.3 Output View
- [ ] Create CSS output display (read-only)
- [ ] Add syntax highlighting (best-effort)
- [ ] Add line numbers (best-effort)
- [ ] Show before/after stats

### 3.4 Issues Panel
- [ ] List issues grouped by severity
- [ ] Show counts per severity
- [ ] Implement filters (severity, group, fixability, search)
- [ ] Make issues clickable
- [ ] Highlight selected issue location in code

### 3.5 Issue Detail Panel
- [ ] Show rule_id, group, severity
- [ ] Show message
- [ ] Show rule logic (WHAT / WHY / WHEN SAFE)
- [ ] Show fix preview for safe fixes
- [ ] Show "Copy LLM prompt" for prompt fixes

### 3.6 Fix Selection
- [ ] Add checkboxes for fix selection
- [ ] Support issue-level selection
- [ ] Support rule-level batch selection
- [ ] Support group-level batch selection
- [ ] Implement immediate update (Variant A) or commit button (Variant B)

### 3.7 Selected Fixes Panel
- [ ] List selected fixes
- [ ] Allow unselecting (revert)
- [ ] Show deterministic order
- [ ] Show conflicts if any

### 3.8 Copy & Export Controls
- [ ] "Copy output (no comments)" button
- [ ] "Copy output (with comments)" button
- [ ] "Copy LLM prompt" button (when available)
- [ ] "Remove tool comments" button
- [ ] "Reset to original" button

### 3.9 Settings View
- [ ] Rule toggles grouped by category
- [ ] Severity cycle (off → info → warning → error → off)
- [ ] Group-level toggles
- [ ] Session-only (no persistence)

### 3.10 Mobile Optimization
- [ ] Tab/screen navigation (Input / Fixes / Output / Settings)
- [ ] Large tap targets
- [ ] Horizontal scroll for code
- [ ] Accessible copy buttons

---

## Phase 4: Testing & Polish

### 4.1 Integration Tests
- [ ] Run all test-cases.json through engine
- [ ] Verify outputs match expected
- [ ] Test all invariants

### 4.2 UI Testing
- [ ] Test full user flow: paste → analyze → select → copy
- [ ] Test revert flow
- [ ] Test comment toggle
- [ ] Test mobile layout

### 4.3 Edge Cases
- [ ] Empty input
- [ ] Very large input (performance)
- [ ] All fixes selected
- [ ] No issues found
- [ ] Parse errors with partial fixes

### 4.4 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast

### 4.5 Documentation
- [ ] Update README with usage instructions
- [ ] Add screenshots
- [ ] Document deployment

---

## Phase 5: Future (v1.1+)

### 5.1 CLI Support (v1.1)
- [ ] CLI wrapper for engine
- [ ] JSON output format
- [ ] CI integration guide

### 5.2 Saved Profiles (v2)
- [ ] Profile persistence
- [ ] Import/export configs
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

END
