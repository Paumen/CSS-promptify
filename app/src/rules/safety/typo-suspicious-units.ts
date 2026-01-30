/**
 * Rule: safety/typo-suspicious-units-and-tokens
 * Catch common typos in units and color tokens: 2xp, 1x, pX, #fffffg, etc.
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import { createInfoIssue, findAllMatches, rangeFromCoords } from '../utils';

// Suspicious unit patterns (case-insensitive matching)
const SUSPICIOUS_UNIT_PATTERNS = [
  // Transposed units
  { pattern: /\b(\d+(?:\.\d+)?)(xp|xP|Xp|XP)\b/g, message: 'Suspicious unit "xp" - did you mean "px"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(ep|eP|Ep|EP)\b/g, message: 'Suspicious unit "ep" - did you mean "em" or "ex"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(me|mE|Me|ME)\b/g, message: 'Suspicious unit "me" - did you mean "em"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(xv|xV|Xv|XV)h?\b/g, message: 'Suspicious unit - did you mean "vw" or "vh"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(hv|hV|Hv|HV)\b/g, message: 'Suspicious unit "hv" - did you mean "vh"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(wv|wV|Wv|WV)\b/g, message: 'Suspicious unit "wv" - did you mean "vw"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(re|rE|Re|RE)m\b/g, message: 'Suspicious unit "rem" spelling - verify correct' },

  // Single letter that might be truncated unit
  { pattern: /\b(\d+(?:\.\d+)?)(x|X)\b(?!\s*[,;{})])/g, message: 'Suspicious single character "x" after number - did you mean "px"?' },
  { pattern: /\b(\d+(?:\.\d+)?)(p|P)\b(?!\s*[,;{})])/g, message: 'Suspicious single character "p" after number - did you mean "px" or "%"?' },

  // Mixed case units (valid CSS is case-insensitive, but mixed case is suspicious)
  { pattern: /\b(\d+(?:\.\d+)?)(pX|Px)\b/g, message: 'Mixed case unit "pX" or "Px" - use consistent lowercase "px"' },
  { pattern: /\b(\d+(?:\.\d+)?)(eM|Em)\b/g, message: 'Mixed case unit - use consistent lowercase "em"' },
  { pattern: /\b(\d+(?:\.\d+)?)(rEm|ReM|REM)\b/g, message: 'Mixed case unit - use consistent lowercase "rem"' },

  // Zero with suspicious suffixes
  { pattern: /\b0(xp|ep|me|hv|wv)\b/gi, message: 'Suspicious unit on zero value' },
];

// Invalid hex color patterns
const INVALID_HEX_PATTERNS = [
  // Hex colors with invalid characters (g-z except in functions)
  { pattern: /#[0-9a-fA-F]*[g-zG-Z][0-9a-fA-F]*/g, message: 'Invalid hex color - contains non-hex character' },
  // Hex colors with wrong length (not 3, 4, 6, or 8)
  { pattern: /#([0-9a-fA-F]{1,2}|[0-9a-fA-F]{5}|[0-9a-fA-F]{7}|[0-9a-fA-F]{9,})(?![0-9a-fA-F])/g, message: 'Invalid hex color length - must be 3, 4, 6, or 8 characters' },
];

// Suspicious numeric patterns
const SUSPICIOUS_NUMBER_PATTERNS = [
  // Double decimal points
  { pattern: /\b\d+\.\d+\.\d+/g, message: 'Multiple decimal points in number' },
  // Missing space between values
  { pattern: /\b(\d+)(px|em|rem|%|vh|vw)(\d)/g, message: 'Missing space between values' },
];

export const typoSuspiciousUnitsRule: Rule = {
  meta: {
    rule_id: 'safety/typo-suspicious-units-and-tokens',
    group: 'safety',
    severity: 'error',
    fixability: 'none',
    enabled_by_default: true,
    applies_to: 'all CSS values with units or color tokens',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    // Check suspicious unit patterns
    for (const { pattern, message } of SUSPICIOUS_UNIT_PATTERNS) {
      const matches = findAllMatches(source, pattern);
      for (const match of matches) {
        issues.push(
          createInfoIssue({
            ruleId: 'safety/typo-suspicious-units-and-tokens',
            group: 'safety',
            severity: 'error',
            message: `${message}: "${match.match}"`,
            location: rangeFromCoords(
              match.line,
              match.column,
              match.line,
              match.column + match.match.length
            ),
            logic: {
              what: `Found suspicious token: "${match.match}"`,
              why: 'This appears to be a typo that will cause the declaration to be ignored by browsers',
              when_safe: 'Manual review required - verify intended value',
            },
          })
        );
      }
    }

    // Check invalid hex patterns
    for (const { pattern, message } of INVALID_HEX_PATTERNS) {
      const matches = findAllMatches(source, pattern);
      for (const match of matches) {
        // Skip if it looks like it's inside a function (like linear-gradient)
        // by checking if there's a letter before the #
        const charBeforeIndex = match.index - 1;
        if (charBeforeIndex >= 0 && /[a-zA-Z]/.test(source[charBeforeIndex])) {
          continue;
        }

        issues.push(
          createInfoIssue({
            ruleId: 'safety/typo-suspicious-units-and-tokens',
            group: 'safety',
            severity: 'error',
            message: `${message}: "${match.match}"`,
            location: rangeFromCoords(
              match.line,
              match.column,
              match.line,
              match.column + match.match.length
            ),
            logic: {
              what: `Invalid hex color format: "${match.match}"`,
              why: 'Invalid hex colors will be ignored by browsers, causing styles not to apply',
              when_safe: 'Manual correction required - fix the hex color value',
            },
          })
        );
      }
    }

    // Check suspicious number patterns
    for (const { pattern, message } of SUSPICIOUS_NUMBER_PATTERNS) {
      const matches = findAllMatches(source, pattern);
      for (const match of matches) {
        issues.push(
          createInfoIssue({
            ruleId: 'safety/typo-suspicious-units-and-tokens',
            group: 'safety',
            severity: 'error',
            message: `${message}: "${match.match}"`,
            location: rangeFromCoords(
              match.line,
              match.column,
              match.line,
              match.column + match.match.length
            ),
            logic: {
              what: `Suspicious numeric pattern: "${match.match}"`,
              why: 'This appears to be malformed and will likely cause unexpected behavior',
              when_safe: 'Manual review required - verify intended value',
            },
          })
        );
      }
    }

    return issues;
  },
};
