## Quick Start (for Claude Code)
See `CLAUDE.md` for Claude Code-specific instructions and quick orientation.

## Source of Truth
The authoritative spec is: `spec/PRD_BUILD_SPEC.md`
For document hierarchy and conflict resolution, see: `spec/AUTHORITY.md`

## Canonical Reading Order
1. `CLAUDE.md` — Quick orientation
2. `spec/AUTHORITY.md` — Document hierarchy
3. `spec/PRD_BUILD_SPEC.md` — Primary requirements
4. `spec/DATA_CONTRACTS.md` — Data shapes, enums & invariants
5. `spec/UI_BEHAVIOR.md` — UI state & interactions
6. `spec/UI_STYLE_GUIDE.md` — UI design & style guide
7. `spec/RULEBOOK_INDEX.md` — Rule catalog
8. `spec/EXAMPLES.md` — Before/after test cases
9. `spec/TYPES.md` — TypeScript interfaces
10. `spec/TERMINOLOGY.md` — Standardized terms + glossary
11. `spec/DECISIONS.md` — Decision log (read-only)

# CSS Promptify (working name)

Modern CSS review tool + LLM context pack: configurable rulebook, selective safe fixes, LLM-friendly formatting, inline fix comments, and prompt export for complex refactors.

The app lets users paste CSS and get:
- errors / warnings / info based on a detailed rulebook
- selective safe fixes (user chooses what to apply)
- LLM-friendly formatting (structure-first, token-aware)
- optional inline comments showing what changed + old values
- one-click copy output with or without those comments
- LLM prompt export for tricky rules that shouldn’t be auto-fixed
- mobile-friendly UI

> v1: all rule settings are session-only (no saved project profiles yet).

---

## What's in this repo

This repo contains both:
1) **Spec / context pack** (source of truth)
2) **Implementation code** (to be added/updated over time)

**Source of truth:** `spec/PRD_BUILD_SPEC.md`

### Repository Structure
```
CSS-promptify/
├── CLAUDE.md                          # Claude Code instructions
├── README.md                          # This file
├── .gitignore                         # Git exclusions
│
├── PROMPT-KIT/                        # LLM guidance
│   ├── SYSTEM_PROMPT.md              # Working instructions
│   ├── CHANGE_REQUEST_PROMPT.md      # Change request template
│   ├── WORKFLOW.md                   # LLM workflow guide
│   └── IMPLEMENTATION_CHECKLIST.md   # Phased implementation guide
│
├── spec/                              # Authoritative specifications
│   ├── AUTHORITY.md                  # Document hierarchy
│   ├── PRD_BUILD_SPEC.md             # PRIMARY SOURCE OF TRUTH
│   ├── DATA_CONTRACTS.md             # Data shapes, enums & invariants
│   ├── UI_BEHAVIOR.md                # UI state & interactions
│   ├── RULEBOOK_INDEX.md             # Rule catalog (19 rules in v1)
│   ├── EXAMPLES.md                   # Before/after test cases
│   ├── TYPES.md                      # TypeScript interfaces
│   ├── PROPERTY_SORT_ORDER.md        # Property sorting spec
│   ├── TERMINOLOGY.md                # Standardized terms + glossary
│   ├── DECISIONS.md                  # Decision log (read-only)
│   └── test-cases.json               # Machine-readable tests
│
└── app/                               # React app (to be created)
```

---

## Key product principles (TL;DR)

- Modern CSS recognition: don’t flag new properties/functions as invalid.
- Explainability: show WHAT / WHY / WHEN SAFE for each rule.
- User control: fixes are opt-in and reversible.
- LLM formatting: structured output by default (not minified).
- Token reduction happens via explicit rules (tabs→spaces, shorthands, etc.).

---

## How to use the spec (for humans + LLMs)

### For Claude Code
Start with `CLAUDE.md` for quick orientation, then follow the canonical reading order above.

### For other LLMs
Feed files in order from `spec/AUTHORITY.md` (see "Canonical Reading Order").

### Conflict Resolution
If documents conflict, higher-ranked document wins. See `spec/AUTHORITY.md` for the full hierarchy.

### Before Implementation
All open questions have been decided. See `spec/DECISIONS.md` for the full decision log.

---

## Status

- ✅ Spec v1.2 complete
- ✅ Documentation and LLM guidance complete
- ✅ All open questions resolved (2026-01-30)
- ⏳ App scaffolding not created yet
- ⏳ Rule engine + UI implementation pending

See `PROMPT-KIT/IMPLEMENTATION_CHECKLIST.md` for phased implementation plan.

---

## Contributing / working agreements

- Keep `spec/` clean and stable.
- Don’t change requirement IDs lightly (FR-*, AC-*, C-*).
- If behavior changes, update the spec first.

---

## License

TBD
