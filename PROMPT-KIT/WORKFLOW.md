<!--
STATUS: LLM workflow guide for humans
-->

# WORKFLOW — How to use the LLM with this repo

## Recommended read order (give the LLM these files first)
1) spec/PRD_BUILD_SPEC.md
2) spec/DATA_CONTRACTS.md
3) spec/UI_BEHAVIOR.md
4) spec/RULEBOOK_INDEX.md
5) spec/EXAMPLES.md
6) spec/GLOSSARY.md
7) spec/DECISIONS.md

## How to ask (important)
Ask for ONE slice at a time. Examples:
- “Scaffold the React app (choose tooling) and explain why.”
- “Implement the CSS parser + AST location extraction.”
- “Implement the rule engine skeleton and one rule with a safe fix.”
- “Implement recompute apply/revert using selected_fix_ids (deterministic order + conflicts).”
- “Implement the UI screens: Input / Fixes / Output, wired to mock data first.”

## Definition of done for each slice
A slice is done when:
- It matches the spec + examples
- It handles conflicts/determinism where relevant
- It doesn’t introduce new scope beyond v1

## Change control
If you change behavior:
- Update spec/PRD_BUILD_SPEC.md first
- Update EXAMPLES.md to include a test-like example
- Update DECISIONS.md only by a human decision
