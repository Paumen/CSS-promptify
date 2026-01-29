# Data Contracts

## Issue object (canonical)
```json
{
  "rule_id": "format/property-per-line",
  "group": "format",
  "severity": "warning",
  "message": "Put each property on a new line.",
  "location": { "start": { "line": 10, "column": 1 }, "end": { "line": 10, "column": 60 } },
  "logic": {
    "what": "Multiple declarations detected on one line.",
    "why": "Improves LLM parsing and keeps structure predictable.",
    "when_safe": "Always safe; formatting only."
  },
  "fixable": true,
  "fix": { "kind": "patch", "preview": "..." }
}

