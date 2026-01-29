# Glossary

- **Rule**: Deterministic check on the CSS AST. Emits zero or more issues.
- **Issue**: Finding with severity (error/warning/info), rule_id, message, and location.
- **Fix**: Deterministic transformation that preserves semantics (safe) and is user-selectable.
- **Auto-fix**: A fix the tool can apply *only* when the user selects it.
- **Inline explanation comment**: Tool-added comment `/* cssreview: ... */` describing what changed and what the old value/property was.
- **Rule group**: Logical grouping of rules (modern/consolidation/format/tokens/safety/education).
- **Session config**: Rule toggles, severities, and parameters that reset on refresh (v1).
- **LLM prompt**: Copy-ready prompt generated for complex fixes that are not safe to automate.
``
