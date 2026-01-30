/**
 * Rule: format/indent-2-spaces
 * Ensures consistent 2-space indentation
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

export const indent2SpacesRule: Rule = {
  meta: {
    rule_id: 'format/indent-2-spaces',
    group: 'format',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'lines with leading whitespace that is not a multiple of 2 spaces',
    autofix_notes: 'Normalize indentation to nearest 2-space increment',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const lines = source.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const leadingWhitespaceMatch = line.match(/^( +)/);

      if (leadingWhitespaceMatch) {
        const spaces = leadingWhitespaceMatch[1];
        const spaceCount = spaces.length;

        // Check if it's not a multiple of 2
        if (spaceCount % 2 !== 0) {
          // Round to nearest 2-space increment
          const normalizedCount = Math.round(spaceCount / 2) * 2;
          const replacement = ' '.repeat(normalizedCount);

          const lineNum = i + 1; // 1-based
          const location = rangeFromCoords(lineNum, 1, lineNum, spaceCount + 1);

          issues.push(
            createSafeIssue({
              ruleId: 'format/indent-2-spaces',
              group: 'format',
              severity: 'warning',
              message: `Indentation is ${spaceCount} spaces, should be ${normalizedCount} (multiple of 2)`,
              location,
              logic: {
                what: `Found ${spaceCount}-space indentation`,
                why: 'Consistent 2-space indentation improves readability and LLM parsing accuracy',
                when_safe: 'Always safe - only affects whitespace',
              },
              preview: replacement,
              patches: [createPatch(location, replacement)],
              commentText: `format/indent-2-spaces: normalized from ${spaceCount} to ${normalizedCount} spaces`,
            })
          );
        }
      }
    }

    return issues;
  },
};
