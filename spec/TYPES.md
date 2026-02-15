<!--
CLAUDE_PERMISSIONS: READ | FOLLOW | SUGGEST
CLAUDE_UPDATE_POLICY: ALLOWED_WITH_HUMAN_PR_REVIEW
PURPOSE: Authoritative Reference
AUTHORITY: spec/DATA_CONTRACTS.md
IF_CONFLICT: Defer to spec/DATA_CONTRACTS.md
IF_OUTDATED: Flag human
PRIORITY: HIGH
-->

# TypeScript Types

This file provides TypeScript interfaces matching the canonical data contracts.
Use these types for type-safe implementation.

> **This is the single source of truth for TypeScript type definitions.**
> Enum values are defined in `spec/DATA_CONTRACTS.md` §1.
> Other documents should reference this file for TypeScript types.

---

## Enums

```typescript
/**
 * Fix availability for an issue
 * - safe (auto): deterministic fix exists and can be applied automatically once selected
 * - safe (force user to choose): safe fix exists but requires a user choice or session config before applying
 * - prompt: guidance / copy-ready LLM prompt (not safe to auto-fix)
 * - none: no fix available
 */
export type Fixability =
  | 'safe (auto)'
  | 'safe (force user to choose)'
  | 'prompt'
  | 'none';

/**
 * Rule-level default fix offering (what the UI should offer by default)
 */
export type DefaultFixability = Fixability;

/**
 * Rule-level max fix offering (caps what the tool is allowed to do)
 */
export type MaxFixability = Fixability;

/**
 * Patch operation types (v1 supports replace_range only)
 */
export type PatchOp = 'replace_range';

/**
 * Property sort mode
 */
export type SortMode = 'grouped' | 'alphabetical';
```

---

## Location Types

```typescript
/**
 * Position in source code (1-based)
 */
export interface Position {
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
}

/**
 * Range in source code
 * start is inclusive, end is exclusive
 */
export interface Range {
  start: Position;
  end: Position;
}
```

---

## Issue Types

```typescript
/**
 * Rule logic explanation (WHAT / WHY / WHEN SAFE)
 */
export interface RuleLogic {
  /** What was detected */
  what: string;
  /** Why it matters */
  why: string;
  /** When the fix is safe to apply */
  when_safe: string;
}

/**
 * Comment configuration for a fix
 */
export interface CommentConfig {
  /** Whether UI has comments enabled */
  enabled_by_ui: boolean;
  /** Comment style (v1: end_of_line only) */
  style: 'end_of_line';
  /** The comment text to insert */
  text: string;
}

/**
 * A single patch operation
 */
export interface Patch {
  /** Operation type */
  op: PatchOp;
  /** Range to replace */
  range: Range;
  /** Replacement text */
  text: string;
}

/**
 * A fix that can be applied to resolve an issue
 */
export interface Fix {
  /** Unique fix identifier */
  id: string;
  /** Fix kind (v1: patch_set only) */
  kind: 'patch_set';
  /** Preview of the fixed code */
  preview: string;
  /** Patches to apply */
  patches: Patch[];
  /** Comment to insert with fix */
  comment: CommentConfig;
}

/**
 * LLM prompt for non-automatable fixes
 */
export interface LLMPrompt {
  /** Unique prompt identifier */
  id: string;
  /** Short title for UI display */
  title: string;
  /** Prompt format (v1: text only) */
  format: 'text';
  /** Copy-ready prompt text */
  copy_text: string;
}

/**
 * An issue found during CSS analysis
 */
export interface Issue {
  /** Unique issue identifier */
  id: string;
  /** Rule that generated this issue */
  rule_id: string;
  /** Rule group */
  group: RuleGroup;
  /** Issue severity */
  severity: Severity;
  /** Human-readable message */
  message: string;
  /** Location in source CSS */
  location: Range;
  /** Rule logic explanation */
  logic: RuleLogic;
  /** Fix availability for this issue */
  fixability: Fixability;
  /** Fix object (present if fixability starts with 'safe') */
  fix?: Fix;
  /** LLM prompt (present if fixability === 'prompt') */
  llm_prompt?: LLMPrompt;
}
```

---

## Session State Types

```typescript
/**
 * Applied fix record for tracking
 */
export interface AppliedFix {
  /** Fix identifier */
  fix_id: string;
  /** Rule that generated the fix */
  rule_id: string;
  /** Patches that were applied */
  patches: Patch[];
  /** Comment metadata */
  comment: {
    was_inserted: boolean;
    marker_prefix: 'review:';
    style: 'end_of_line';
  };
}

/**
 * Session state (reset on refresh in v1)
 */
export interface SessionState {
  /** Original CSS input (never mutated) */
  original_css: string;
  /** IDs of currently selected fixes */
  selected_fix_ids: string[];
  /** Whether inline comments are enabled */
  comments_enabled: boolean;
}

/**
 * Session configuration (rule settings)
 */
export interface SessionConfig {
  /** Per-rule overrides: rule_id -> enabled/severity */
  rules: Record<string, RuleConfig>;
  /** Per-group overrides */
  groups: Record<RuleGroup, GroupConfig>;
}

/**
 * Configuration for a single rule
 */
export interface RuleConfig {
  /** Whether rule is enabled */
  enabled: boolean;
  /** Severity override (null = use default) */
  severity: Severity | null;
}

/**
 * Configuration for a rule group
 */
export interface GroupConfig {
  /** Whether entire group is enabled */
  enabled: boolean;
  /** Severity for all rules in group (null = use per-rule) */
  severity: Severity | null;
}
```

---

## Analysis Types

```typescript
/**
 * Analysis result from running rules on CSS
 */
export interface AnalysisResult {
  /** All issues found */
  issues: Issue[];
  /** Statistics */
  stats: Stats;
  /** Whether parsing succeeded */
  parse_success: boolean;
  /** Parse errors (if any) */
  parse_errors: ParseError[];
}

/**
 * Statistics for before/after comparison
 */
export interface Stats {
  /** Token count estimate */
  tokens: number;
  /** Line count */
  lines: number;
  /** Character count */
  characters: number;
}

/**
 * Before/after statistics
 */
export interface StatsComparison {
  before: Stats;
  after: Stats;
}

/**
 * CSS parse error
 */
export interface ParseError {
  message: string;
  location: Position;
}
```

---

## Rule Types

```typescript
/**
 * Rule metadata (from RULEBOOK_INDEX)
 */
export interface RuleMeta {
  /** Unique rule identifier (e.g., "format/no-tabs") */
  rule_id: string;
  /** Rule group */
  group: RuleGroup;
  /** Default severity */
  severity: Severity;
  /** Default fixability (rule-level) */
  default_fixability: DefaultFixability;
  /** Max fixability (rule-level) */
  max_fixability: MaxFixability;
  /** Whether enabled by default */
  enabled_by_default: boolean;
  /** What this rule applies to */
  applies_to: string;
  /** Optional parameters */
  params?: Record<string, unknown>;
  /** Autofix notes */
  autofix_notes?: string;
}

/**
 * Rule implementation interface
 */
export interface Rule {
  /** Rule metadata */
  meta: RuleMeta;
  /**
   * Run the rule on CSS AST
   * @param ast - Parsed CSS AST
   * @param config - Session configuration
   * @returns Array of issues found
   */
  run(ast: CSSNode, config: SessionConfig): Issue[];
}
```

---

## Output Types

```typescript
/**
 * Output generation options
 */
export interface OutputOptions {
  /** Include tool comments */
  include_comments: boolean;
}

/**
 * Generated output
 */
export interface Output {
  /** Output CSS */
  css: string;
  /** Statistics comparison */
  stats: StatsComparison;
}

/**
 * Conflict between two fixes
 */
export interface FixConflict {
  /** First fix ID */
  fix_a: string;
  /** Second fix ID */
  fix_b: string;
  /** Overlapping range */
  overlapping_range: Range;
  /** Human-readable message */
  message: string;
}
```

---

## CSS AST Types (placeholder)

```typescript
/**
 * CSS AST node (implementation-specific)
 * Actual type depends on chosen CSS parser
 */
export interface CSSNode {
  type: string;
  // ... parser-specific fields
}
```

---

## Utility Types

```typescript
/**
 * Result of applying fixes
 */
export interface ApplyResult {
  /** Generated CSS */
  css: string;
  /** Fixes that were applied */
  applied_fixes: AppliedFix[];
  /** Conflicts detected */
  conflicts: FixConflict[];
}

/**
 * Filter options for issues panel
 */
export interface IssueFilters {
  /** Severities to show */
  severities: Severity[];
  /** Groups to show */
  groups: RuleGroup[];
  /** Fixability filter */
  fixability: Fixability[] | 'all';
  /** Search text */
  search: string;
}
```

---

## Type Guards

```typescript
/**
 * Check if issue has a safe fix
 */
export function hasSafeFix(issue: Issue): issue is Issue & { fix: Fix } {
  return (issue.fixability === 'safe (auto)' || issue.fixability === 'safe (force user to choose)') && issue.fix !== undefined;
}

/**
 * Check if issue has an LLM prompt
 */
export function hasLLMPrompt(issue: Issue): issue is Issue & { llm_prompt: LLMPrompt } {
  return issue.fixability === 'prompt' && issue.llm_prompt !== undefined;
}
```

---

## Validation

```typescript
/**
 * Validate an Issue object matches contracts
 */
export function validateIssue(issue: Issue): string[] {
  const errors: string[] = [];

  // Check fixability constraints
  if (issue.fixability === 'safe (auto)' || issue.fixability === 'safe (force user to choose)') {
    if (!issue.fix) {
      errors.push('fixability=safe requires fix to be present');
    } else if (issue.fix.patches.length === 0) {
      errors.push('fixability=safe requires patches.length >= 1');
    }
    if (issue.llm_prompt) {
      errors.push('fixability=safe must not have llm_prompt');
    }
  }

  if (issue.fixability === 'prompt') {
    if (!issue.llm_prompt) {
      errors.push('fixability=prompt requires llm_prompt to be present');
    }
    if (issue.fix) {
      errors.push('fixability=prompt must not have fix');
    }
  }

  if (issue.fixability === 'none') {
    if (issue.fix) {
      errors.push('fixability=none must not have fix');
    }
    if (issue.llm_prompt) {
      errors.push('fixability=none must not have llm_prompt');
    }
  }

  return errors;
}
```

---

END
