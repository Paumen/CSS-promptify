/**
 * Rule: format/normalize-spaces
 * Ensures consistent spacing around colons, braces, and semicolons
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

export const normalizeSpacesRule: Rule = {
  meta: {
    rule_id: 'format/normalize-spaces',
    group: 'format',
    severity: 'info',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: 'spacing around colons, braces, and semicolons',
    autofix_notes: 'Normalize to single space after colon, proper brace spacing',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];
    const lines = source.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNum = lineIndex + 1;

      // Check for property:value without space (most common issue)
      const colonNoSpace = /([a-zA-Z-]+):([^\s:;{}/])/g;
      let match: RegExpExecArray | null;

      while ((match = colonNoSpace.exec(line)) !== null) {
        // Skip URLs (http:// https://) and pseudo-selectors (::before)
        if (match[2] === '/' || match[1].endsWith('http') || match[1].endsWith('https')) {
          continue;
        }
        // Skip if this looks like a pseudo-selector
        if (match[0].includes('::') || /^:[\w-]/.test(match[0])) {
          continue;
        }

        const column = match.index + match[1].length + 1; // Position of colon
        const location = rangeFromCoords(lineNum, column, lineNum, column + 1);

        issues.push(
          createSafeIssue({
            ruleId: 'format/normalize-spaces',
            group: 'format',
            severity: 'info',
            message: 'Missing space after colon in declaration',
            location,
            logic: {
              what: 'Found colon without space after it',
              why: 'Consistent spacing improves readability and LLM parsing',
              when_safe: 'Always safe - only affects whitespace',
            },
            preview: ': ',
            patches: [createPatch(location, ': ')],
            commentText: 'format/normalize-spaces: added space after colon',
          })
        );
      }

      // Check for multiple spaces after colon
      const multiSpace = /:\s{2,}/g;
      while ((match = multiSpace.exec(line)) !== null) {
        const column = match.index + 1;
        const location = rangeFromCoords(lineNum, column, lineNum, column + match[0].length);

        issues.push(
          createSafeIssue({
            ruleId: 'format/normalize-spaces',
            group: 'format',
            severity: 'info',
            message: 'Multiple spaces after colon',
            location,
            logic: {
              what: `Found ${match[0].length - 1} spaces after colon`,
              why: 'Consistent single space improves readability',
              when_safe: 'Always safe - only affects whitespace',
            },
            preview: ': ',
            patches: [createPatch(location, ': ')],
            commentText: 'format/normalize-spaces: normalized to single space',
          })
        );
      }
    }

    return issues;
  },
};
