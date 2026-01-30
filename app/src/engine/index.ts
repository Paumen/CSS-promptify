/**
 * Analysis Engine Module
 * Coordinates parsing, rule evaluation, and output generation
 */

import { parse } from '../parser';
import { getAllRules } from '../rules';
import type {
  AnalysisResult,
  SessionConfig,
  Issue,
  Stats,
  Fix,
  ApplyResult,
  AppliedFix,
  FixConflict,
  Patch,
} from '../types';

/**
 * Calculate statistics for CSS string
 */
export function calculateStats(css: string): Stats {
  const lines = css.split('\n').length;
  const characters = css.length;
  // Token estimation: characters / 4 (per spec/DECISIONS.md)
  const tokens = Math.ceil(characters / 4);

  return { tokens, lines, characters };
}

/**
 * Analyze CSS and return issues
 */
export function analyze(css: string, config: SessionConfig): AnalysisResult {
  const { ast, errors } = parse(css);
  const issues: Issue[] = [];

  // Run all enabled rules
  const rules = getAllRules();
  for (const rule of rules) {
    const ruleConfig = config.rules[rule.meta.rule_id];
    const groupConfig = config.groups[rule.meta.group];

    // Check if rule is enabled
    const isEnabled =
      (ruleConfig?.enabled ?? rule.meta.enabled_by_default) &&
      (groupConfig?.enabled ?? true);

    if (isEnabled) {
      const ruleIssues = rule.run(ast, css, config);
      issues.push(...ruleIssues);
    }
  }

  return {
    issues,
    stats: calculateStats(css),
    parse_success: errors.length === 0,
    parse_errors: errors,
  };
}

/**
 * Check if two ranges overlap
 */
function rangesOverlap(a: Patch, b: Patch): boolean {
  const aStart = a.range.start.line * 10000 + a.range.start.column;
  const aEnd = a.range.end.line * 10000 + a.range.end.column;
  const bStart = b.range.start.line * 10000 + b.range.start.column;
  const bEnd = b.range.end.line * 10000 + b.range.end.column;

  return aStart < bEnd && bStart < aEnd;
}

/**
 * Detect conflicts between fixes
 */
export function detectConflicts(fixes: Fix[]): FixConflict[] {
  const conflicts: FixConflict[] = [];

  for (let i = 0; i < fixes.length; i++) {
    for (let j = i + 1; j < fixes.length; j++) {
      const fixA = fixes[i];
      const fixB = fixes[j];

      for (const patchA of fixA.patches) {
        for (const patchB of fixB.patches) {
          if (rangesOverlap(patchA, patchB)) {
            conflicts.push({
              fix_a: fixA.id,
              fix_b: fixB.id,
              overlapping_range: patchA.range,
              message: `Fixes ${fixA.id} and ${fixB.id} have overlapping patches`,
            });
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Apply selected fixes to original CSS
 * Returns new CSS string with fixes applied
 */
export function applyFixes(
  originalCss: string,
  issues: Issue[],
  selectedFixIds: string[],
  includeComments: boolean
): ApplyResult {
  // Get fixes for selected IDs
  const fixes: Fix[] = [];
  for (const issue of issues) {
    if (issue.fix && selectedFixIds.includes(issue.fix.id)) {
      fixes.push(issue.fix);
    }
  }

  // Detect conflicts
  const conflicts = detectConflicts(fixes);
  if (conflicts.length > 0) {
    // Return original CSS if there are conflicts
    return {
      css: originalCss,
      applied_fixes: [],
      conflicts,
    };
  }

  // Sort patches by position (reverse order for safe application)
  const allPatches: Array<{ patch: Patch; fix: Fix }> = [];
  for (const fix of fixes) {
    for (const patch of fix.patches) {
      allPatches.push({ patch, fix });
    }
  }
  allPatches.sort((a, b) => {
    const aPos = a.patch.range.start.line * 10000 + a.patch.range.start.column;
    const bPos = b.patch.range.start.line * 10000 + b.patch.range.start.column;
    return bPos - aPos; // Reverse order
  });

  // Apply patches
  let result = originalCss;
  const lines = result.split('\n');

  for (const { patch, fix } of allPatches) {
    const { start, end } = patch.range;

    // Convert to 0-based indices
    const startLine = start.line - 1;
    const endLine = end.line - 1;
    const startCol = start.column - 1;
    const endCol = end.column - 1;

    // Build replacement text
    let replacement = patch.text;
    if (includeComments && fix.comment.text) {
      replacement += ` /* ${fix.comment.text} */`;
    }

    // Apply the patch
    if (startLine === endLine) {
      const line = lines[startLine];
      lines[startLine] = line.slice(0, startCol) + replacement + line.slice(endCol);
    } else {
      // Multi-line patch
      const firstLine = lines[startLine].slice(0, startCol);
      const lastLine = lines[endLine].slice(endCol);
      lines.splice(startLine, endLine - startLine + 1, firstLine + replacement + lastLine);
    }
  }

  result = lines.join('\n');

  // Build applied fixes list
  const applied_fixes: AppliedFix[] = fixes.map((fix) => ({
    fix_id: fix.id,
    rule_id: fix.id.split('-')[0], // Extract rule_id from fix.id
    patches: fix.patches,
    comment: {
      was_inserted: includeComments && !!fix.comment.text,
      marker_prefix: 'cssreview:' as const,
      style: 'end_of_line' as const,
    },
  }));

  return {
    css: result,
    applied_fixes,
    conflicts: [],
  };
}
