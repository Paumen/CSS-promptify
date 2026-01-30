/**
 * Rule Utilities
 * Helper functions for creating issues and fixes
 */

import type {
  Issue,
  Fix,
  Patch,
  Range,
  Position,
  RuleLogic,
  Severity,
  RuleGroup,
  CommentConfig,
} from '../types';

let issueCounter = 0;

/**
 * Reset the issue counter (for testing)
 */
export function resetIssueCounter(): void {
  issueCounter = 0;
}

/**
 * Generate a unique issue ID
 */
export function generateIssueId(ruleId: string): string {
  return `${ruleId}-${++issueCounter}`;
}

/**
 * Generate a unique fix ID
 */
export function generateFixId(issueId: string): string {
  return `fix-${issueId}`;
}

/**
 * Create a position from line and column (1-based)
 */
export function pos(line: number, column: number): Position {
  return { line, column };
}

/**
 * Create a range from start and end positions
 */
export function range(start: Position, end: Position): Range {
  return { start, end };
}

/**
 * Create a range from line/column numbers
 */
export function rangeFromCoords(
  startLine: number,
  startCol: number,
  endLine: number,
  endCol: number
): Range {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  };
}

/**
 * Create a patch for replacing a range
 */
export function createPatch(range: Range, text: string): Patch {
  return {
    op: 'replace_range',
    range,
    text,
  };
}

/**
 * Create a comment config
 */
export function createComment(text: string): CommentConfig {
  return {
    enabled_by_ui: false,
    style: 'end_of_line',
    text: `cssreview: ${text}`,
  };
}

/**
 * Create a fix with patches
 */
export function createFix(
  issueId: string,
  preview: string,
  patches: Patch[],
  commentText: string
): Fix {
  return {
    id: generateFixId(issueId),
    kind: 'patch_set',
    preview,
    patches,
    comment: createComment(commentText),
  };
}

/**
 * Create an issue with a safe fix
 */
export function createSafeIssue(params: {
  ruleId: string;
  group: RuleGroup;
  severity: Severity;
  message: string;
  location: Range;
  logic: RuleLogic;
  preview: string;
  patches: Patch[];
  commentText: string;
}): Issue {
  const issueId = generateIssueId(params.ruleId);
  return {
    id: issueId,
    rule_id: params.ruleId,
    group: params.group,
    severity: params.severity,
    message: params.message,
    location: params.location,
    logic: params.logic,
    fixability: 'safe',
    fix: createFix(issueId, params.preview, params.patches, params.commentText),
  };
}

/**
 * Create an issue with no fix
 */
export function createInfoIssue(params: {
  ruleId: string;
  group: RuleGroup;
  severity: Severity;
  message: string;
  location: Range;
  logic: RuleLogic;
}): Issue {
  return {
    id: generateIssueId(params.ruleId),
    rule_id: params.ruleId,
    group: params.group,
    severity: params.severity,
    message: params.message,
    location: params.location,
    logic: params.logic,
    fixability: 'none',
  };
}

/**
 * Convert css-tree location to our Range type
 */
export function cssTreeLocToRange(loc: {
  start: { line: number; column: number };
  end: { line: number; column: number };
}): Range {
  return {
    start: { line: loc.start.line, column: loc.start.column + 1 }, // css-tree uses 0-based columns
    end: { line: loc.end.line, column: loc.end.column + 1 },
  };
}

/**
 * Find all occurrences of a pattern in source text
 */
export function findAllMatches(
  source: string,
  pattern: RegExp
): Array<{ match: string; index: number; line: number; column: number }> {
  const results: Array<{ match: string; index: number; line: number; column: number }> = [];
  const lines = source.split('\n');

  let charIndex = 0;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const linePattern = new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g');
    let match: RegExpExecArray | null;

    while ((match = linePattern.exec(line)) !== null) {
      results.push({
        match: match[0],
        index: charIndex + match.index,
        line: lineIndex + 1, // 1-based
        column: match.index + 1, // 1-based
      });
    }

    charIndex += line.length + 1; // +1 for newline
  }

  return results;
}

/**
 * Get the end position after a string starting at a position
 */
export function getEndPosition(start: Position, text: string): Position {
  const lines = text.split('\n');
  if (lines.length === 1) {
    return { line: start.line, column: start.column + text.length };
  }
  return {
    line: start.line + lines.length - 1,
    column: lines[lines.length - 1].length + 1,
  };
}
