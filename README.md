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

## What’s in this repo

This repo contains both:
1) **Spec / context pack** (source of truth)
2) **Implementation code** (to be added/updated over time)

**Source of truth:** `spec/PRD_BUILD_SPEC.md`

Recommended structure:
- `spec/` → authoritative requirements + rulebook docs (LLM-friendly)
- `app/` → React app (created later)
- `docs/` → optional screenshots/notes (non-authoritative)

---

## Key product principles (TL;DR)

- Modern CSS recognition: don’t flag new properties/functions as invalid.
- Explainability: show WHAT / WHY / WHEN SAFE for each rule.
- User control: fixes are opt-in and reversible.
- LLM formatting: structured output by default (not minified).
- Token reduction happens via explicit rules (tabs→spaces, shorthands, etc.).

---

## How to use the spec (for humans + LLMs)

If you’re using an LLM to help build this, feed files in this order:

1. `spec/PRD_BUILD_SPEC.md` (requirements + acceptance criteria)
2. `spec/GLOSSARY.md` (definitions / vocabulary)
3. `spec/DATA_CONTRACTS.md` (Issue/Fix objects + invariants)
4. `spec/RULEBOOK_INDEX.md` (rule list + applicability)
5. `spec/UI_BEHAVIOR.md` (UI state + interactions)
6. `spec/EXAMPLES.md` (before/after examples)

Treat `spec/PRD_BUILD_SPEC.md` as the authority if there are conflicts.

---

## Status

- ⏳ Spec v1.1 to be drafted
- ⏳ App scaffolding not created yet
- ⏳ Rule engine + UI implementation pending

---

## Contributing / working agreements

- Keep `spec/` clean and stable.
- Don’t change requirement IDs lightly (FR-*, AC-*, C-*).
- If behavior changes, update the spec first.

---

## License

TBD
