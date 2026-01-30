<!--
STATUS: Authoritative reference for this topic
SOURCE OF TRUTH: If anything conflicts, spec/PRD_BUILD_SPEC.md wins
LLM_POLICY: You may READ this file. You may SUGGEST edits as a patch/diff, but do not rewrite silently. Human review required.
-->

# Glossary

- **Rule**: Deterministic check on the CSS AST. Emits zero or more issues.
- **Issue**: Finding with severity (error/warning/info), rule_id, message, and location.
- **Fix**: Deterministic transformation that preserves semantics (safe) and is user-selectable.
- **Auto-fix**: A fix the tool can apply *only* when the user selects it.
- **Inline explanation comment**: Tool-added comment `/* cssreview: ... */` describing what changed and what the old value/property was.
- **Rule group**: Logical grouping of rules (modern/consolidation/format/tokens/safety/education).
- **Session config**: Rule toggles, severities, and parameters that reset on refresh (v1).
- **LLM prompt**: Copy-ready prompt generated for complex fixes that are not safe to automate.
- **Selected fix**: A fix the user has chosen to include in the output (via checkbox or equivalent action).
- **Recompute**: The process of regenerating output CSS from original input + currently selected fixes.
- **Conflict**: When two fixes modify overlapping ranges; must be handled deterministically.
