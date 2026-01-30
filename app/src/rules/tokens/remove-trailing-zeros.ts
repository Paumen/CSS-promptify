/**
 * Rule: tokens/remove-trailing-zeros
 * Removes trailing zeros from decimal numbers (0.50 -> 0.5, 1.0 -> 1)
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

// Pattern to match numbers with trailing zeros after decimal
// Matches: 0.50, 1.00, 0.500, 1.0 (but not 10, 100, etc.)
const TRAILING_ZERO_PATTERN = /\b(\d+)\.(\d*[1-9])?(0+)\b/g;

/**
 * Remove trailing zeros from a decimal number
 */
function removeTrailingZeros(num: string): string {
  const parsed = parseFloat(num);
  // Use toString to get canonical form, then handle edge cases
  const result = parsed.toString();
  return result;
}

export const removeTrailingZerosRule: Rule = {
  meta: {
    rule_id: 'tokens/remove-trailing-zeros',
    group: 'tokens',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'decimal numbers with trailing zeros (0.50 -> 0.5, 1.0 -> 1)',
    autofix_notes: 'Remove trailing zeros while preserving numeric value',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const lines = source.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNum = lineIndex + 1;

      // Reset pattern for each line
      const pattern = new RegExp(TRAILING_ZERO_PATTERN.source, 'g');
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line)) !== null) {
        const fullMatch = match[0];
        const shortened = removeTrailingZeros(fullMatch);

        // Only create issue if we can actually shorten it
        if (shortened.length < fullMatch.length) {
          const column = match.index + 1;
          const location = rangeFromCoords(
            lineNum,
            column,
            lineNum,
            column + fullMatch.length
          );

          issues.push(
            createSafeIssue({
              ruleId: 'tokens/remove-trailing-zeros',
              group: 'tokens',
              severity: 'warning',
              message: `Trailing zeros in ${fullMatch} can be removed`,
              location,
              logic: {
                what: `Found ${fullMatch} with trailing zeros`,
                why: 'Trailing zeros add no value and waste tokens',
                when_safe: 'Always safe - numeric value is unchanged',
              },
              preview: shortened,
              patches: [createPatch(location, shortened)],
              commentText: `tokens/remove-trailing-zeros: was ${fullMatch}`,
            })
          );
        }
      }
    }

    return issues;
  },
};
