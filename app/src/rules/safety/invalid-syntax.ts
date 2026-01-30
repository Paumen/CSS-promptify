/**
 * Rule: safety/invalid-syntax
 * Emit error on CSS parse failures
 */

import type { Rule, Issue, CSSNode, SessionConfig, ParseError } from '../../types';
import { createInfoIssue, rangeFromCoords } from '../utils';

/**
 * Create issues from parse errors
 * This is called from the engine, not the normal rule runner
 */
export function createParseErrorIssues(errors: ParseError[]): Issue[] {
  return errors.map((error) =>
    createInfoIssue({
      ruleId: 'safety/invalid-syntax',
      group: 'safety',
      severity: 'error',
      message: error.message,
      location: rangeFromCoords(
        error.location.line,
        error.location.column,
        error.location.line,
        error.location.column + 1
      ),
      logic: {
        what: `CSS syntax error: ${error.message}`,
        why: 'Invalid CSS will not be parsed correctly by browsers and may cause unexpected behavior',
        when_safe: 'Not auto-fixable - manual correction required',
      },
    })
  );
}

export const invalidSyntaxRule: Rule = {
  meta: {
    rule_id: 'safety/invalid-syntax',
    group: 'safety',
    severity: 'error',
    fixability: 'none',
    enabled_by_default: true,
    applies_to: 'all CSS content with syntax errors',
  },

  // Parse errors are handled separately by the engine
  // This rule doesn't run via normal AST traversal
  run(_ast: CSSNode, _source: string, _config: SessionConfig): Issue[] {
    return [];
  },
};
