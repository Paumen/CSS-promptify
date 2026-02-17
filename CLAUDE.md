<!--
CLAUDE_PERMISSIONS: READ | FOLLOW | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_AND_INFORM
PURPOSE: Instructions
AUTHORITY: None
IF_CONFLICT: These take precedence in Claude Code sessions
IF_OUTDATED: Flag human
PRIORITY: CRITICAL
-->

# Claude Code Instructions

This file provides quick-start guidance for Claude Code and other llm agents when working on this repository.

## Project Overview

**CSS Promptify** is a modern CSS review tool that:
- Analyzes pasted CSS and reports issues (error/warning/info)
- Offers selective, user-controlled safe fixes
- Generates LLM-friendly formatted output
- Supports optional inline explanation comments
- Exports LLM prompts for complex refactors

## Quick Start Reading Order
The canonical reading order for the project is defined in `spec/AUTHORITY.md`. For the quickest orientation, start with this file (`CLAUDE.md`) and then follow the order specified in `spec/AUTHORITY.md`.

## Commands (when implementation exists)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CSS Promptify v1                        │
├─────────────────────────────────────────────────────────────┤
│  User Flow: paste → analyze → select fixes → copy output    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Parser    │───▶│ Rule Engine │───▶│   Output    │     │
│  │ (CSS → AST) │    │ (19 rules)  │    │  Generator  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            │                   │            │
│                            ▼                   ▼            │
│                     ┌─────────────┐    ┌─────────────┐     │
│                     │   Issues    │    │ Output CSS  │     │
│                     │   + Fixes   │    │ + Comments  │     │
│                     └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Critical Invariants (MUST follow)

> **Canonical source:** `spec/DATA_CONTRACTS.md` §6

These invariants must NEVER be violated. If a request would violate any, refuse and explain which one.

1. **Determinism**: Same input + config + selected fixes = same output, always
2. **Safety**: Safe fixes MUST preserve selector specificity, rule order, computed values
3. **User Control**: No auto-apply; user explicitly selects fixes; revert always possible
4. **Tool Comments Only**: "Remove tool comments" removes only `cssreview:` comments, never user comments
5. **Modern CSS**: Unrecognized properties = info only, never block other fixes

## Key Constraints (v1)

- **No code editing**: paste → analyze → select → copy (no live editing)
- **Session-only config**: Settings reset on refresh
- **Recompute model**: Output = apply(selected_fix_ids, original_css, comments_enabled)
- **Comment marker**: All tool comments use prefix `cssreview:`
- **Mobile-friendly**: UI must work on mobile devices

## File Structure

```
CSS-promptify/
├── CLAUDE.md                          # This file (Claude Code instructions)
├── README.md                          # Project overview
├── .gitignore                         # Git exclusions
│
├── prompts/                           # LLM guidance
│   ├── SYSTEM_PROMPT.md              # Working instructions
│   ├── CHANGE_REQUEST_PROMPT.md      # Change request template
│   ├── WORKFLOW.md                   # LLM workflow guide
│   └── IMPLEMENTATION_CHECKLIST.md   # Implementation phases
│
├── spec/                              # Authoritative specifications
│   ├── AUTHORITY.md                  # Document hierarchy
│   ├── PRD_BUILD_SPEC.md             # PRIMARY SOURCE OF TRUTH
│   ├── DATA_CONTRACTS.md             # Data shapes, enums, invariants (single source)
│   ├── UI_BEHAVIOR.md                # UI state & interactions
│   ├── UI_STYLE_GUIDE.md             # UI design & style guide
│   ├── RULEBOOK_INDEX.md             # Rule catalog (19 rules in v1)
│   ├── EXAMPLES.md                   # Before/after test cases
│   ├── TYPES.md                      # TypeScript interfaces (single source)
│   ├── TERMINOLOGY.md                # Standardized terms + glossary
│   ├── DECISIONS.md                  # Decision log (read-only)
│   └── test-cases.json               # Machine-readable tests
│
├── docs/                              # Documentation and analysis
│   └── ROOT_CAUSE_ANALYSIS_AND_ACTION_PLAN.md
│
├── scripts/                           # Utility scripts
│   └── generate-examples-md.js
│
├── tests/                             # Test resources and validation
│   ├── RULES_VALIDATION_REPORT.md
│   ├── RULES_VALIDATION_REPORT_HUMAN.md
│   └── test-all-rules.css
│
├── test.prompt.yml                    # Prompt testing configuration
│
└── app/                               # React app (to be created)
    ├── src/
    │   ├── parser/                   # CSS parsing
    │   ├── rules/                    # Rule implementations
    │   ├── engine/                   # Analysis engine
    │   ├── ui/                       # React components
    │   └── types/                    # TypeScript types
    └── package.json
```

## Working with This Repo

### When implementing features:
1. Check `spec/AUTHORITY.md` for document hierarchy
2. Read relevant spec sections
3. Match data shapes from `spec/DATA_CONTRACTS.md` and `spec/TYPES.md`
4. Validate against `spec/EXAMPLES.md`
5. Follow invariants strictly

### When proposing changes:
1. Use `prompts/CHANGE_REQUEST_PROMPT.md` template
2. Update specs BEFORE implementation
3. Add/update examples in `spec/EXAMPLES.md`
4. Never modify `spec/DECISIONS.md` (human-only)

### Common tasks:
- **Add a rule**: Update `RULEBOOK_INDEX.md` → add example in `EXAMPLES.md` → implement
- **Fix a bug**: Check which spec defines the behavior → fix to match spec
- **Change behavior**: Update spec first → then implementation

## Tech Stack (Confirmed)

- **Framework**: React 18+ with TypeScript
- **Build**: Vite
- **CSS Parser**: css-tree (detailed AST, location tracking, modern CSS support)
- **State**: Zustand
- **Styling**: Plain CSS  
- **Testing**: Vitest + React Testing Library

## Key Decisions

See `spec/DECISIONS.md` for full decision log.

## Contact

Report issues: Check the spec first, then ask human for clarification if behavior is ambiguous.
