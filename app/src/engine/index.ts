/**
 * Analysis Engine Module
 * Coordinates parsing, rule evaluation, and output generation
 */

import { parse } from '../parser';
import { getAllRules, createParseErrorIssues } from '../rules';
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

  // Add parse errors as issues (safety/invalid-syntax)
  if (errors.length > 0) {
    const parseErrorIssues = createParseErrorIssues(errors);
    issues.push(...parseErrorIssues);
  }

  // Run all enabled rules
  const rules = getAllRules();
  for (const rule of rules) {
    // Skip invalid-syntax rule since we handle parse errors separately above
    if (rule.meta.rule_id === 'safety/invalid-syntax') {
      continue;
    }

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
 * Find the best position to insert a comment on a line.
 * Returns the index after the last semicolon, or before closing brace.
 */
function findCommentInsertionPoint(line: string): number {
  // Look for the last semicolon that's not inside a comment or string
  let lastSemicolon = -1;
  let inString = false;
  let stringChar = '';
  let inComment = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inComment) {
      if (char === '*' && nextChar === '/') {
        inComment = false;
        i++; // Skip the /
      }
      continue;
    }

    if (inString) {
      if (char === stringChar && line[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inComment = true;
      i++; // Skip the *
      continue;
    }

    if (char === ';') {
      lastSemicolon = i;
    }
  }

  if (lastSemicolon >= 0) {
    return lastSemicolon + 1;
  }

  // No semicolon found - insert before closing brace if present
  const trimmed = line.trimEnd();
  if (trimmed.endsWith('}')) {
    return line.lastIndexOf('}');
  }

  return line.trimEnd().length;
}

/**
 * Insert comments at the end of declarations on affected lines.
 * Comments are placed after the last semicolon on each line.
 */
function insertCommentsPostProcess(
  lines: string[],
  lineComments: Map<number, string[]>
): void {
  // Sort line indices in descending order to avoid index shifting issues
  const sortedLineIndices = Array.from(lineComments.keys()).sort((a, b) => b - a);

  for (const lineIndex of sortedLineIndices) {
    if (lineIndex < 0 || lineIndex >= lines.length) continue;

    const comments = lineComments.get(lineIndex);
    if (!comments || comments.length === 0) continue;

    const line = lines[lineIndex];
    const insertPoint = findCommentInsertionPoint(line);

    const before = line.slice(0, insertPoint);
    const after = line.slice(insertPoint);
    const commentText = comments.map((c) => `/* ${c} */`).join(' ');

    // Add space before comment if needed
    const needsSpace = before.length > 0 && !before.endsWith(' ');
    const afterTrimmed = after.trim();
    lines[lineIndex] = before + (needsSpace ? ' ' : '') + commentText + (afterTrimmed ? ' ' + afterTrimmed : '');
  }
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

  // Track comments to insert (keyed by FINAL line index after patches)
  const lineComments: Map<number, string[]> = new Map();

  // Apply patches
  const lines = originalCss.split('\n');

  for (const { patch, fix } of allPatches) {
    const { start, end } = patch.range;

    // Convert to 0-based indices
    const startLine = start.line - 1;
    const endLine = end.line - 1;
    const startCol = start.column - 1;
    const endCol = end.column - 1;

    // Validate range
    if (startLine < 0 || startLine >= lines.length) continue;
    if (endLine < 0 || endLine >= lines.length) continue;

    const replacement = patch.text;
    const replacementLines = replacement.split('\n');
    const newLineCount = replacementLines.length;

    // Apply the patch
    if (startLine === endLine) {
      const line = lines[startLine];
      lines[startLine] = line.slice(0, startCol) + replacement + line.slice(endCol);
    } else {
      // Multi-line patch
      const firstLine = lines[startLine].slice(0, startCol);
      const lastLine = lines[endLine].slice(endCol);

      if (newLineCount === 1) {
        // Multi-line to single-line
        lines.splice(startLine, endLine - startLine + 1, firstLine + replacement + lastLine);
      } else {
        // Multi-line to multi-line
        const newLines: string[] = [];
        for (let i = 0; i < replacementLines.length; i++) {
          if (i === 0) {
            newLines.push(firstLine + replacementLines[i]);
          } else if (i === replacementLines.length - 1) {
            newLines.push(replacementLines[i] + lastLine);
          } else {
            newLines.push(replacementLines[i]);
          }
        }
        lines.splice(startLine, endLine - startLine + 1, ...newLines);
      }
    }

    // Track comment for this line (if comments enabled)
    if (includeComments && fix.comment?.text) {
      // For multi-line replacements, put comment on the LAST line of the replacement
      const commentLineIndex = startLine + newLineCount - 1;
      const existing = lineComments.get(commentLineIndex) || [];
      existing.push(fix.comment.text);
      lineComments.set(commentLineIndex, existing);
    }
  }

  // Post-process: insert comments at end of declarations
  if (includeComments && lineComments.size > 0) {
    insertCommentsPostProcess(lines, lineComments);
  }

  const result = lines.join('\n');

  // Build applied fixes list
  const applied_fixes: AppliedFix[] = fixes.map((fix) => ({
    fix_id: fix.id,
    rule_id: fix.id.replace(/^fix-/, '').replace(/-\d+$/, ''), // Extract rule_id properly
    patches: fix.patches,
    comment: {
      was_inserted: includeComments && !!fix.comment?.text,
      marker_prefix: 'review:' as const,
      style: 'end_of_line' as const,
    },
  }));

  return {
    css: result,
    applied_fixes,
    conflicts: [],
  };
}
