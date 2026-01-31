<!--
STATUS: LLM workflow guide for humans
-->

# WORKFLOW — How to use the LLM with this repo

## Quick Start
For Claude Code, start with `CLAUDE.md` for orientation.

## Canonical read order
See `spec/AUTHORITY.md` for the full hierarchy. Summary:
1) CLAUDE.md (orientation)
2) spec/AUTHORITY.md (hierarchy)
3) spec/PRD_BUILD_SPEC.md (requirements)
4) spec/DATA_CONTRACTS.md (data shapes)
5) spec/UI_BEHAVIOR.md (UI spec)
6) spec/UI_STYLE_GUIDE.md 
7) spec/RULEBOOK_INDEX.md (rules)
8) spec/EXAMPLES.md (test cases)
9) spec/TYPES.md (TypeScript)
10) spec/TERMINOLOGY.md (terms)
11) spec/GLOSSARY.md (definitions)
12) spec/DECISIONS.md (read-only)
13) spec/OPEN_QUESTIONS.md (pending)

## Implementation phases
See `PROMPT-KIT/IMPLEMENTATION_CHECKLIST.md` for the full phased breakdown.

## How to ask (important)
Ask for ONE slice at a time. Examples:
- "Scaffold the React app (choose tooling) and explain why."
- "Implement the CSS parser + AST location extraction."
- "Implement the rule engine skeleton and one rule with a safe fix."
- "Implement recompute apply/revert using selected_fix_ids (deterministic order + conflicts)."
- "Implement the UI screens: Input / Fixes / Output, wired to mock data first."

## Before starting
Review `spec/OPEN_QUESTIONS.md` for decisions that may block your work.

## Definition of done for each slice
A slice is done when:
- It matches the spec + examples
- It uses types from `spec/TYPES.md`
- It uses terminology from `spec/TERMINOLOGY.md`
- It handles conflicts/determinism where relevant
- It doesn't introduce new scope beyond v1

## Change control
If you change behavior:
- Update spec/PRD_BUILD_SPEC.md first
- Update EXAMPLES.md to include a test-like example
- Update DECISIONS.md only by a human decision
- Verify consistency per `spec/AUTHORITY.md`
