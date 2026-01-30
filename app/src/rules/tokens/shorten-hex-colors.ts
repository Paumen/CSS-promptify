/**
 * Rule: tokens/shorten-hex-colors
 * Shortens 6-digit hex colors to 3-digit when possible
 */

import type { Rule, Issue, CSSNode, SessionConfig } from '../../types';
import {
  createSafeIssue,
  rangeFromCoords,
  createPatch,
} from '../utils';

// Pattern to match 6-digit hex colors (with optional alpha)
const HEX_6_PATTERN = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})(?:([0-9a-fA-F]{2}))?(?![0-9a-fA-F])/g;

/**
 * Check if a 2-digit hex can be shortened (e.g., "ff" -> "f")
 */
function canShorten(hex: string): boolean {
  return hex[0].toLowerCase() === hex[1].toLowerCase();
}

/**
 * Shorten a 2-digit hex to 1 digit
 */
function shorten(hex: string): string {
  return hex[0].toLowerCase();
}

export const shortenHexColorsRule: Rule = {
  meta: {
    rule_id: 'tokens/shorten-hex-colors',
    group: 'tokens',
    severity: 'warning',
    fixability: 'safe',
    enabled_by_default: true,
    applies_to: '6-digit hex colors that can be represented as 3-digit (#ffffff -> #fff)',
    autofix_notes: 'Only shorten when all three pairs can be shortened (e.g., #aabbcc -> #abc)',
  },

  run(_ast: CSSNode, source: string, _config: SessionConfig): Issue[] {
    const issues: Issue[] = [];

    // Find all hex colors
    const lines = source.split('\n');
    let charOffset = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNum = lineIndex + 1;

      // Reset regex for each line
      const pattern = new RegExp(HEX_6_PATTERN.source, 'gi');
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line)) !== null) {
        const fullMatch = match[0];
        const r = match[1];
        const g = match[2];
        const b = match[3];
        const a = match[4]; // Optional alpha

        // Check if we can shorten (all pairs must be shortenable)
        const canShortenRGB = canShorten(r) && canShorten(g) && canShorten(b);
        const canShortenAlpha = !a || canShorten(a);

        if (canShortenRGB && canShortenAlpha) {
          let shortened = `#${shorten(r)}${shorten(g)}${shorten(b)}`;
          if (a) {
            shortened += shorten(a);
          }

          const column = match.index + 1; // 1-based
          const location = rangeFromCoords(
            lineNum,
            column,
            lineNum,
            column + fullMatch.length
          );

          issues.push(
            createSafeIssue({
              ruleId: 'tokens/shorten-hex-colors',
              group: 'tokens',
              severity: 'warning',
              message: `Hex color ${fullMatch} can be shortened to ${shortened}`,
              location,
              logic: {
                what: `Found ${fullMatch} which can be written as ${shortened}`,
                why: 'Shorter hex colors save tokens and are equally precise',
                when_safe: 'Safe when all RGB (and optional A) pairs have identical digits',
              },
              preview: shortened,
              patches: [createPatch(location, shortened)],
              commentText: `tokens/shorten-hex-colors: was ${fullMatch}`,
            })
          );
        }
      }

      charOffset += line.length + 1;
    }

    return issues;
  },
};
